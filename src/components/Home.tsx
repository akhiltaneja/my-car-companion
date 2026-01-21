import { useMemo, useState } from 'react';
import { XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar } from 'recharts';
import { Expense, FuelExpense, UserProfile, EXPENSE_LABELS, Vehicle } from '@/types';
import { format } from 'date-fns';
import { TrendingUp, Fuel, Calendar, ChevronDown, ChevronUp, Zap, Droplet, Car, IndianRupee } from 'lucide-react';

interface HomeProps {
  expenses: Expense[];
  profile: UserProfile | null;
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  viewMode: 'individual' | 'combined';
  onViewModeChange: (mode: 'individual' | 'combined') => void;
}

const typeColors: Record<string, string> = {
  fuel: '#10b981',
  insurance: '#3b82f6',
  service: '#f59e0b',
  toll: '#8b5cf6',
  challan: '#f43f5e',
};

export function Home({ expenses, profile, vehicles, selectedVehicle, viewMode, onViewModeChange }: HomeProps) {
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

  // Filter expenses based on view mode
  const filteredExpenses = useMemo(() => {
    if (viewMode === 'combined' || !selectedVehicle) {
      return expenses;
    }
    return expenses.filter(e => e.vehicle_id === selectedVehicle.id);
  }, [expenses, selectedVehicle, viewMode]);

  const stats = useMemo(() => {
    const fuelEntries = filteredExpenses.filter((e): e is FuelExpense => e.type === 'fuel');
    const allExpenses = filteredExpenses;

    const totalSpent = allExpenses.reduce((sum, e) => sum + Number(e.total_cost), 0);
    const totalFuel = fuelEntries.reduce((sum, e) => sum + Number(e.liters), 0);

    const sortedFuel = [...fuelEntries].sort((a, b) => a.odometer - b.odometer);
    let totalKm = 0;
    if (sortedFuel.length >= 2) {
      totalKm = sortedFuel[sortedFuel.length - 1].odometer - sortedFuel[0].odometer;
    }
    const avgEfficiency = totalKm > 0 && totalFuel > 0 ? totalKm / totalFuel : 0;

    const maxOdometer = Math.max(...allExpenses.map(e => e.odometer), 0);
    const minOdometer = Math.min(...allExpenses.map(e => e.odometer), 0);
    const odometerRange = maxOdometer - minOdometer;

    // Calculate total ownership cost including vehicle price
    const vehiclePrice = viewMode === 'individual' && selectedVehicle 
      ? Number(selectedVehicle.on_road_price) 
      : vehicles.reduce((sum, v) => sum + Number(v.on_road_price), 0);
    
    const totalOwnershipCost = totalSpent + vehiclePrice;
    const costPerKm = odometerRange > 0 ? totalOwnershipCost / odometerRange : 0;

    const now = new Date();
    const thisMonth = allExpenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const thisMonthSpent = thisMonth.reduce((sum, e) => sum + Number(e.total_cost), 0);
    const thisMonthFuel = thisMonth.filter((e): e is FuelExpense => e.type === 'fuel');
    const thisMonthLiters = thisMonthFuel.reduce((sum, e) => sum + Number(e.liters), 0);

    const avgPrice = fuelEntries.length > 0
      ? fuelEntries.reduce((sum, e) => sum + Number(e.price_per_liter), 0) / fuelEntries.length
      : 0;

    // Current year stats
    const currentYear = new Date().getFullYear();
    const thisYearExpenses = allExpenses.filter(e => new Date(e.date).getFullYear() === currentYear);
    const thisYearSpent = thisYearExpenses.reduce((sum, e) => sum + Number(e.total_cost), 0);

    const monthlyData: Record<string, { month: string, monthKey: string, amount: number, entries: Expense[] }> = {};
    allExpenses.forEach(e => {
      const d = new Date(e.date);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = format(d, 'MMM yyyy');
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthLabel, monthKey, amount: 0, entries: [] };
      }
      monthlyData[monthKey].amount += Number(e.total_cost);
      monthlyData[monthKey].entries.push(e);
    });
    const monthlyChartData = Object.values(monthlyData).sort((a, b) => a.monthKey.localeCompare(b.monthKey));

    return {
      totalSpent,
      totalFuel,
      avgEfficiency,
      costPerKm,
      thisMonthSpent,
      thisMonthLiters,
      avgPrice,
      monthlyChartData,
      odometerRange,
      thisYearSpent,
      vehiclePrice,
      totalOwnershipCost,
    };
  }, [filteredExpenses, selectedVehicle, vehicles, viewMode]);

  const toggleMonth = (monthKey: string) => {
    setExpandedMonth(expandedMonth === monthKey ? null : monthKey);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-mint/40 to-background pb-24">
      {/* Header */}
      <div className="pt-10 pb-4 px-5">
        <p className="text-sm text-muted-foreground">Welcome back,</p>
        <h1 className="text-2xl font-black text-foreground">{profile?.name || 'Driver'}</h1>
        
        {/* View Mode Toggle */}
        {vehicles.length > 1 && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => onViewModeChange('individual')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border-2 border-foreground transition-all ${
                viewMode === 'individual' ? 'bg-mint shadow-brutal-sm' : 'bg-card'
              }`}
            >
              Per Vehicle
            </button>
            <button
              onClick={() => onViewModeChange('combined')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border-2 border-foreground transition-all ${
                viewMode === 'combined' ? 'bg-mint shadow-brutal-sm' : 'bg-card'
              }`}
            >
              All Vehicles
            </button>
          </div>
        )}

        {/* Current Vehicle Display */}
        {viewMode === 'individual' && selectedVehicle && (
          <div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
            <Car className="w-4 h-4" />
            <span>{selectedVehicle.manufacturer} {selectedVehicle.model}</span>
          </div>
        )}
      </div>

      <div className="px-4 space-y-4">
        {/* Hero Running Cost */}
        <div className="bg-gradient-to-br from-mint to-emerald-400 rounded-3xl p-6 border-3 border-foreground shadow-brutal">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-foreground/80" />
            <span className="text-sm font-bold text-foreground/80">Total Ownership Cost</span>
          </div>
          <div className="text-center py-2">
            <span className="text-5xl font-black text-foreground">₹{stats.costPerKm.toFixed(2)}</span>
            <p className="text-base font-bold text-foreground/70 mt-1">per kilometer</p>
          </div>
          {stats.odometerRange > 0 && (
            <p className="text-center text-xs text-foreground/60 mt-2">
              Based on {stats.odometerRange.toLocaleString()} km traveled
            </p>
          )}
          {stats.vehiclePrice > 0 && (
            <p className="text-center text-xs text-foreground/60 mt-1">
              Including ₹{(stats.vehiclePrice / 100000).toFixed(1)}L vehicle cost
            </p>
          )}
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-2xl p-4 text-center shadow-sm border-2 border-border">
            <div className="w-10 h-10 mx-auto mb-2 bg-lavender rounded-xl flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-foreground" />
            </div>
            <p className="text-lg font-black text-foreground">₹{(stats.thisYearSpent / 1000).toFixed(1)}k</p>
            <p className="text-[10px] font-medium text-muted-foreground">This Year</p>
          </div>
          <div className="bg-card rounded-2xl p-4 text-center shadow-sm border-2 border-border">
            <div className="w-10 h-10 mx-auto mb-2 bg-sky rounded-xl flex items-center justify-center">
              <Droplet className="w-5 h-5 text-foreground" />
            </div>
            <p className="text-lg font-black text-foreground">{stats.totalFuel.toFixed(0)}L</p>
            <p className="text-[10px] font-medium text-muted-foreground">Total Fuel</p>
          </div>
          <div className="bg-card rounded-2xl p-4 text-center shadow-sm border-2 border-border">
            <div className="w-10 h-10 mx-auto mb-2 bg-orange rounded-xl flex items-center justify-center">
              <Fuel className="w-5 h-5 text-foreground" />
            </div>
            <p className="text-lg font-black text-foreground">{stats.avgEfficiency.toFixed(1)}</p>
            <p className="text-[10px] font-medium text-muted-foreground">km/L Avg</p>
          </div>
        </div>

        {/* Total Spent Card */}
        <div className="bg-gradient-to-br from-orange/60 to-amber-100 rounded-2xl p-5 border-2 border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground mb-1">Total Spent (All Time)</p>
              <p className="text-3xl font-black text-foreground">₹{stats.totalSpent.toLocaleString('en-IN')}</p>
            </div>
            <div className="w-12 h-12 bg-orange rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-foreground" />
            </div>
          </div>
        </div>

        {/* Monthly Expense Chart */}
        {stats.monthlyChartData.length > 0 && (
          <div className="bg-card rounded-2xl p-5 shadow-sm border-2 border-border">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-lavender" />
              Monthly Expenses
            </h3>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthlyChartData.slice(-6)}>
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 10, fill: 'currentColor' }} 
                    tickFormatter={(v) => v.split(' ')[0]}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: 'currentColor' }} 
                    tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`}
                    width={40}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Spent']}
                    contentStyle={{ 
                      background: 'hsl(var(--card))', 
                      border: '2px solid hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '4px 4px 0 hsl(var(--foreground))',
                      fontWeight: 600,
                      fontSize: '12px'
                    }}
                  />
                  <Bar 
                    dataKey="amount" 
                    fill="url(#barGradient)"
                    radius={[8, 8, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--mint))" />
                      <stop offset="100%" stopColor="hsl(var(--lavender))" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* This Month Summary */}
        <div className="bg-gradient-to-br from-pink/60 to-rose-100 rounded-2xl p-5 border-2 border-border">
          <h3 className="font-bold text-foreground mb-3">This Month</h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-3xl font-black text-foreground">₹{stats.thisMonthSpent.toLocaleString('en-IN')}</p>
              <p className="text-sm text-muted-foreground">{stats.thisMonthLiters.toFixed(1)} liters filled</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-foreground">₹{stats.avgPrice.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">avg per liter</p>
            </div>
          </div>
        </div>

        {/* Month-wise Log */}
        {stats.monthlyChartData.length > 0 && (
          <div className="bg-card rounded-2xl p-5 shadow-sm border-2 border-border">
            <h3 className="font-bold text-foreground mb-4">Monthly Log</h3>
            <div className="space-y-2">
              {stats.monthlyChartData.slice().reverse().map((monthData) => (
                <div key={monthData.monthKey} className="rounded-xl overflow-hidden border-2 border-border">
                  <button
                    onClick={() => toggleMonth(monthData.monthKey)}
                    className="w-full flex items-center justify-between p-3 bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm text-foreground">{monthData.month}</span>
                      <span className="text-xs text-muted-foreground bg-card px-2 py-0.5 rounded-full border">
                        {monthData.entries.length} entries
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-foreground">₹{monthData.amount.toLocaleString('en-IN')}</span>
                      {expandedMonth === monthData.monthKey ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>
                  
                  {expandedMonth === monthData.monthKey && (
                    <div className="p-3 space-y-2 bg-card">
                      {monthData.entries
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((entry) => (
                          <div 
                            key={entry.id}
                            className="flex items-center justify-between p-2.5 rounded-lg bg-muted"
                          >
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: typeColors[entry.type] }}
                              />
                              <span className="text-xs font-bold text-foreground">{format(new Date(entry.date), 'dd')}</span>
                              <span className="text-xs font-medium text-muted-foreground">{EXPENSE_LABELS[entry.type]}</span>
                            </div>
                            <span className="text-sm font-black text-foreground">₹{Number(entry.total_cost).toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {filteredExpenses.length === 0 && (
          <div className="bg-card rounded-2xl p-8 text-center border-2 border-border">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <Fuel className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="font-bold text-foreground mb-1">No expenses yet</p>
            <p className="text-sm text-muted-foreground">
              Tap the + button to add your first expense
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

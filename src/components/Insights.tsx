import { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar } from 'recharts';
import { Expense, FuelEntry, EXPENSE_COLORS, EXPENSE_LABELS } from '@/types';
import { format } from 'date-fns';
import { TrendingUp, Fuel, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

interface InsightsProps {
  expenses: Expense[];
}

export function Insights({ expenses }: InsightsProps) {
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

  const stats = useMemo(() => {
    const fuelEntries = expenses.filter((e): e is FuelEntry => e.type === 'fuel');
    const allExpenses = expenses;

    const totalSpent = allExpenses.reduce((sum, e) => sum + e.totalCost, 0);
    const totalFuel = fuelEntries.reduce((sum, e) => sum + e.liters, 0);

    // Calculate efficiency
    const sortedFuel = [...fuelEntries].sort((a, b) => a.odometer - b.odometer);
    let totalKm = 0;
    if (sortedFuel.length >= 2) {
      totalKm = sortedFuel[sortedFuel.length - 1].odometer - sortedFuel[0].odometer;
    }
    const avgEfficiency = totalKm > 0 && totalFuel > 0 ? totalKm / totalFuel : 0;

    // Cost per km
    const maxOdometer = Math.max(...allExpenses.map(e => e.odometer), 0);
    const minOdometer = Math.min(...allExpenses.map(e => e.odometer), 0);
    const odometerRange = maxOdometer - minOdometer;
    const costPerKm = odometerRange > 0 ? totalSpent / odometerRange : 0;

    // This month
    const now = new Date();
    const thisMonth = allExpenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const thisMonthSpent = thisMonth.reduce((sum, e) => sum + e.totalCost, 0);
    const thisMonthFuel = thisMonth.filter((e): e is FuelEntry => e.type === 'fuel');
    const thisMonthLiters = thisMonthFuel.reduce((sum, e) => sum + e.liters, 0);
    const thisMonthFills = thisMonthFuel.length;

    // Price info
    const avgPrice = fuelEntries.length > 0
      ? fuelEntries.reduce((sum, e) => sum + e.pricePerLiter, 0) / fuelEntries.length
      : 0;
    const lastPrice = fuelEntries.length > 0
      ? [...fuelEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].pricePerLiter
      : 0;

    // Monthly data for chart and log
    const monthlyData: Record<string, { month: string, monthKey: string, amount: number, entries: Expense[] }> = {};
    allExpenses.forEach(e => {
      const d = new Date(e.date);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = format(d, 'MMM yyyy');
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthLabel, monthKey, amount: 0, entries: [] };
      }
      monthlyData[monthKey].amount += e.totalCost;
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
      thisMonthFills,
      avgPrice,
      lastPrice,
      monthlyChartData,
    };
  }, [expenses]);

  const toggleMonth = (monthKey: string) => {
    setExpandedMonth(expandedMonth === monthKey ? null : monthKey);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-lavender/40 to-background pb-24">
      {/* Header */}
      <div className="pt-10 pb-4 px-5">
        <h1 className="text-2xl font-black text-foreground">Insights</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your expense analytics</p>
      </div>

      <div className="px-4 space-y-4">
        {/* Cost Per KM - Hero Stat */}
        <div className="card-brutal p-5 bg-gradient-to-br from-stat-mint to-stat-yellow animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-foreground/70" />
            <span className="text-sm font-bold text-foreground/70">Running Cost</span>
          </div>
          <div className="text-center py-2">
            <span className="text-5xl font-black">₹{stats.costPerKm.toFixed(2)}</span>
            <p className="text-base font-bold text-muted-foreground mt-1">per km</p>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="stat-card bg-stat-yellow text-center">
            <p className="text-lg font-black">₹{(stats.totalSpent / 1000).toFixed(1)}k</p>
            <p className="text-[10px] font-bold text-muted-foreground">Total Spent</p>
          </div>
          <div className="stat-card bg-stat-mint text-center">
            <p className="text-lg font-black">{stats.totalFuel.toFixed(0)}L</p>
            <p className="text-[10px] font-bold text-muted-foreground">Total Fuel</p>
          </div>
          <div className="stat-card bg-stat-lavender text-center">
            <p className="text-lg font-black">{stats.avgEfficiency.toFixed(1)}</p>
            <p className="text-[10px] font-bold text-muted-foreground">km/L Avg</p>
          </div>
        </div>

        {/* Monthly Chart */}
        {stats.monthlyChartData.length > 0 && (
          <div className="card-brutal p-4 animate-fade-in">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Monthly Expenses
            </h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthlyChartData.slice(-6)}>
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 10, fontWeight: 600 }} 
                    tickFormatter={(v) => v.split(' ')[0]}
                  />
                  <YAxis 
                    tick={{ fontSize: 10 }} 
                    tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`}
                    width={45}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Spent']}
                    contentStyle={{ 
                      background: 'white', 
                      border: '2px solid black', 
                      borderRadius: '12px',
                      fontWeight: 600,
                      fontSize: '12px'
                    }}
                  />
                  <Bar 
                    dataKey="amount" 
                    fill="hsl(var(--mint))"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* This Month */}
        <div className="card-brutal p-4 animate-fade-in">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <Fuel className="w-4 h-4" />
            This Month
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="stat-card bg-stat-pink text-center">
              <p className="text-xl font-black">₹{stats.thisMonthSpent.toLocaleString('en-IN')}</p>
              <p className="text-[10px] font-bold text-muted-foreground">Spent</p>
            </div>
            <div className="stat-card bg-stat-mint text-center">
              <p className="text-xl font-black">{stats.thisMonthLiters.toFixed(1)}</p>
              <p className="text-[10px] font-bold text-muted-foreground">Liters</p>
            </div>
            <div className="stat-card bg-stat-peach text-center">
              <p className="text-xl font-black">{stats.thisMonthFills}</p>
              <p className="text-[10px] font-bold text-muted-foreground">Fills</p>
            </div>
          </div>
        </div>

        {/* Month-wise Log */}
        <div className="card-brutal p-4 animate-fade-in">
          <h3 className="font-bold mb-3">Monthly Log</h3>
          <div className="space-y-2">
            {stats.monthlyChartData.slice().reverse().map((monthData) => (
              <div key={monthData.monthKey} className="border-2 border-foreground rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleMonth(monthData.monthKey)}
                  className="w-full flex items-center justify-between p-3 bg-stat-lavender/50 hover:bg-stat-lavender transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm">{monthData.month}</span>
                    <span className="text-xs text-muted-foreground">
                      {monthData.entries.length} entries
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm">₹{monthData.amount.toLocaleString('en-IN')}</span>
                    {expandedMonth === monthData.monthKey ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
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
                          className={`flex items-center justify-between p-2 rounded-lg ${EXPENSE_COLORS[entry.type]}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold">{format(new Date(entry.date), 'dd')}</span>
                            <span className="text-xs font-medium">{EXPENSE_LABELS[entry.type]}</span>
                          </div>
                          <span className="text-sm font-black">₹{entry.totalCost.toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Price Info */}
        <div className="grid grid-cols-2 gap-3 pb-4">
          <div className="stat-card bg-stat-yellow">
            <p className="text-[10px] font-bold text-muted-foreground">Avg Price/L</p>
            <p className="text-lg font-black">₹{stats.avgPrice.toFixed(2)}</p>
          </div>
          <div className="stat-card bg-stat-lavender">
            <p className="text-[10px] font-bold text-muted-foreground">Last Price/L</p>
            <p className="text-lg font-black">₹{stats.lastPrice.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

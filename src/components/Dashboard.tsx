import { useMemo } from 'react';
import { TrendingUp, Fuel, Calendar, IndianRupee, Car } from 'lucide-react';
import { Expense, FuelExpense, UserProfile } from '@/types';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import { format } from 'date-fns';

interface DashboardProps {
  expenses: Expense[];
  profile: UserProfile | null;
}

export function Dashboard({ expenses, profile }: DashboardProps) {
  const stats = useMemo(() => {
    const fuelEntries = expenses.filter((e): e is FuelExpense => e.type === 'fuel');
    const totalSpent = expenses.reduce((sum, e) => sum + Number(e.total_cost), 0);
    const totalFuel = fuelEntries.reduce((sum, e) => sum + Number(e.liters), 0);

    // Calculate cost per km
    const maxOdometer = Math.max(...expenses.map(e => e.odometer), 0);
    const minOdometer = Math.min(...expenses.map(e => e.odometer), 0);
    const odometerRange = maxOdometer - minOdometer;
    const costPerKm = odometerRange > 0 ? totalSpent / odometerRange : 0;

    // Current year stats
    const currentYear = new Date().getFullYear();
    const thisYearExpenses = expenses.filter(e => new Date(e.date).getFullYear() === currentYear);
    const thisYearSpent = thisYearExpenses.reduce((sum, e) => sum + Number(e.total_cost), 0);

    // Monthly data for chart
    const monthlyData: Record<string, number> = {};
    expenses.forEach(e => {
      const d = new Date(e.date);
      const monthKey = format(d, 'MMM');
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + Number(e.total_cost);
    });
    const chartData = Object.entries(monthlyData)
      .map(([month, amount]) => ({ month, amount }))
      .slice(-6);

    return { totalSpent, totalFuel, costPerKm, thisYearSpent, chartData, odometerRange };
  }, [expenses]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-mint/40 to-background pb-24">
      {/* Header */}
      <div className="pt-10 pb-4 px-5">
        <p className="text-sm text-muted-foreground">Welcome back,</p>
        <h1 className="text-2xl font-black text-foreground">{profile?.name || 'Driver'}</h1>
        {profile?.car_brand && profile?.car_name && (
          <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
            <Car className="w-4 h-4" />
            <span>{profile.car_brand} {profile.car_name}</span>
          </div>
        )}
      </div>

      <div className="px-4 space-y-4">
        {/* Hero Cost per KM */}
        <div className="bg-gradient-to-br from-mint to-emerald-400 rounded-3xl p-6 border-3 border-foreground shadow-brutal">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-foreground/80" />
            <span className="text-sm font-bold text-foreground/80">Running Cost</span>
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
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-2xl p-4 border-2 border-border">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-lavender rounded-lg flex items-center justify-center">
                <IndianRupee className="w-4 h-4 text-foreground" />
              </div>
              <span className="text-xs font-bold text-muted-foreground">This Year</span>
            </div>
            <p className="text-2xl font-black text-foreground">₹{(stats.thisYearSpent / 1000).toFixed(1)}k</p>
          </div>
          
          <div className="bg-card rounded-2xl p-4 border-2 border-border">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-sky rounded-lg flex items-center justify-center">
                <Fuel className="w-4 h-4 text-foreground" />
              </div>
              <span className="text-xs font-bold text-muted-foreground">Total Fuel</span>
            </div>
            <p className="text-2xl font-black text-foreground">{stats.totalFuel.toFixed(0)} L</p>
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
              <IndianRupee className="w-6 h-6 text-foreground" />
            </div>
          </div>
        </div>

        {/* Monthly Chart */}
        {stats.chartData.length > 0 && (
          <div className="bg-card rounded-2xl p-5 border-2 border-border">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-lavender" />
              <h3 className="font-bold text-foreground">Monthly Overview</h3>
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chartData}>
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 10, fontWeight: 600 }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Spent']}
                    contentStyle={{ 
                      background: 'hsl(var(--card))', 
                      border: '2px solid hsl(var(--border))',
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

        {/* Empty state */}
        {expenses.length === 0 && (
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

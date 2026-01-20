import { useMemo, useState } from 'react';
import { XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar } from 'recharts';
import { Expense, FuelExpense, EXPENSE_LABELS } from '@/types';
import { format } from 'date-fns';
import { TrendingUp, Fuel, Calendar, ChevronDown, ChevronUp, Zap, Droplet } from 'lucide-react';

interface InsightsProps {
  expenses: Expense[];
}

const typeColors: Record<string, string> = {
  fuel: '#10b981',
  insurance: '#3b82f6',
  service: '#f59e0b',
  toll: '#8b5cf6',
  challan: '#f43f5e',
};

export function Insights({ expenses }: InsightsProps) {
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

  const stats = useMemo(() => {
    const fuelEntries = expenses.filter((e): e is FuelExpense => e.type === 'fuel');
    const allExpenses = expenses;

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
    const costPerKm = odometerRange > 0 ? totalSpent / odometerRange : 0;

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
    };
  }, [expenses]);

  const toggleMonth = (monthKey: string) => {
    setExpandedMonth(expandedMonth === monthKey ? null : monthKey);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-lavender/30 to-background pb-24">
      {/* Header */}
      <div className="pt-10 pb-4 px-5">
        <h1 className="text-3xl font-black text-foreground">Insights</h1>
        <p className="text-sm text-muted-foreground mt-1">Your expense analytics</p>
      </div>

      <div className="px-4 space-y-4">
        {/* Hero Stats */}
        <div className="bg-gradient-to-br from-lavender to-purple-400 rounded-3xl p-5 text-foreground shadow-lg border-2 border-foreground">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 opacity-80" />
            <span className="text-sm font-medium opacity-80">Running Cost</span>
          </div>
          <div className="text-center py-3">
            <span className="text-5xl font-black">₹{stats.costPerKm.toFixed(2)}</span>
            <p className="text-base font-medium opacity-80 mt-1">per kilometer</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-2xl p-4 text-center shadow-sm border-2 border-border">
            <div className="w-10 h-10 mx-auto mb-2 bg-mint rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-foreground" />
            </div>
            <p className="text-lg font-black text-foreground">₹{(stats.totalSpent / 1000).toFixed(1)}k</p>
            <p className="text-[10px] font-medium text-muted-foreground">Total Spent</p>
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
                      <stop offset="0%" stopColor="hsl(var(--lavender))" />
                      <stop offset="100%" stopColor="hsl(var(--pink))" />
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
      </div>
    </div>
  );
}

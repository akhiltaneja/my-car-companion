import { useMemo, useState } from 'react';
import { XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar, LineChart, Line } from 'recharts';
import { Expense, FuelEntry, EXPENSE_LABELS } from '@/types';
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
    const fuelEntries = expenses.filter((e): e is FuelEntry => e.type === 'fuel');
    const allExpenses = expenses;

    const totalSpent = allExpenses.reduce((sum, e) => sum + e.totalCost, 0);
    const totalFuel = fuelEntries.reduce((sum, e) => sum + e.liters, 0);

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
    const thisMonthSpent = thisMonth.reduce((sum, e) => sum + e.totalCost, 0);
    const thisMonthFuel = thisMonth.filter((e): e is FuelEntry => e.type === 'fuel');
    const thisMonthLiters = thisMonthFuel.reduce((sum, e) => sum + e.liters, 0);

    const avgPrice = fuelEntries.length > 0
      ? fuelEntries.reduce((sum, e) => sum + e.pricePerLiter, 0) / fuelEntries.length
      : 0;

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
      avgPrice,
      monthlyChartData,
    };
  }, [expenses]);

  const toggleMonth = (monthKey: string) => {
    setExpandedMonth(expandedMonth === monthKey ? null : monthKey);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 pb-24">
      {/* Header */}
      <div className="pt-10 pb-4 px-5">
        <h1 className="text-3xl font-black text-slate-800">Insights</h1>
        <p className="text-sm text-slate-500 mt-1">Your expense analytics</p>
      </div>

      <div className="px-4 space-y-4">
        {/* Hero Stats */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-5 text-white shadow-lg">
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
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-slate-100">
            <div className="w-10 h-10 mx-auto mb-2 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-lg font-black text-slate-800">₹{(stats.totalSpent / 1000).toFixed(1)}k</p>
            <p className="text-[10px] font-medium text-slate-500">Total Spent</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-slate-100">
            <div className="w-10 h-10 mx-auto mb-2 bg-blue-100 rounded-xl flex items-center justify-center">
              <Droplet className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-lg font-black text-slate-800">{stats.totalFuel.toFixed(0)}L</p>
            <p className="text-[10px] font-medium text-slate-500">Total Fuel</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-slate-100">
            <div className="w-10 h-10 mx-auto mb-2 bg-amber-100 rounded-xl flex items-center justify-center">
              <Fuel className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-lg font-black text-slate-800">{stats.avgEfficiency.toFixed(1)}</p>
            <p className="text-[10px] font-medium text-slate-500">km/L Avg</p>
          </div>
        </div>

        {/* Monthly Expense Chart */}
        {stats.monthlyChartData.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              Monthly Expenses
            </h3>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthlyChartData.slice(-6)}>
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 10, fill: '#64748b' }} 
                    tickFormatter={(v) => v.split(' ')[0]}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: '#64748b' }} 
                    tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`}
                    width={40}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Spent']}
                    contentStyle={{ 
                      background: 'white', 
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
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
                      <stop offset="0%" stopColor="#818cf8" />
                      <stop offset="100%" stopColor="#c084fc" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* This Month Summary */}
        <div className="bg-gradient-to-br from-pink-100 to-rose-50 rounded-2xl p-5 border border-pink-200">
          <h3 className="font-bold text-slate-800 mb-3">This Month</h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-3xl font-black text-slate-800">₹{stats.thisMonthSpent.toLocaleString('en-IN')}</p>
              <p className="text-sm text-slate-500">{stats.thisMonthLiters.toFixed(1)} liters filled</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-slate-600">₹{stats.avgPrice.toFixed(2)}</p>
              <p className="text-xs text-slate-400">avg per liter</p>
            </div>
          </div>
        </div>

        {/* Month-wise Log */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-4">Monthly Log</h3>
          <div className="space-y-2">
            {stats.monthlyChartData.slice().reverse().map((monthData) => (
              <div key={monthData.monthKey} className="rounded-xl overflow-hidden border border-slate-200">
                <button
                  onClick={() => toggleMonth(monthData.monthKey)}
                  className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-slate-700">{monthData.month}</span>
                    <span className="text-xs text-slate-400 bg-white px-2 py-0.5 rounded-full">
                      {monthData.entries.length} entries
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-slate-800">₹{monthData.amount.toLocaleString('en-IN')}</span>
                    {expandedMonth === monthData.monthKey ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>
                
                {expandedMonth === monthData.monthKey && (
                  <div className="p-3 space-y-2 bg-white">
                    {monthData.entries
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((entry) => (
                        <div 
                          key={entry.id}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50"
                        >
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: typeColors[entry.type] }}
                            />
                            <span className="text-xs font-bold text-slate-600">{format(new Date(entry.date), 'dd')}</span>
                            <span className="text-xs font-medium text-slate-500">{EXPENSE_LABELS[entry.type]}</span>
                          </div>
                          <span className="text-sm font-black text-slate-700">₹{entry.totalCost.toLocaleString('en-IN')}</span>
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

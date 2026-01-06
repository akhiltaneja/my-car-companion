import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Expense, FuelEntry } from '@/types';

interface InsightsProps {
  expenses: Expense[];
}

export function Insights({ expenses }: InsightsProps) {
  const stats = useMemo(() => {
    const fuelEntries = expenses.filter((e): e is FuelEntry => e.type === 'fuel');
    const allExpenses = expenses;

    const totalSpent = allExpenses.reduce((sum, e) => sum + e.totalCost, 0);
    const totalFuel = fuelEntries.reduce((sum, e) => sum + e.liters, 0);
    const fuelSpent = fuelEntries.reduce((sum, e) => sum + e.totalCost, 0);

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

    // Yearly data for chart
    const yearlyData: Record<number, number> = {};
    allExpenses.forEach(e => {
      const year = new Date(e.date).getFullYear();
      yearlyData[year] = (yearlyData[year] || 0) + e.totalCost;
    });
    const chartData = Object.entries(yearlyData)
      .map(([year, amount]) => ({ year: parseInt(year), amount }))
      .sort((a, b) => a.year - b.year);

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
      chartData,
    };
  }, [expenses]);

  return (
    <div className="min-h-screen bg-lavender pb-24">
      <div className="page-header">
        <h1 className="page-title">Insights</h1>
        <p className="page-subtitle">Your fuel statistics</p>
      </div>

      <div className="px-4 space-y-4">
        {/* Cost Per KM - Hero Stat */}
        <div className="card-brutal p-5 animate-slide-up">
          <h3 className="font-bold text-sm text-muted-foreground mb-2">Running Cost</h3>
          <div className="text-center py-4">
            <span className="text-5xl font-black">₹{stats.costPerKm.toFixed(2)}</span>
            <p className="text-lg font-bold text-muted-foreground mt-1">per km</p>
          </div>
        </div>

        {/* Yearly Chart */}
        {stats.chartData.length > 0 && (
          <div className="card-brutal p-5 animate-slide-up">
            <h3 className="font-bold mb-4">Yearly Expenses</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.chartData}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(158, 60%, 72%)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(158, 60%, 72%)" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="year" tick={{ fontSize: 12, fontWeight: 600 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip 
                    formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Spent']}
                    contentStyle={{ 
                      background: 'white', 
                      border: '2px solid black', 
                      borderRadius: '12px',
                      fontWeight: 600 
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="hsl(158, 50%, 40%)" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorAmount)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Overall Stats */}
        <div className="card-brutal p-5 animate-slide-up">
          <h3 className="font-bold mb-4">Overall Stats</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="stat-card bg-stat-yellow">
              <p className="text-xs font-medium text-muted-foreground">Total Spent</p>
              <p className="text-xl font-black">₹{stats.totalSpent.toLocaleString('en-IN')}</p>
            </div>
            <div className="stat-card bg-stat-mint">
              <p className="text-xs font-medium text-muted-foreground">Total Fuel</p>
              <p className="text-xl font-black">{stats.totalFuel.toFixed(1)} L</p>
            </div>
            <div className="stat-card bg-stat-lavender">
              <p className="text-xs font-medium text-muted-foreground">Avg Efficiency</p>
              <p className="text-xl font-black">{stats.avgEfficiency.toFixed(1)} km/L</p>
            </div>
            <div className="stat-card bg-stat-peach">
              <p className="text-xs font-medium text-muted-foreground">Cost per km</p>
              <p className="text-xl font-black">₹{stats.costPerKm.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* This Month */}
        <div className="card-brutal p-5 animate-slide-up">
          <h3 className="font-bold mb-4">This Month</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="stat-card bg-stat-pink text-center">
              <p className="text-2xl font-black">₹{stats.thisMonthSpent.toLocaleString('en-IN')}</p>
              <p className="text-xs font-medium text-muted-foreground">Spent</p>
            </div>
            <div className="stat-card bg-stat-mint text-center">
              <p className="text-2xl font-black">{stats.thisMonthLiters.toFixed(1)}</p>
              <p className="text-xs font-medium text-muted-foreground">Liters</p>
            </div>
            <div className="stat-card bg-stat-peach text-center">
              <p className="text-2xl font-black">{stats.thisMonthFills}</p>
              <p className="text-xs font-medium text-muted-foreground">Fills</p>
            </div>
          </div>
        </div>

        {/* Price Info */}
        <div className="card-brutal p-5 animate-slide-up">
          <h3 className="font-bold mb-4">Price Info</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="stat-card bg-stat-yellow">
              <p className="text-xs font-medium text-muted-foreground">Avg Price/L</p>
              <p className="text-xl font-black">₹{stats.avgPrice.toFixed(2)}</p>
            </div>
            <div className="stat-card bg-stat-lavender">
              <p className="text-xs font-medium text-muted-foreground">Last Price/L</p>
              <p className="text-xl font-black">₹{stats.lastPrice.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

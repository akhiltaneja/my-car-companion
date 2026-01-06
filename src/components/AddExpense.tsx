import { useState, useMemo } from 'react';
import { Fuel, Shield, Wrench, Car, AlertTriangle } from 'lucide-react';
import { ExpenseType, FuelEntry, OtherExpense, EXPENSE_LABELS } from '@/types';
import { format } from 'date-fns';

interface AddExpenseProps {
  lastOdometer: number;
  onAdd: (expense: FuelEntry | OtherExpense) => void;
}

const expenseTypes = [
  { type: 'fuel' as ExpenseType, icon: Fuel, label: 'Fuel', color: 'bg-fuel' },
  { type: 'insurance' as ExpenseType, icon: Shield, label: 'Insurance', color: 'bg-insurance' },
  { type: 'service' as ExpenseType, icon: Wrench, label: 'Service', color: 'bg-service' },
  { type: 'toll' as ExpenseType, icon: Car, label: 'Toll', color: 'bg-toll' },
  { type: 'challan' as ExpenseType, icon: AlertTriangle, label: 'Challan', color: 'bg-challan' },
];

export function AddExpense({ lastOdometer, onAdd }: AddExpenseProps) {
  const [activeType, setActiveType] = useState<ExpenseType>('fuel');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [odometer, setOdometer] = useState('');
  const [pricePerLiter, setPricePerLiter] = useState('');
  const [liters, setLiters] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');

  const totalCost = useMemo(() => {
    if (activeType === 'fuel') {
      const price = parseFloat(pricePerLiter) || 0;
      const lit = parseFloat(liters) || 0;
      return price * lit;
    }
    return parseFloat(amount) || 0;
  }, [activeType, pricePerLiter, liters, amount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const baseExpense = {
      id: crypto.randomUUID(),
      date,
      odometer: parseInt(odometer) || lastOdometer,
      notes: notes || undefined,
      createdAt: new Date().toISOString(),
    };

    if (activeType === 'fuel') {
      const fuelEntry: FuelEntry = {
        ...baseExpense,
        type: 'fuel',
        pricePerLiter: parseFloat(pricePerLiter) || 0,
        liters: parseFloat(liters) || 0,
        totalCost,
      };
      onAdd(fuelEntry);
    } else {
      const expense: OtherExpense = {
        ...baseExpense,
        type: activeType,
        totalCost: parseFloat(amount) || 0,
        description: description || EXPENSE_LABELS[activeType],
      };
      onAdd(expense);
    }

    // Reset form
    setOdometer('');
    setPricePerLiter('');
    setLiters('');
    setAmount('');
    setDescription('');
    setNotes('');
  };

  return (
    <div className="min-h-screen bg-mint pb-24">
      <div className="page-header">
        <h1 className="page-title">Mileage Mate</h1>
        <p className="page-subtitle">Track your vehicle expenses</p>
      </div>

      <div className="px-4">
        {/* Expense Type Selector */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {expenseTypes.map(({ type, icon: Icon, label, color }) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 border-foreground
                         font-bold text-sm whitespace-nowrap transition-all
                         ${activeType === type ? `${color} shadow-brutal-sm` : 'bg-card'}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="card-brutal p-5 animate-slide-up">
          <h2 className="text-xl font-black mb-1">
            Add {EXPENSE_LABELS[activeType]} Entry
          </h2>
          <p className="text-sm text-muted-foreground mb-5">
            Last reading: {lastOdometer.toLocaleString()} km
          </p>

          <div className="space-y-4">
            {/* Date */}
            <div>
              <label className="block text-sm font-bold mb-2">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-brutal"
              />
            </div>

            {/* Odometer */}
            <div>
              <label className="block text-sm font-bold mb-2">Odometer Reading (km)</label>
              <input
                type="number"
                value={odometer}
                onChange={(e) => setOdometer(e.target.value)}
                placeholder={`Last: ${lastOdometer.toLocaleString()}`}
                className="input-brutal"
              />
            </div>

            {activeType === 'fuel' ? (
              <>
                {/* Price per Liter */}
                <div>
                  <label className="block text-sm font-bold mb-2">Price per Liter (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={pricePerLiter}
                    onChange={(e) => setPricePerLiter(e.target.value)}
                    placeholder="e.g., 102.50"
                    className="input-brutal"
                  />
                </div>

                {/* Liters */}
                <div>
                  <label className="block text-sm font-bold mb-2">Liters Filled</label>
                  <input
                    type="number"
                    step="0.01"
                    value={liters}
                    onChange={(e) => setLiters(e.target.value)}
                    placeholder="e.g., 35.5"
                    className="input-brutal"
                  />
                </div>

                {/* Total Cost */}
                <div>
                  <label className="block text-sm font-bold mb-2">Total Cost (₹)</label>
                  <div className="input-brutal bg-stat-yellow">
                    {totalCost > 0 ? `₹${totalCost.toFixed(2)}` : 'Auto-calculated'}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Amount */}
                <div>
                  <label className="block text-sm font-bold mb-2">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="input-brutal"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-bold mb-2">Description</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={`e.g., ${EXPENSE_LABELS[activeType]} payment`}
                    className="input-brutal"
                  />
                </div>
              </>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-bold mb-2">Notes (optional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Shell petrol pump"
                className="input-brutal"
              />
            </div>

            <button type="submit" className="btn-primary mt-6">
              Save Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

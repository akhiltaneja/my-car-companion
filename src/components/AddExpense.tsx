import { useState, useMemo } from 'react';
import { Fuel, Shield, Wrench, Car, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ExpenseType, FuelEntry, OtherExpense, EXPENSE_LABELS } from '@/types';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
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

  const resetForm = () => {
    setOdometer('');
    setPricePerLiter('');
    setLiters('');
    setAmount('');
    setDescription('');
    setNotes('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
  };

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

    resetForm();
    
    toast({
      title: "Entry Saved!",
      description: `${EXPENSE_LABELS[activeType]} entry added successfully.`,
      duration: 3000,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-mint/40 to-background pb-24">
      {/* Header */}
      <div className="pt-10 pb-4 px-5">
        <h1 className="text-2xl font-black text-foreground">Mileage Mate</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Track your vehicle expenses</p>
      </div>

      <div className="px-4">
        {/* Expense Type Selector - Grid Layout */}
        <div className="grid grid-cols-5 gap-2 mb-5">
          {expenseTypes.map(({ type, icon: Icon, label, color }) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl border-2 border-foreground
                         font-semibold text-xs transition-all
                         ${activeType === type ? `${color} shadow-brutal-sm scale-105` : 'bg-card hover:bg-muted'}`}
            >
              <Icon className="w-5 h-5" />
              <span className="truncate w-full text-center">{label}</span>
            </button>
          ))}
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="card-brutal p-5 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <div className={`p-2 rounded-xl ${expenseTypes.find(e => e.type === activeType)?.color}`}>
              {(() => {
                const ExpIcon = expenseTypes.find(e => e.type === activeType)?.icon || Fuel;
                return <ExpIcon className="w-5 h-5" />;
              })()}
            </div>
            <div>
              <h2 className="text-lg font-black">Add {EXPENSE_LABELS[activeType]}</h2>
              <p className="text-xs text-muted-foreground">Last: {lastOdometer.toLocaleString()} km</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Date & Odometer Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input-brutal text-sm h-12"
                  style={{ minHeight: '48px' }}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Odometer (km)</label>
                <input
                  type="number"
                  value={odometer}
                  onChange={(e) => setOdometer(e.target.value)}
                  placeholder={lastOdometer.toLocaleString()}
                  className="input-brutal text-sm h-12"
                />
              </div>
            </div>

            {activeType === 'fuel' ? (
              <>
                {/* Price & Liters Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Price/Liter (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={pricePerLiter}
                      onChange={(e) => setPricePerLiter(e.target.value)}
                      placeholder="102.50"
                      className="input-brutal text-sm h-12"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Liters</label>
                    <input
                      type="number"
                      step="0.01"
                      value={liters}
                      onChange={(e) => setLiters(e.target.value)}
                      placeholder="35.5"
                      className="input-brutal text-sm h-12"
                    />
                  </div>
                </div>

                {/* Total Cost Display */}
                <div className="bg-stat-yellow rounded-xl border-2 border-foreground p-4 text-center">
                  <p className="text-xs font-bold text-muted-foreground mb-1">Total Cost</p>
                  <p className="text-2xl font-black">
                    {totalCost > 0 ? `₹${totalCost.toFixed(2)}` : '₹0.00'}
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Amount */}
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="input-brutal text-sm h-12"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Description</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={`e.g., ${EXPENSE_LABELS[activeType]} payment`}
                    className="input-brutal text-sm h-12"
                  />
                </div>
              </>
            )}

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Notes (optional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Shell petrol pump"
                className="input-brutal text-sm h-12"
              />
            </div>

            <button type="submit" className="btn-primary mt-4 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Save Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

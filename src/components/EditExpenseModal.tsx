import { useState, useMemo } from 'react';
import { X, Fuel, Shield, Wrench, Car, AlertTriangle, MapPin, Building2, CheckCircle2 } from 'lucide-react';
import { Expense, ExpenseType, EXPENSE_LABELS, INSURANCE_PROVIDERS, PETROL_PUMPS, PetrolPump, FuelExpense, InsuranceExpense, TollExpense } from '@/types';
import { format } from 'date-fns';

interface EditExpenseModalProps {
  expense: Expense;
  onSave: (id: string, updates: Partial<Expense>) => Promise<{ error: Error | null }>;
  onClose: () => void;
}

const typeIcons: Record<ExpenseType, React.ComponentType<{ className?: string }>> = {
  fuel: Fuel,
  insurance: Shield,
  service: Wrench,
  toll: Car,
  challan: AlertTriangle,
};

const typeColors: Record<ExpenseType, string> = {
  fuel: 'bg-fuel',
  insurance: 'bg-insurance',
  service: 'bg-service',
  toll: 'bg-toll',
  challan: 'bg-challan',
};

export function EditExpenseModal({ expense, onSave, onClose }: EditExpenseModalProps) {
  const [date, setDate] = useState(expense.date);
  const [odometer, setOdometer] = useState(expense.odometer.toString());
  const [notes, setNotes] = useState(expense.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fuel fields
  const [pricePerLiter, setPricePerLiter] = useState(
    expense.type === 'fuel' ? (expense as FuelExpense).price_per_liter?.toString() || '' : ''
  );
  const [liters, setLiters] = useState(
    expense.type === 'fuel' ? (expense as FuelExpense).liters?.toString() || '' : ''
  );
  const [petrolPump, setPetrolPump] = useState<PetrolPump | ''>(
    expense.type === 'fuel' ? (expense as FuelExpense).petrol_pump || '' : ''
  );

  // Insurance fields
  const [providerName, setProviderName] = useState(
    expense.type === 'insurance' ? (expense as InsuranceExpense).provider_name || '' : ''
  );
  const [startDate, setStartDate] = useState(
    expense.type === 'insurance' ? (expense as InsuranceExpense).start_date || '' : ''
  );

  // Toll field
  const [location, setLocation] = useState(
    expense.type === 'toll' ? (expense as TollExpense).location || '' : ''
  );

  // Service/Challan field
  const [description, setDescription] = useState(
    (expense.type === 'service' || expense.type === 'challan') && 'description' in expense 
      ? (expense as any).description || '' 
      : ''
  );

  // Amount for non-fuel
  const [amount, setAmount] = useState(
    expense.type !== 'fuel' ? expense.total_cost.toString() : ''
  );

  const totalCost = useMemo(() => {
    if (expense.type === 'fuel') {
      const price = parseFloat(pricePerLiter) || 0;
      const lit = parseFloat(liters) || 0;
      return price * lit;
    }
    return parseFloat(amount) || 0;
  }, [expense.type, pricePerLiter, liters, amount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const updates: Partial<Expense> = {
      type: expense.type,
      date,
      odometer: parseInt(odometer) || expense.odometer,
      notes: notes || undefined,
      total_cost: totalCost,
      vehicle_id: expense.vehicle_id,
    };

    if (expense.type === 'fuel') {
      (updates as any).price_per_liter = parseFloat(pricePerLiter) || 0;
      (updates as any).liters = parseFloat(liters) || 0;
      (updates as any).petrol_pump = petrolPump || undefined;
    } else if (expense.type === 'insurance') {
      (updates as any).provider_name = providerName;
      (updates as any).start_date = startDate;
    } else if (expense.type === 'toll') {
      (updates as any).location = location;
    } else {
      (updates as any).description = description;
    }

    const { error } = await onSave(expense.id, updates);
    setIsSubmitting(false);

    if (!error) {
      onClose();
    }
  };

  const Icon = typeIcons[expense.type];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl border-3 border-foreground shadow-brutal w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-border">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${typeColors[expense.type]}`}>
              <Icon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black">Edit {EXPENSE_LABELS[expense.type]}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Date & Odometer */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-brutal text-sm h-12"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Odometer (km)</label>
              <input
                type="number"
                value={odometer}
                onChange={(e) => setOdometer(e.target.value)}
                className="input-brutal text-sm h-12"
              />
            </div>
          </div>

          {/* Fuel specific fields */}
          {expense.type === 'fuel' && (
            <>
              <div>
                <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Petrol Pump</label>
                <select
                  value={petrolPump}
                  onChange={(e) => setPetrolPump(e.target.value as PetrolPump)}
                  className="input-brutal text-sm h-12"
                >
                  <option value="">Select pump</option>
                  {PETROL_PUMPS.map(pump => (
                    <option key={pump.value} value={pump.value}>{pump.label}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Price/Liter (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={pricePerLiter}
                    onChange={(e) => setPricePerLiter(e.target.value)}
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
                    className="input-brutal text-sm h-12"
                  />
                </div>
              </div>
              <div className="bg-stat-yellow rounded-xl border-2 border-foreground p-4 text-center">
                <p className="text-xs font-bold text-muted-foreground mb-1">Total Cost</p>
                <p className="text-2xl font-black">₹{totalCost.toFixed(2)}</p>
              </div>
            </>
          )}

          {/* Insurance specific fields */}
          {expense.type === 'insurance' && (
            <>
              <div>
                <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Insurance Provider</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <select
                    value={providerName}
                    onChange={(e) => setProviderName(e.target.value)}
                    className="input-brutal text-sm h-12 pl-10"
                  >
                    <option value="">Select provider</option>
                    {INSURANCE_PROVIDERS.map(provider => (
                      <option key={provider} value={provider}>{provider}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Policy Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input-brutal text-sm h-12"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Premium Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input-brutal text-sm h-12"
                />
              </div>
            </>
          )}

          {/* Toll specific fields */}
          {expense.type === 'toll' && (
            <>
              <div>
                <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="input-brutal text-sm h-12 pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input-brutal text-sm h-12"
                />
              </div>
            </>
          )}

          {/* Service/Challan fields */}
          {(expense.type === 'service' || expense.type === 'challan') && (
            <>
              <div>
                <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input-brutal text-sm h-12"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
              className="input-brutal text-sm h-12"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border-2 border-foreground bg-muted font-bold transition-all hover:bg-muted/80"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-xl border-2 border-foreground bg-accent font-bold shadow-brutal-sm 
                         active:translate-x-[2px] active:translate-y-[2px] active:shadow-none 
                         transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

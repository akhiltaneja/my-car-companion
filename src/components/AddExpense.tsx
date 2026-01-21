import { useState, useMemo } from 'react';
import { Fuel, Shield, Wrench, Car, AlertTriangle, CheckCircle2, MapPin, Building2 } from 'lucide-react';
import { ExpenseType, EXPENSE_LABELS, INSURANCE_PROVIDERS, PETROL_PUMPS, Vehicle, PetrolPump } from '@/types';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { CategoryHistory } from './CategoryHistory';
import { Expense } from '@/types';

interface AddExpenseProps {
  lastOdometer: number;
  onAdd: (expense: any) => Promise<{ error: Error | null }>;
  expenses: Expense[];
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  onSelectVehicle: (vehicle: Vehicle) => void;
}

const expenseTypes = [
  { type: 'fuel' as ExpenseType, icon: Fuel, label: 'Fuel', color: 'bg-fuel' },
  { type: 'insurance' as ExpenseType, icon: Shield, label: 'Insurance', color: 'bg-insurance' },
  { type: 'service' as ExpenseType, icon: Wrench, label: 'Service', color: 'bg-service' },
  { type: 'toll' as ExpenseType, icon: Car, label: 'Toll', color: 'bg-toll' },
  { type: 'challan' as ExpenseType, icon: AlertTriangle, label: 'Challan', color: 'bg-challan' },
];

export function AddExpense({ lastOdometer, onAdd, expenses, vehicles, selectedVehicle, onSelectVehicle }: AddExpenseProps) {
  const { toast } = useToast();
  const [activeType, setActiveType] = useState<ExpenseType>('fuel');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [odometer, setOdometer] = useState('');
  const [pricePerLiter, setPricePerLiter] = useState('');
  const [liters, setLiters] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [providerName, setProviderName] = useState('');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [location, setLocation] = useState('');
  const [petrolPump, setPetrolPump] = useState<PetrolPump | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setProviderName('');
    setStartDate(format(new Date(), 'yyyy-MM-dd'));
    setLocation('');
    setPetrolPump('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedVehicle) {
      toast({
        title: "No vehicle selected",
        description: "Please add a vehicle first in Settings.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    const baseExpense = {
      type: activeType,
      date,
      odometer: parseInt(odometer) || lastOdometer,
      notes: notes || undefined,
      vehicle_id: selectedVehicle.id,
    };

    let expense: any = baseExpense;

    if (activeType === 'fuel') {
      expense = {
        ...baseExpense,
        price_per_liter: parseFloat(pricePerLiter) || 0,
        liters: parseFloat(liters) || 0,
        total_cost: totalCost,
        petrol_pump: petrolPump || undefined,
      };
    } else if (activeType === 'insurance') {
      expense = {
        ...baseExpense,
        provider_name: providerName,
        start_date: startDate,
        total_cost: parseFloat(amount) || 0,
      };
    } else if (activeType === 'toll') {
      expense = {
        ...baseExpense,
        location: location,
        total_cost: parseFloat(amount) || 0,
      };
    } else {
      expense = {
        ...baseExpense,
        description: description || EXPENSE_LABELS[activeType],
        total_cost: parseFloat(amount) || 0,
      };
    }

    const { error } = await onAdd(expense);
    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      resetForm();
      toast({
        title: "Entry Saved!",
        description: `${EXPENSE_LABELS[activeType]} entry added successfully.`,
        duration: 3000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-mint/40 to-background pb-24">
      {/* Header */}
      <div className="pt-10 pb-4 px-5">
        <h1 className="text-2xl font-black text-foreground">Add Expense</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Track your vehicle expenses</p>
      </div>

      <div className="px-4">
        {/* Vehicle Selector */}
        {vehicles.length > 0 && (
          <div className="mb-4">
            <label className="block text-xs font-bold mb-1.5 text-muted-foreground">For Vehicle</label>
            <select
              value={selectedVehicle?.id || ''}
              onChange={(e) => {
                const vehicle = vehicles.find(v => v.id === e.target.value);
                if (vehicle) onSelectVehicle(vehicle);
              }}
              className="input-brutal text-sm h-12"
            >
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.manufacturer} {vehicle.model} {vehicle.variant || ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {vehicles.length === 0 && (
          <div className="mb-4 p-4 bg-yellow/30 rounded-xl border-2 border-yellow">
            <p className="text-sm font-medium text-foreground">Please add a vehicle first in Settings to track expenses.</p>
          </div>
        )}

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

            {activeType === 'fuel' && (
              <>
                {/* Petrol Pump Selector */}
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
            )}

            {activeType === 'insurance' && (
              <>
                {/* Insurance Provider */}
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

                {/* Start Date */}
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Policy Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input-brutal text-sm h-12"
                  />
                </div>

                {/* Premium Amount */}
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Premium Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter premium amount"
                    className="input-brutal text-sm h-12"
                  />
                </div>
              </>
            )}

            {activeType === 'toll' && (
              <>
                {/* Location */}
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g., Mumbai-Pune Expressway"
                      className="input-brutal text-sm h-12 pl-10"
                    />
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter toll amount"
                    className="input-brutal text-sm h-12"
                  />
                </div>
              </>
            )}

            {(activeType === 'service' || activeType === 'challan') && (
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
                    placeholder={`e.g., ${EXPENSE_LABELS[activeType]} details`}
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
                placeholder="Any additional notes..."
                className="input-brutal text-sm h-12"
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary mt-4 flex items-center justify-center gap-2"
              disabled={isSubmitting || vehicles.length === 0}
            >
              <CheckCircle2 className="w-5 h-5" />
              {isSubmitting ? 'Saving...' : 'Save Entry'}
            </button>
          </div>
        </form>

        {/* Category History */}
        <div className="mt-4">
          <CategoryHistory expenses={expenses} type={activeType} />
        </div>
      </div>
    </div>
  );
}

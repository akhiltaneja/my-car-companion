import { format } from 'date-fns';
import { Fuel, Shield, Wrench, Car, AlertTriangle, X } from 'lucide-react';
import { Expense, ExpenseType, EXPENSE_LABELS, FuelExpense, InsuranceExpense, TollExpense, PETROL_PUMPS } from '@/types';

interface CategoryHistoryProps {
  expenses: Expense[];
  type: ExpenseType;
}

const typeIcons: Record<ExpenseType, React.ComponentType<{ className?: string }>> = {
  fuel: Fuel,
  insurance: Shield,
  service: Wrench,
  toll: Car,
  challan: AlertTriangle,
};

const typeAccentColors: Record<ExpenseType, string> = {
  fuel: 'bg-emerald-500',
  insurance: 'bg-blue-500',
  service: 'bg-amber-500',
  toll: 'bg-violet-500',
  challan: 'bg-rose-500',
};

export function CategoryHistory({ expenses, type }: CategoryHistoryProps) {
  const filteredExpenses = expenses.filter(e => e.type === type).slice(0, 5);
  const Icon = typeIcons[type];

  if (filteredExpenses.length === 0) {
    return (
      <div className="bg-muted/50 rounded-xl p-4 text-center">
        <p className="text-xs text-muted-foreground">No {EXPENSE_LABELS[type].toLowerCase()} entries yet</p>
      </div>
    );
  }

  const getPumpLabel = (pump?: string) => {
    if (!pump) return null;
    return PETROL_PUMPS.find(p => p.value === pump)?.label || pump;
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-muted-foreground mb-2">Recent {EXPENSE_LABELS[type]} Entries</p>
      {filteredExpenses.map((expense) => {
        const isFuel = expense.type === 'fuel';
        const isInsurance = expense.type === 'insurance';
        const isToll = expense.type === 'toll';

        return (
          <div
            key={expense.id}
            className="flex items-center justify-between p-3 bg-muted/50 rounded-xl border border-border"
          >
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${typeAccentColors[type]} text-white`}>
                <Icon className="w-3 h-3" />
              </div>
              <div>
                <p className="text-xs font-medium text-foreground">
                  {format(new Date(expense.date), 'd MMM yyyy')}
                </p>
                {isFuel && (
                  <p className="text-[10px] text-muted-foreground">
                    {(expense as FuelExpense).liters.toFixed(1)}L @ ₹{(expense as FuelExpense).price_per_liter.toFixed(2)}
                    {(expense as FuelExpense).petrol_pump && ` • ${getPumpLabel((expense as FuelExpense).petrol_pump)}`}
                  </p>
                )}
                {isInsurance && (expense as InsuranceExpense).provider_name && (
                  <p className="text-[10px] text-muted-foreground">{(expense as InsuranceExpense).provider_name}</p>
                )}
                {isToll && (expense as TollExpense).location && (
                  <p className="text-[10px] text-muted-foreground">{(expense as TollExpense).location}</p>
                )}
                {!isFuel && !isInsurance && !isToll && 'description' in expense && expense.description && (
                  <p className="text-[10px] text-muted-foreground">{expense.description}</p>
                )}
              </div>
            </div>
            <p className="text-sm font-black text-foreground">₹{expense.total_cost.toLocaleString('en-IN')}</p>
          </div>
        );
      })}
    </div>
  );
}

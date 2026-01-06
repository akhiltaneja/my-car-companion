import { format } from 'date-fns';
import { Trash2, Fuel, Shield, Wrench, Car, AlertTriangle } from 'lucide-react';
import { Expense, ExpenseType, EXPENSE_COLORS, EXPENSE_LABELS, FuelEntry } from '@/types';

interface HistoryProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
}

const typeIcons: Record<ExpenseType, React.ComponentType<{ className?: string }>> = {
  fuel: Fuel,
  insurance: Shield,
  service: Wrench,
  toll: Car,
  challan: AlertTriangle,
};

export function History({ expenses, onDelete }: HistoryProps) {
  return (
    <div className="min-h-screen bg-orange pb-24">
      <div className="page-header">
        <h1 className="page-title">History</h1>
        <p className="page-subtitle">Your expense entries</p>
      </div>

      <div className="px-4 space-y-4">
        {expenses.length === 0 ? (
          <div className="card-brutal p-8 text-center">
            <p className="text-muted-foreground font-medium">
              No entries yet. Start tracking your expenses!
            </p>
          </div>
        ) : (
          expenses.map((expense) => {
            const Icon = typeIcons[expense.type];
            const bgColor = EXPENSE_COLORS[expense.type];
            const isFuel = expense.type === 'fuel';

            return (
              <div
                key={expense.id}
                className={`card-brutal overflow-hidden animate-slide-up`}
              >
                <div className={`${bgColor} px-4 py-2 flex items-center gap-2`}>
                  <Icon className="w-4 h-4" />
                  <span className="font-bold text-sm">{EXPENSE_LABELS[expense.type]}</span>
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-black text-lg">
                      {format(new Date(expense.date), 'd MMM yyyy')}
                    </span>
                    <button
                      onClick={() => onDelete(expense.id)}
                      className="px-3 py-1 rounded-lg border-2 border-foreground text-sm font-bold
                               hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Odometer</span>
                      <span className="font-bold">{expense.odometer.toLocaleString()} km</span>
                    </div>

                    {isFuel && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fuel</span>
                        <span className="font-bold">
                          {(expense as FuelEntry).liters.toFixed(1)} L @ ₹{(expense as FuelEntry).pricePerLiter.toFixed(2)}/L
                        </span>
                      </div>
                    )}

                    {!isFuel && 'description' in expense && expense.description && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Description</span>
                        <span className="font-bold">{expense.description}</span>
                      </div>
                    )}

                    <div className="flex justify-between pt-2 border-t border-foreground/10">
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-black text-lg">₹{expense.totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>

                    {expense.notes && (
                      <div className="pt-2 text-muted-foreground italic">
                        "{expense.notes}"
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

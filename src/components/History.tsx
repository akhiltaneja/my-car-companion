import { format } from 'date-fns';
import { Fuel, Shield, Wrench, Car, AlertTriangle, X } from 'lucide-react';
import { Expense, ExpenseType, EXPENSE_LABELS, FuelExpense, InsuranceExpense, TollExpense } from '@/types';

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

const typeBgColors: Record<ExpenseType, string> = {
  fuel: 'bg-gradient-to-br from-mint/60 to-emerald-50 border-emerald-300',
  insurance: 'bg-gradient-to-br from-blue-100 to-sky-50 border-blue-300',
  service: 'bg-gradient-to-br from-orange/60 to-amber-50 border-amber-300',
  toll: 'bg-gradient-to-br from-lavender/60 to-purple-50 border-violet-300',
  challan: 'bg-gradient-to-br from-pink/60 to-rose-50 border-rose-300',
};

const typeAccentColors: Record<ExpenseType, string> = {
  fuel: 'bg-emerald-500',
  insurance: 'bg-blue-500',
  service: 'bg-amber-500',
  toll: 'bg-violet-500',
  challan: 'bg-rose-500',
};

export function History({ expenses, onDelete }: HistoryProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-mint/30 to-background pb-24">
      <div className="pt-10 pb-6 px-5">
        <h1 className="text-3xl font-black text-foreground">History</h1>
        <p className="text-sm text-muted-foreground mt-1">All your expense entries</p>
      </div>

      <div className="px-4 space-y-3">
        {expenses.length === 0 ? (
          <div className="bg-card rounded-2xl p-8 text-center shadow-sm border-2 border-border">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <Fuel className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">
              No entries yet. Start tracking your expenses!
            </p>
          </div>
        ) : (
          expenses.map((expense) => {
            const Icon = typeIcons[expense.type];
            const isFuel = expense.type === 'fuel';
            const isInsurance = expense.type === 'insurance';
            const isToll = expense.type === 'toll';

            return (
              <div
                key={expense.id}
                className={`relative rounded-2xl overflow-hidden border-2 shadow-sm hover:shadow-md transition-shadow ${typeBgColors[expense.type]}`}
              >
                {/* Accent bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${typeAccentColors[expense.type]}`} />
                
                <div className="p-4 pl-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-xl ${typeAccentColors[expense.type]} text-white`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-sm text-foreground">{EXPENSE_LABELS[expense.type]}</span>
                        <p className="text-xs text-muted-foreground">{format(new Date(expense.date), 'd MMM yyyy')}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onDelete(expense.id)}
                      className="p-2 rounded-full hover:bg-white/50 transition-colors text-muted-foreground hover:text-rose-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-end justify-between">
                    <div className="space-y-1 text-xs text-foreground/80">
                      <p><span className="text-muted-foreground">Odometer:</span> {expense.odometer.toLocaleString()} km</p>
                      {isFuel && (
                        <p>
                          <span className="text-muted-foreground">Fuel:</span> {(expense as FuelExpense).liters.toFixed(1)} L @ ₹{(expense as FuelExpense).price_per_liter.toFixed(2)}/L
                        </p>
                      )}
                      {isInsurance && (expense as InsuranceExpense).provider_name && (
                        <p><span className="text-muted-foreground">Provider:</span> {(expense as InsuranceExpense).provider_name}</p>
                      )}
                      {isToll && (expense as TollExpense).location && (
                        <p><span className="text-muted-foreground">Location:</span> {(expense as TollExpense).location}</p>
                      )}
                      {!isFuel && !isInsurance && !isToll && 'description' in expense && expense.description && (
                        <p><span className="text-muted-foreground">Note:</span> {expense.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-foreground">₹{expense.total_cost.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  {expense.notes && (
                    <p className="mt-2 text-xs text-muted-foreground italic bg-white/50 rounded-lg px-3 py-2">
                      "{expense.notes}"
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

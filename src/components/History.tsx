import { format } from 'date-fns';
import { Fuel, Shield, Wrench, Car, AlertTriangle, X } from 'lucide-react';
import { Expense, ExpenseType, EXPENSE_LABELS, FuelEntry } from '@/types';

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
  fuel: 'bg-gradient-to-br from-emerald-100 to-teal-50 border-emerald-300',
  insurance: 'bg-gradient-to-br from-blue-100 to-sky-50 border-blue-300',
  service: 'bg-gradient-to-br from-amber-100 to-yellow-50 border-amber-300',
  toll: 'bg-gradient-to-br from-violet-100 to-purple-50 border-violet-300',
  challan: 'bg-gradient-to-br from-rose-100 to-red-50 border-rose-300',
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-24">
      <div className="pt-10 pb-6 px-5">
        <h1 className="text-3xl font-black text-slate-800">History</h1>
        <p className="text-sm text-slate-500 mt-1">All your expense entries</p>
      </div>

      <div className="px-4 space-y-3">
        {expenses.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-slate-200">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <Fuel className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">
              No entries yet. Start tracking your expenses!
            </p>
          </div>
        ) : (
          expenses.map((expense) => {
            const Icon = typeIcons[expense.type];
            const isFuel = expense.type === 'fuel';

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
                        <span className="font-bold text-sm text-slate-700">{EXPENSE_LABELS[expense.type]}</span>
                        <p className="text-xs text-slate-500">{format(new Date(expense.date), 'd MMM yyyy')}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onDelete(expense.id)}
                      className="p-2 rounded-full hover:bg-white/50 transition-colors text-slate-400 hover:text-rose-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-end justify-between">
                    <div className="space-y-1 text-xs text-slate-600">
                      <p><span className="text-slate-400">Odometer:</span> {expense.odometer.toLocaleString()} km</p>
                      {isFuel && (
                        <p>
                          <span className="text-slate-400">Fuel:</span> {(expense as FuelEntry).liters.toFixed(1)} L @ ₹{(expense as FuelEntry).pricePerLiter.toFixed(2)}/L
                        </p>
                      )}
                      {!isFuel && 'description' in expense && expense.description && (
                        <p><span className="text-slate-400">Note:</span> {expense.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-slate-800">₹{expense.totalCost.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  {expense.notes && (
                    <p className="mt-2 text-xs text-slate-500 italic bg-white/50 rounded-lg px-3 py-2">
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

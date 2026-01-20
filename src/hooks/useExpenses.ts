import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Expense, ExpenseType } from '@/types';

export function useExpenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = useCallback(async () => {
    if (!user) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching expenses:', error);
    } else {
      setExpenses((data || []) as Expense[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const addExpense = async (expense: Omit<Expense, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return { error: new Error('Not authenticated') };

    const insertData = {
      user_id: user.id,
      type: expense.type as ExpenseType,
      date: expense.date,
      odometer: expense.odometer,
      total_cost: expense.total_cost,
      notes: expense.notes || null,
      price_per_liter: expense.type === 'fuel' ? (expense as any).price_per_liter : null,
      liters: expense.type === 'fuel' ? (expense as any).liters : null,
      provider_name: expense.type === 'insurance' ? (expense as any).provider_name : null,
      start_date: expense.type === 'insurance' ? (expense as any).start_date : null,
      location: expense.type === 'toll' ? (expense as any).location : null,
      description: ['service', 'challan'].includes(expense.type) ? (expense as any).description : null,
    };

    const { error } = await supabase.from('expenses').insert(insertData);

    if (!error) {
      fetchExpenses();
    }
    return { error };
  };

  const deleteExpense = async (id: string) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (!error) {
      setExpenses(prev => prev.filter(e => e.id !== id));
    }
    return { error };
  };

  const getLastOdometer = useCallback(() => {
    if (expenses.length === 0) return 0;
    return expenses[0].odometer;
  }, [expenses]);

  return {
    expenses,
    loading,
    addExpense,
    deleteExpense,
    getLastOdometer,
    refetch: fetchExpenses,
  };
}

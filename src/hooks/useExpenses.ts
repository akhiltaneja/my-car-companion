import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Expense, ExpenseType, PetrolPump } from '@/types';

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
      vehicle_id: expense.vehicle_id || null,
      price_per_liter: expense.type === 'fuel' ? (expense as any).price_per_liter : null,
      liters: expense.type === 'fuel' ? (expense as any).liters : null,
      petrol_pump: expense.type === 'fuel' ? ((expense as any).petrol_pump as PetrolPump) || null : null,
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

  const updateExpense = async (id: string, updates: Partial<Omit<Expense, 'id' | 'user_id' | 'created_at'>>) => {
    if (!user) return { error: new Error('Not authenticated') };

    const updateData: Record<string, unknown> = {
      date: updates.date,
      odometer: updates.odometer,
      total_cost: updates.total_cost,
      notes: updates.notes || null,
      vehicle_id: updates.vehicle_id || null,
    };

    // Add type-specific fields
    if (updates.type === 'fuel') {
      updateData.price_per_liter = (updates as any).price_per_liter || null;
      updateData.liters = (updates as any).liters || null;
      updateData.petrol_pump = (updates as any).petrol_pump || null;
    } else if (updates.type === 'insurance') {
      updateData.provider_name = (updates as any).provider_name || null;
      updateData.start_date = (updates as any).start_date || null;
    } else if (updates.type === 'toll') {
      updateData.location = (updates as any).location || null;
    } else if (['service', 'challan'].includes(updates.type || '')) {
      updateData.description = (updates as any).description || null;
    }

    const { error } = await supabase
      .from('expenses')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id);

    if (!error) {
      fetchExpenses();
    }
    return { error };
  };

  const getLastOdometer = useCallback((vehicleId?: string) => {
    const vehicleExpenses = vehicleId 
      ? expenses.filter(e => e.vehicle_id === vehicleId)
      : expenses;
    if (vehicleExpenses.length === 0) return 0;
    return vehicleExpenses[0].odometer;
  }, [expenses]);

  return {
    expenses,
    loading,
    addExpense,
    deleteExpense,
    updateExpense,
    getLastOdometer,
    refetch: fetchExpenses,
  };
}

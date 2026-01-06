import { useState, useEffect, useCallback } from 'react';
import { AppData, Expense, UserProfile } from '@/types';

const STORAGE_KEY = 'mileage-mate-data';

const defaultProfile: UserProfile = {
  name: '',
  carBrand: '',
  carName: '',
  purchaseMonth: new Date().getMonth() + 1,
  purchaseYear: new Date().getFullYear(),
};

const defaultData: AppData = {
  expenses: [],
  profile: defaultProfile,
};

export function useAppData() {
  const [data, setData] = useState<AppData>(defaultData);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setData(parsed);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save data to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, isLoaded]);

  const addExpense = useCallback((expense: Expense) => {
    setData(prev => ({
      ...prev,
      expenses: [...prev.expenses, expense].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    }));
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      expenses: prev.expenses.filter(e => e.id !== id),
    }));
  }, []);

  const updateProfile = useCallback((profile: Partial<UserProfile>) => {
    setData(prev => ({
      ...prev,
      profile: { ...prev.profile, ...profile },
    }));
  }, []);

  const getLastOdometer = useCallback(() => {
    if (data.expenses.length === 0) return 0;
    const sorted = [...data.expenses].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return sorted[0].odometer;
  }, [data.expenses]);

  const exportAsJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mileage-mate-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  const exportAsCSV = useCallback(() => {
    const headers = ['Date', 'Type', 'Odometer', 'Amount', 'Price/L', 'Liters', 'Notes'];
    const rows = data.expenses.map(e => {
      if (e.type === 'fuel') {
        return [
          e.date,
          e.type,
          e.odometer,
          e.totalCost,
          e.pricePerLiter,
          e.liters,
          e.notes || '',
        ];
      }
      return [e.date, e.type, e.odometer, e.totalCost, '', '', e.notes || ''];
    });

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mileage-mate-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  return {
    data,
    isLoaded,
    addExpense,
    deleteExpense,
    updateProfile,
    getLastOdometer,
    exportAsJSON,
    exportAsCSV,
  };
}

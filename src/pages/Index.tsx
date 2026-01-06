import { useState } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { BottomNav } from '@/components/BottomNav';
import { AddExpense } from '@/components/AddExpense';
import { History } from '@/components/History';
import { Insights } from '@/components/Insights';
import { Settings } from '@/components/Settings';

type Tab = 'add' | 'history' | 'insights' | 'settings';

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>('add');
  const {
    data,
    isLoaded,
    addExpense,
    deleteExpense,
    updateProfile,
    getLastOdometer,
    exportAsJSON,
    exportAsCSV,
  } = useAppData();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-mint flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-black mb-2">Mileage Mate</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      {activeTab === 'add' && (
        <AddExpense lastOdometer={getLastOdometer()} onAdd={addExpense} />
      )}
      {activeTab === 'history' && (
        <History expenses={data.expenses} onDelete={deleteExpense} />
      )}
      {activeTab === 'insights' && (
        <Insights expenses={data.expenses} />
      )}
      {activeTab === 'settings' && (
        <Settings
          profile={data.profile}
          expenseCount={data.expenses.length}
          onUpdateProfile={updateProfile}
          onExportJSON={exportAsJSON}
          onExportCSV={exportAsCSV}
        />
      )}
      
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useExpenses } from '@/hooks/useExpenses';
import { useProfile } from '@/hooks/useProfile';
import { BottomNav } from '@/components/BottomNav';
import { Dashboard } from '@/components/Dashboard';
import { AddExpense } from '@/components/AddExpense';
import { History } from '@/components/History';
import { Insights } from '@/components/Insights';
import { Settings } from '@/components/Settings';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

type Tab = 'dashboard' | 'add' | 'history' | 'insights' | 'settings';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const { expenses, loading: expensesLoading, addExpense, deleteExpense, getLastOdometer } = useExpenses();
  const { profile, loading: profileLoading, updateProfile } = useProfile();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-mint/40 to-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const isLoading = expensesLoading || profileLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-mint/40 to-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-black mb-2">Mileage Mate</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="max-w-lg mx-auto">
      {activeTab === 'dashboard' && (
        <Dashboard expenses={expenses} profile={profile} />
      )}
      {activeTab === 'add' && (
        <AddExpense lastOdometer={getLastOdometer()} onAdd={addExpense} />
      )}
      {activeTab === 'history' && (
        <History expenses={expenses} onDelete={(id) => deleteExpense(id)} />
      )}
      {activeTab === 'insights' && (
        <Insights expenses={expenses} />
      )}
      {activeTab === 'settings' && (
        <Settings
          profile={profile}
          expenseCount={expenses.length}
          onUpdateProfile={updateProfile}
        />
      )}
      
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default Index;

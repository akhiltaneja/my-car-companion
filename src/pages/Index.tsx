import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useExpenses } from '@/hooks/useExpenses';
import { useProfile } from '@/hooks/useProfile';
import { useVehicles } from '@/hooks/useVehicles';
import { BottomNav } from '@/components/BottomNav';
import { Home } from '@/components/Home';
import { AddExpense } from '@/components/AddExpense';
import { History } from '@/components/History';
import { Settings } from '@/components/Settings';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

type Tab = 'home' | 'add' | 'history' | 'settings';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [viewMode, setViewMode] = useState<'individual' | 'combined'>('individual');
  const { expenses, loading: expensesLoading, addExpense, deleteExpense, updateExpense, getLastOdometer } = useExpenses();
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const { 
    vehicles, 
    loading: vehiclesLoading, 
    selectedVehicle, 
    addVehicle, 
    deleteVehicle, 
    updateVehicle,
    selectVehicle 
  } = useVehicles();

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

  const isLoading = expensesLoading || profileLoading || vehiclesLoading;

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

  const handleSetDefaultVehicle = async (id: string) => {
    return updateVehicle(id, { is_default: true });
  };

  return (
    <div className="max-w-lg mx-auto">
      {activeTab === 'home' && (
        <Home 
          expenses={expenses} 
          profile={profile} 
          vehicles={vehicles}
          selectedVehicle={selectedVehicle}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      )}
      {activeTab === 'add' && (
        <AddExpense 
          lastOdometer={getLastOdometer(selectedVehicle?.id)} 
          onAdd={addExpense}
          expenses={expenses}
          vehicles={vehicles}
          selectedVehicle={selectedVehicle}
          onSelectVehicle={selectVehicle}
        />
      )}
      {activeTab === 'history' && (
        <History expenses={expenses} onDelete={(id) => deleteExpense(id)} onUpdate={updateExpense} />
      )}
      {activeTab === 'settings' && (
        <Settings
          profile={profile}
          expenseCount={expenses.length}
          vehicles={vehicles}
          onUpdateProfile={updateProfile}
          onAddVehicle={addVehicle}
          onUpdateVehicle={updateVehicle}
          onDeleteVehicle={deleteVehicle}
          onSetDefaultVehicle={handleSetDefaultVehicle}
        />
      )}
      
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default Index;

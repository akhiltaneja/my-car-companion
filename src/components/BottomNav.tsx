import { Home, Clock, PlusCircle, Settings } from 'lucide-react';

type Tab = 'home' | 'add' | 'history' | 'settings';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs = [
  { id: 'home' as Tab, icon: Home, label: 'Home', color: 'bg-mint' },
  { id: 'history' as Tab, icon: Clock, label: 'History', color: 'bg-lavender' },
  { id: 'add' as Tab, icon: PlusCircle, label: 'Add', color: 'bg-orange' },
  { id: 'settings' as Tab, icon: Settings, label: 'Settings', color: 'bg-pink' },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t-3 border-foreground px-2 py-2 z-50">
      <div className="max-w-lg mx-auto grid grid-cols-4 gap-1">
        {tabs.map(({ id, icon: Icon, label, color }) => {
          const isActive = activeTab === id;
          
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl
                         font-semibold text-xs transition-all
                         ${isActive ? `${color} border-2 border-foreground shadow-brutal-sm` : 'hover:bg-muted'}`}
            >
              <Icon className="w-5 h-5" strokeWidth={2.5} />
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

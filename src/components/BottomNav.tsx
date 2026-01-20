import { Plus, Menu, BarChart3, Settings, Home } from 'lucide-react';

type Tab = 'dashboard' | 'add' | 'history' | 'insights' | 'settings';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs = [
  { id: 'dashboard' as Tab, icon: Home, label: 'Home', color: 'bg-mint' },
  { id: 'history' as Tab, icon: Menu, label: 'History', color: 'bg-orange' },
  { id: 'add' as Tab, icon: Plus, label: 'Add', color: 'bg-primary', isCenter: true },
  { id: 'insights' as Tab, icon: BarChart3, label: 'Insights', color: 'bg-lavender' },
  { id: 'settings' as Tab, icon: Settings, label: 'Settings', color: 'bg-pink' },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t-3 border-foreground px-4 py-2 z-50">
      <div className="max-w-lg mx-auto flex justify-around items-center">
        {tabs.map(({ id, icon: Icon, label, color, isCenter }) => {
          const isActive = activeTab === id;
          
          if (isCenter) {
            return (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className={`-mt-8 w-14 h-14 rounded-full ${color} border-3 border-foreground shadow-brutal flex items-center justify-center transition-all hover:scale-105 active:scale-95`}
              >
                <Icon className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} />
              </button>
            );
          }
          
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`nav-item ${isActive ? `${color} nav-item-active border-2 border-foreground` : ''}`}
            >
              <Icon className="w-5 h-5" strokeWidth={2.5} />
              <span className="text-xs font-bold">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

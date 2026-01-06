import { Plus, Menu, BarChart3, Settings } from 'lucide-react';

type Tab = 'add' | 'history' | 'insights' | 'settings';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs = [
  { id: 'add' as Tab, icon: Plus, label: 'Add', color: 'bg-mint' },
  { id: 'history' as Tab, icon: Menu, label: 'History', color: 'bg-orange' },
  { id: 'insights' as Tab, icon: BarChart3, label: 'Insights', color: 'bg-lavender' },
  { id: 'settings' as Tab, icon: Settings, label: 'Settings', color: 'bg-pink' },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t-3 border-foreground px-4 py-2 z-50">
      <div className="max-w-lg mx-auto flex justify-around items-center">
        {tabs.map(({ id, icon: Icon, label, color }) => {
          const isActive = activeTab === id;
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

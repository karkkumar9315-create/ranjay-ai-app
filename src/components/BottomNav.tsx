import React from 'react';
import { Home, Sparkles, Folder, Bot, Settings } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'create', label: 'Create', icon: Sparkles },
    { id: 'projects', label: 'Projects', icon: Folder },
    { id: 'ai', label: 'AI', icon: Bot },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80 px-2 py-2 max-w-md mx-auto sm:max-w-xl md:max-w-2xl lg:max-w-4xl">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-300 ${
                isActive
                  ? 'text-cyan-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200 hover:scale-100 font-medium'
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl -z-10 shadow-lg shadow-cyan-500/10" />
              )}
              <Icon className={`w-5 h-5 mb-0.5 transition-transform ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[11px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

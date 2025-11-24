import React from 'react';
import { User, BarChart3, Activity } from 'lucide-react';
import { TabType } from '../../types';

interface TabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'user', label: 'User', icon: <User className="w-4 h-4" /> },
    { id: 'observability', label: 'Observability', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'test', label: 'Test', icon: <Activity className="w-4 h-4" /> },
  ];

  return (
    <div className="bg-slate-900 border-b border-blue-500/30 flex shadow-lg shadow-blue-500/10">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-all ${
            activeTab === tab.id
              ? 'border-blue-500 text-blue-400 bg-slate-800/50 tab-active' 
              : 'border-transparent text-gray-400 hover:text-gray-300 hover:bg-slate-800/30'
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
};

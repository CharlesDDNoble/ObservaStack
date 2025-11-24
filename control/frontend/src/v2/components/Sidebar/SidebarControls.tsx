import React from 'react';
import { Square } from 'lucide-react';

interface SidebarControlsProps {
  onStop: () => void;
  onBackToScenarios: () => void;
}

export const SidebarControls: React.FC<SidebarControlsProps> = ({ onStop, onBackToScenarios }) => {
  return (
    <div className="p-4 border-t border-blue-500/30 space-y-2 bg-slate-900">
      <button
        onClick={onStop}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-all hover:shadow-lg hover:shadow-red-500/50"
      >
        <Square className="w-4 h-4" />
        Stop Scenario
      </button>
      <button
        onClick={onBackToScenarios}
        className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded transition-all hover:shadow-lg hover:shadow-blue-500/30 text-sm"
      >
        Back to Scenarios
      </button>
    </div>
  );
};

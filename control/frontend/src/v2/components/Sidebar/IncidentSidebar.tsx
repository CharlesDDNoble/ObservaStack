import React, { useState } from 'react';
import { Activity } from 'lucide-react';
import { Scenario } from '../../types';
import { ScenarioList } from './ScenarioList';
import { ScenarioDetails } from './ScenarioDetails';
import { UpdatesFeed } from './UpdatesFeed';
import { SidebarControls } from './SidebarControls';
import { IncidentUpdate } from '../../types';

interface IncidentSidebarProps {
  scenario: Scenario | null;
  scenarios: Scenario[];
  isRunning: boolean;
  elapsedTime: number;
  updates: IncidentUpdate[];
  onSelectScenario: (scenario: Scenario) => void;
  onStopScenario: () => void;
  onBackToScenarios: () => void;
}

export const IncidentSidebar: React.FC<IncidentSidebarProps> = ({
  scenario,
  scenarios,
  isRunning,
  elapsedTime,
  updates,
  onSelectScenario,
  onStopScenario,
  onBackToScenarios
}) => {
  const [detailsExpanded, setDetailsExpanded] = useState(true);

  return (
    <div className="w-80 bg-slate-900 border-r border-blue-500/20 flex flex-col shadow-lg shadow-blue-500/10">
      {/* Header */}
      <div className="px-6 py-3 bg-slate-900 border-b border-blue-500/30">
        <h1 className="text-xl font-bold text-blue-400 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          ObservaStack
        </h1>
      </div>

      {/* Content */}
      {scenario ? (
        <div className="flex-1 overflow-y-auto flex flex-col">
          <ScenarioDetails
            scenario={scenario}
            isRunning={isRunning}
            elapsedTime={elapsedTime}
            isExpanded={detailsExpanded}
            onToggleExpanded={() => setDetailsExpanded(!detailsExpanded)}
          />
          <UpdatesFeed updates={updates} />
        </div>
      ) : (
        <ScenarioList scenarios={scenarios} onSelectScenario={onSelectScenario} />
      )}

      {/* Controls */}
      {scenario && (
        <SidebarControls 
          onStop={onStopScenario} 
          onBackToScenarios={onBackToScenarios} 
        />
      )}
    </div>
  );
};

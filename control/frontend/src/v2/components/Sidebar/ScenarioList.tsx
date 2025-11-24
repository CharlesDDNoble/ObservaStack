import React from 'react';
import { Scenario } from '../../types';
import { getDifficultyColor } from '../../utils/helpers';

interface ScenarioListProps {
  scenarios: Scenario[];
  onSelectScenario: (scenario: Scenario) => void;
}

export const ScenarioList: React.FC<ScenarioListProps> = ({ scenarios, onSelectScenario }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <h2 className="text-sm text-gray-400 mb-3">Available Scenarios</h2>
      <div className="space-y-2">
        {scenarios.map(scenario => (
          <button
            key={scenario.id}
            onClick={() => onSelectScenario(scenario)}
            className="w-full text-left p-3 rounded bg-slate-700 hover:bg-slate-600 transition-colors border border-slate-600"
          >
            <div className="font-semibold text-sm">{scenario.name}</div>
            <div className="text-xs text-gray-400 mt-1">{scenario.description}</div>
            <div className="mt-2">
              <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(scenario.difficulty)}`}>
                {scenario.difficulty}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

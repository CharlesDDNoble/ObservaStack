import React from 'react';
import { ChevronDown, ChevronUp, Clock, CheckCircle } from 'lucide-react';
import { Scenario } from '../../types';
import { getDifficultyColor, formatTime } from '../../utils/helpers';

interface ScenarioDetailsProps {
  scenario: Scenario;
  isRunning: boolean;
  elapsedTime: number;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

export const ScenarioDetails: React.FC<ScenarioDetailsProps> = ({
  scenario,
  isRunning,
  elapsedTime,
  isExpanded,
  onToggleExpanded
}) => {
  return (
    <div className="p-4 border-b border-blue-500/30">
      <button
        onClick={onToggleExpanded}
        className="w-full flex items-center justify-between text-left mb-2 hover:text-blue-400 transition-colors"
      >
        <h2 className="text-sm text-gray-400 font-semibold">Scenario Details</h2>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="space-y-4 mt-3">
          {/* Scenario Info */}
          <div>
            <h3 className="text-sm text-gray-500 mb-1">Name</h3>
            <div className="text-base font-semibold">{scenario.name}</div>
            <div className="text-sm text-gray-400 mt-1">{scenario.description}</div>
            <div className="mt-2">
              <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(scenario.difficulty)}`}>
                {scenario.difficulty}
              </span>
            </div>
          </div>

          {/* Status */}
          <div>
            <h3 className="text-sm text-gray-500 mb-1">Status</h3>
            <div className="flex items-center gap-2">
              {isRunning ? (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full status-active glow-border"></div>
                  <span className="text-red-400 font-semibold">Active</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  <span className="text-gray-400">Stopped</span>
                </>
              )}
            </div>
          </div>

          {/* Elapsed Time */}
          <div>
            <h3 className="text-sm text-gray-500 mb-1">Elapsed Time</h3>
            <div className="flex items-center gap-2 text-base font-mono">
              <Clock className="w-4 h-4" />
              {formatTime(elapsedTime)}
            </div>
          </div>

          {/* Success Criteria */}
          {scenario.successCriteria && scenario.successCriteria.length > 0 && (
            <div>
              <h3 className="text-sm text-gray-500 mb-1">Success Criteria</h3>
              <div className="space-y-2 text-sm">
                {scenario.successCriteria.map(criterion => (
                  <div key={criterion.id} className="flex items-center gap-2 text-gray-300">
                    <CheckCircle 
                      className={`w-4 h-4 ${criterion.completed ? 'text-green-500' : 'text-gray-500'}`} 
                    />
                    {criterion.description}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

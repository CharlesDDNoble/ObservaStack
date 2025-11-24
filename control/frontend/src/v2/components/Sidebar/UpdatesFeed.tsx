import React from 'react';
import { IncidentUpdate } from '../../types';
import { getUpdateColor, getUpdateLabel, formatLocalTime } from '../../utils/helpers';

interface UpdatesFeedProps {
  updates: IncidentUpdate[];
}

export const UpdatesFeed: React.FC<UpdatesFeedProps> = ({ updates }) => {
  return (
    <div className="flex-1 flex flex-col bg-slate-800 overflow-hidden">
      <div className="p-3 border-b border-slate-700 bg-slate-750">
        <h2 className="text-sm font-semibold text-gray-300">Incident Updates</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {updates.length === 0 ? (
          <div className="text-center text-gray-500 py-8 text-sm">
            No updates yet
          </div>
        ) : (
          updates.slice().reverse().map((update, idx) => (
            <div 
              key={idx}
              className="update-enter"
            >
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-semibold text-xs text-gray-400">
                  {getUpdateLabel(update.type)}
                </span>
                <span className="text-xs text-gray-500">
                  {formatLocalTime(update.timestamp)}
                </span>
              </div>
              <div className={`inline-block px-3 py-2 rounded-lg text-sm border ${getUpdateColor(update.type)}`}>
                <div className="text-gray-200">{update.message}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

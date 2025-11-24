import React from 'react';
import { CheckCircle, AlertCircle, Activity } from 'lucide-react';
import { RequestFeedItem, BusinessMetrics } from '../../types';

interface UserTabProps {
  scenario: any;
  requestFeed: RequestFeedItem[];
  metrics: BusinessMetrics;
}

export const UserTab: React.FC<UserTabProps> = ({ scenario, requestFeed, metrics }) => {
  if (!scenario) {
    return (
      <div className="text-center text-gray-500 py-12">
        Select a scenario to begin investigation
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">User Impact View</h2>
      <p className="text-gray-400 mb-6">Visual representation of what users are experiencing</p>
      
      <div className="space-y-4">
        {/* Simulated Request Feed */}
        <div className="bg-slate-900 rounded-lg p-4 border border-blue-500/30 shadow-lg shadow-blue-500/10">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Live Request Feed
          </h3>
          <div className="font-mono text-sm space-y-1">
            {requestFeed.map((req) => (
              <div 
                key={req.id}
                className={`flex items-center gap-2 request-enter ${req.success ? 'text-green-400' : 'text-red-400'}`}
              >
                {req.success ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span>
                  {req.success 
                    ? `Page loaded (${req.latency}ms)` 
                    : `Page failed (${req.latency}ms) - ${Math.random() > 0.5 ? '503 Error' : 'timeout'}`
                  }
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Business Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="metric-card bg-slate-900 rounded-lg p-4 border border-blue-500/30 shadow-lg shadow-blue-500/10">
            <div className="text-sm text-gray-400 mb-1">Success Rate</div>
            <div className="text-2xl font-bold text-yellow-400">{metrics.successRate.toFixed(1)}%</div>
            <div className="text-xs text-red-400 mt-1">↓ from 97%</div>
          </div>
          <div className="metric-card bg-slate-900 rounded-lg p-4 border border-blue-500/30 shadow-lg shadow-blue-500/10">
            <div className="text-sm text-gray-400 mb-1">Avg Response Time</div>
            <div className="text-2xl font-bold text-red-400">{Math.round(metrics.avgResponseTime)}ms</div>
            <div className="text-xs text-red-400 mt-1">↑ from 180ms</div>
          </div>
          <div className="metric-card bg-slate-900 rounded-lg p-4 border border-blue-500/30 shadow-lg shadow-blue-500/10">
            <div className="text-sm text-gray-400 mb-1">Availability</div>
            <div className="text-2xl font-bold text-yellow-400">{metrics.availability.toFixed(1)}%</div>
            <div className="text-xs text-red-400 mt-1">↓ from 99.9%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

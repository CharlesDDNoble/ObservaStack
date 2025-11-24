import React from 'react';
import { BarChart3 } from 'lucide-react';

interface ObservabilityTabProps {
  scenario: any;
}

export const ObservabilityTab: React.FC<ObservabilityTabProps> = ({ scenario }) => {
  if (!scenario) {
    return (
      <div className="text-center text-gray-500 py-12">
        Select a scenario to view observability data
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Observability Dashboard</h2>
      <p className="text-gray-400 mb-6">Embedded Grafana view for metrics, logs, traces, and profiles</p>
      
      <div className="bg-slate-900 rounded-lg p-6 border border-blue-500/30 shadow-lg shadow-blue-500/10 h-[600px] flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-blue-400" />
          <p className="text-gray-400">Grafana Dashboard Placeholder</p>
          <p className="text-sm text-gray-500 mt-2">
            In production, this would show:<br/>
            • Golden Signals (Latency, Errors, Traffic, Saturation)<br/>
            • Service-specific dashboards<br/>
            • Quick links to Logs (Loki), Traces (Tempo), Profiles (Pyroscope)
          </p>
        </div>
      </div>
    </div>
  );
};

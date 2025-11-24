import React from 'react';

interface TestTabProps {
  scenario: any;
}

export const TestTab: React.FC<TestTabProps> = ({ scenario }) => {
  if (!scenario) {
    return (
      <div className="text-center text-gray-500 py-12">
        Select a scenario to access testing tools
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Test & Remediation Toolkit</h2>
      <p className="text-gray-400 mb-6">Tools for testing, diagnostics, and system control</p>
      
      <div className="space-y-4">
        {/* API Explorer */}
        <div className="bg-slate-900 rounded-lg p-4 border border-blue-500/30 shadow-lg shadow-blue-500/10">
          <h3 className="font-semibold mb-3">API Explorer</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Endpoint</label>
              <select className="w-full bg-slate-950 border border-blue-500/30 rounded px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors">
                <option>/api/health</option>
                <option>/api/users</option>
                <option>/api/data</option>
              </select>
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 rounded px-4 py-2 transition-all hover:shadow-lg hover:shadow-blue-500/50">
              Send Request
            </button>
          </div>
        </div>

        {/* Diagnostics */}
        <div className="bg-slate-900 rounded-lg p-4 border border-blue-500/30 shadow-lg shadow-blue-500/10">
          <h3 className="font-semibold mb-3">Diagnostics</h3>
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded transition-all hover:shadow-lg hover:shadow-blue-500/30 border border-blue-500/20">
              Check Service Health
            </button>
            <button className="w-full text-left px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded transition-all hover:shadow-lg hover:shadow-blue-500/30 border border-blue-500/20">
              Analyze Recent Errors
            </button>
            <button className="w-full text-left px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded transition-all hover:shadow-lg hover:shadow-blue-500/30 border border-blue-500/20">
              Review Resource Usage
            </button>
          </div>
        </div>

        {/* Terminal */}
        <div className="bg-slate-900 rounded-lg p-4 border border-blue-500/30 shadow-lg shadow-blue-500/10">
          <h3 className="font-semibold mb-3">Terminal</h3>
          <div className="bg-black rounded p-3 font-mono text-sm text-green-400 border border-green-500/30">
            <div>$ <span className="animate-pulse">_</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

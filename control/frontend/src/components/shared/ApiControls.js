import React from 'react';
import { RefreshCw, Play } from 'lucide-react';

const ApiControls = ({ 
  onRefetch, 
  onCallEndpoint, 
  isLoading, 
  hasEndpoint 
}) => {
  return (
    <div className="flex gap-3 mb-4">
      <button
        onClick={onRefetch}
        disabled={isLoading || !hasEndpoint}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
        Refresh
      </button>
      
      <button
        onClick={onCallEndpoint}
        disabled={isLoading || !hasEndpoint}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Play size={16} />
        Call API
      </button>
    </div>
  );
};

export default ApiControls;

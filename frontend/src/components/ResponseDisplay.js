import React from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

const ResponseDisplay = ({ data, error, isLoading, endpoint }) => {
  if (!endpoint) {
    return (
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 text-gray-400 text-center">
        Select an API endpoint to see the response
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 flex items-center gap-3">
        <Clock size={20} className="text-blue-400 animate-pulse" />
        <span className="text-gray-300">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-2">
          <XCircle size={20} className="text-red-400" />
          <span className="text-red-300 font-medium">Error</span>
        </div>
        <pre className="text-red-200 text-sm whitespace-pre-wrap break-words">
          {error}
        </pre>
      </div>
    );
  }

  if (data) {
    return (
      <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <CheckCircle size={20} className="text-green-400" />
          <span className="text-green-300 font-medium">Success</span>
        </div>
        <pre className="bg-gray-800 border border-gray-600 rounded p-3 text-gray-200 text-sm overflow-x-auto whitespace-pre-wrap break-words">
          {typeof data === 'object' ? JSON.stringify(data, null, 2) : data}
        </pre>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 text-gray-400 text-center">
      No response yet
    </div>
  );
};

export default ResponseDisplay;
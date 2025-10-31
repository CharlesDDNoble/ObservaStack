import React from 'react';
import { ChevronDown } from 'lucide-react';

const ApiSelector = ({ 
  endpoints, 
  selectedEndpoint, 
  onEndpointChange, 
  isLoading 
}) => {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Select API Endpoint:
      </label>
      <div className="relative">
        <select
          value={selectedEndpoint || ''}
          onChange={(e) => onEndpointChange(e.target.value)}
          disabled={isLoading}
          className="w-full appearance-none bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">Select an endpoint...</option>
          {Object.entries(endpoints).map(([key, endpoint]) => (
            <option key={key} value={endpoint.url}>
              {endpoint.name} - {endpoint.description}
            </option>
          ))}
        </select>
        <ChevronDown 
          size={20} 
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" 
        />
      </div>
    </div>
  );
};

export default ApiSelector;
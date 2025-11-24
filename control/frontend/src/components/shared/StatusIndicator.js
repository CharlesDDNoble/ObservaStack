import React from 'react';

const StatusIndicator = ({ status = 'unknown' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          color: 'bg-green-500',
          label: 'Connected',
          textColor: 'text-green-400',
          pulseColor: 'bg-green-500'
        };
      case 'loading':
        return {
          color: 'bg-yellow-500',
          label: 'Loading',
          textColor: 'text-yellow-400',
          pulseColor: 'bg-yellow-500'
        };
      case 'error':
        return {
          color: 'bg-red-500',
          label: 'Error',
          textColor: 'text-red-400',
          pulseColor: 'bg-red-500'
        };
      case 'disconnected':
        return {
          color: 'bg-gray-500',
          label: 'Disconnected',
          textColor: 'text-gray-400',
          pulseColor: 'bg-gray-500'
        };
      default:
        return {
          color: 'bg-gray-600',
          label: 'Unknown',
          textColor: 'text-gray-400',
          pulseColor: 'bg-gray-600'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className={`w-2 h-2 rounded-full ${config.color}`} />
        {status === 'connected' && (
          <div className={`absolute inset-0 w-2 h-2 rounded-full ${config.pulseColor} status-pulse`} />
        )}
      </div>
      <span className={`text-sm font-medium ${config.textColor}`}>
        {config.label}
      </span>
    </div>
  );
};

export default StatusIndicator;

import React, { useState } from 'react';
import { Server, AlertCircle, BarChart3, Settings } from 'lucide-react';
import Card, { CARD_STATUS } from './components/Card';
import ApiSelector from './components/ApiSelector';
import ApiControls from './components/ApiControls';
import ResponseDisplay from './components/ResponseDisplay';
import { useApi } from './hooks/useApi';
import { API_ENDPOINTS } from './config/apiEndpoints';

export default function App() {
  const [selectedEndpoint, setSelectedEndpoint] = useState('');
  const { 
    data: apiData, 
    error: apiError, 
    isLoading, 
    currentEndpoint,
    refetch, 
    switchEndpoint, 
    callEndpoint 
  } = useApi(null, false); // Don't auto-fetch, wait for user selection

  // Helper functions
  const getApiCardDescription = () => {
    if (!selectedEndpoint) return "Select an API endpoint above to test connectivity";
    if (isLoading) return "Testing connection...";
    if (apiError) return "Connection failed - check response above";
    if (apiData) return "Connection successful - see response above";
    return "Ready to test API connection";
  };

  const getApiCardStatus = () => {
    if (!selectedEndpoint) return CARD_STATUS.LOADING;
    if (isLoading) return CARD_STATUS.LOADING;
    if (apiError) return CARD_STATUS.ERROR;
    if (apiData) return CARD_STATUS.OK;
    return CARD_STATUS.LOADING;
  };

  const getApiCardIcon = () => {
    if (isLoading) return <Server size={24} />;
    if (apiError) return <AlertCircle size={24} />;
    return <Server size={24} />;
  };

  // Event handlers
  const handleEndpointChange = (endpoint) => {
    setSelectedEndpoint(endpoint);
    if (endpoint) {
      switchEndpoint(endpoint);
    }
  };

  const handleCheckConnection = () => {
    if (selectedEndpoint) {
      callEndpoint(selectedEndpoint);
    }
  };

  const handleViewAnalytics = () => {
    // TODO: Navigate to analytics page
    console.log('Navigate to analytics');
  };

  const handleGoToSettings = () => {
    // TODO: Navigate to settings page
    console.log('Navigate to settings');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950 p-6">
      <div className="w-full max-w-6xl">
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          Application Control Panel
        </h1>
        
        {/* API Testing Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">API Testing</h2>
          
          <ApiSelector
            endpoints={API_ENDPOINTS}
            selectedEndpoint={selectedEndpoint}
            onEndpointChange={handleEndpointChange}
            isLoading={isLoading}
          />
          
          <ApiControls
            onRefetch={refetch}
            onCallEndpoint={() => callEndpoint(selectedEndpoint)}
            isLoading={isLoading}
            hasEndpoint={!!selectedEndpoint}
          />
          
          {/* Current endpoint display */}
          {currentEndpoint && (
            <div className="text-sm text-gray-400 mb-4">
              Current endpoint: <code className="bg-gray-800 px-2 py-1 rounded">{currentEndpoint}</code>
            </div>
          )}
          
          {/* Response Display */}
          <ResponseDisplay
            data={apiData}
            error={apiError}
            isLoading={isLoading}
            endpoint={selectedEndpoint}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card
            icon={getApiCardIcon()}
            title="API Response"
            description={getApiCardDescription()}
            buttonText="Test API"
            status={getApiCardStatus()}
            onButtonClick={handleCheckConnection}
          />
          
          <Card
            icon={<BarChart3 size={24} />}
            title="Analytics"
            description="View application usage, user metrics, and performance analytics."
            buttonText="View Analytics"
            onButtonClick={handleViewAnalytics}
          />
          
          <Card
            icon={<Settings size={24} />}
            title="Settings"
            description="Configure application settings, manage user permissions, and set up integrations."
            buttonText="Go to Settings"
            onButtonClick={handleGoToSettings}
          />
        </div>
      </div>
    </div>
  );
}


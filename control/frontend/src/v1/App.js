import React, { useState, useCallback, useMemo } from 'react';
import { useApi } from './hooks/useApi';
import { useParallelApi } from './hooks/useParallelApi';
import { useOpenApiSchema } from './hooks/useOpenApiSchema';
import { getApiBaseUrl } from './config/apiEndpoints';
import { dashboardLayouts } from './config/dashboardLayouts';
import DashboardPage from './components/dashboard/DashboardPage';
import LoadingScreen from '../common/ui/LoadingScreen';

export default function ObservaStackV1() {
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const [selectedEndpoint, setSelectedEndpoint] = useState('');
  const [builtEndpoint, setBuiltEndpoint] = useState(''); // The actual URL with parameters filled in
  const [loadTestSummary, setLoadTestSummary] = useState(null);
  
  // Fetch endpoints dynamically from OpenAPI schema
  const baseUrl = getApiBaseUrl();
  const { endpoints, loading: endpointsLoading, error: endpointsError } = useOpenApiSchema(baseUrl);
  
  const { 
    data: apiData, 
    error: apiError, 
    isLoading, 
    currentEndpoint,
    refetch, 
    switchEndpoint, 
    callEndpoint,
    clearData
  } = useApi(null, false); // Don't auto-fetch, wait for user selection

  const {
    results: loadTestResults,
    isRunning: isLoadTestRunning,
    progress: loadTestProgress,
    chartData: loadTestChartData,
    runParallelRequests,
    stopRequests,
    clearResults: clearLoadTestResults
  } = useParallelApi();

  // Event handlers
  const handleEndpointChange = useCallback((endpoint) => {
    setSelectedEndpoint(endpoint);
    // Clear previous API results when changing endpoint
    clearData();
    // Clear load test results when changing endpoint
    clearLoadTestResults();
    setLoadTestSummary(null);
  }, [clearData, clearLoadTestResults]);
  
  const handleEndpointUpdate = useCallback((templateUrl, builtUrl) => {
    // Called when parameters change - updates both template and built URL
    setSelectedEndpoint(templateUrl);
    setBuiltEndpoint(builtUrl);
    // Don't clear data here - only clear when endpoint itself changes
  }, []);

  const handleCheckConnection = useCallback((url, options = {}) => {
    if (url) {
      // Use the built URL with parameters
      callEndpoint(url, options);
      setSelectedEndpoint(url); // Update for display purposes
      setBuiltEndpoint(url); // Store the built URL for load testing
    }
  }, [callEndpoint]);

  const handleRunLoadTest = useCallback(async (config) => {
    try {
      // Clear previous results before starting new test
      clearLoadTestResults();
      setLoadTestSummary(null);
      
      const summary = await runParallelRequests(config);
      setLoadTestSummary(summary);
    } catch (error) {
      console.error('Load test failed:', error);
    }
  }, [runParallelRequests, clearLoadTestResults]);

  const handleStopLoadTest = useCallback(() => {
    stopRequests();
  }, [stopRequests]);

  const handleClearLoadTestResults = useCallback(() => {
    clearLoadTestResults();
    setLoadTestSummary(null);
  }, [clearLoadTestResults]);

  const handleLoadComplete = useCallback(() => {
    setShowLoadingScreen(false);
  }, []);

  const panelProps = useMemo(() => ({
    modeSelector: {},
    apiConfig: {
      endpoints,
      selectedEndpoint,
      endpointsLoading,
      endpointsError,
      onEndpointChange: handleEndpointChange,
      onEndpointUpdate: handleEndpointUpdate,
      onCallEndpoint: handleCheckConnection,
      isLoading
    },
    apiResponse: {
      currentEndpoint,
      data: apiData,
      error: apiError,
      isLoading,
      endpointLabel: selectedEndpoint
    },
    loadControls: {
      onRunTest: handleRunLoadTest,
      onStopTest: handleStopLoadTest,
      onClearResults: handleClearLoadTestResults,
      isRunning: isLoadTestRunning,
      selectedEndpoint: builtEndpoint || selectedEndpoint,
      hasResults: loadTestResults.length > 0
    },
    loadCharts: {
      chartData: loadTestChartData,
      isRunning: isLoadTestRunning
    },
    loadResults: {
      results: loadTestResults,
      isRunning: isLoadTestRunning,
      progress: loadTestProgress,
      summary: loadTestSummary
    }
  }), [
    apiData,
    apiError,
    builtEndpoint,
    currentEndpoint,
    endpoints,
    endpointsError,
    endpointsLoading,
    handleCheckConnection,
    handleClearLoadTestResults,
    handleEndpointChange,
    handleEndpointUpdate,
    handleRunLoadTest,
    handleStopLoadTest,
    isLoadTestRunning,
    isLoading,
    loadTestChartData,
    loadTestProgress,
    loadTestResults,
    loadTestSummary,
    selectedEndpoint
  ]);

  const dashboardStatus = useMemo(() => {
    if (endpointsLoading) return 'loading';
    if (endpointsError) return 'error';
    if (apiData) return 'connected';
    return 'unknown';
  }, [apiData, endpointsError, endpointsLoading]);

  return (
    <>
      {showLoadingScreen && (
        <LoadingScreen onLoadComplete={handleLoadComplete} duration={4500} />
      )}
      <div className="min-h-screen bg-background p-4 md:p-6">
        <DashboardPage 
          status={dashboardStatus}
          layouts={dashboardLayouts}
          panels={panelProps}
        />
      </div>
    </>
  );
}




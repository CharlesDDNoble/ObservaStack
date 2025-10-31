import { useState, useEffect, useCallback } from 'react';

export const useApi = (initialEndpoint = null, autoFetch = true) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentEndpoint, setCurrentEndpoint] = useState(initialEndpoint);

  const fetchData = useCallback(async (endpoint = currentEndpoint) => {
    if (!endpoint) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Failed to fetch:', err);
      setError(err.message || 'Failed to fetch data.');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [currentEndpoint]);

  const refetch = useCallback(() => fetchData(), [fetchData]);
  
  const switchEndpoint = useCallback((newEndpoint) => {
    setCurrentEndpoint(newEndpoint);
    setData(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (autoFetch && currentEndpoint) {
      fetchData();
    }
  }, [currentEndpoint, autoFetch, fetchData]);

  return { 
    data, 
    error, 
    isLoading, 
    currentEndpoint,
    refetch, 
    switchEndpoint, 
    fetchData
  };
};
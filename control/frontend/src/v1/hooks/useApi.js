import { useState, useEffect, useCallback } from 'react';

export const useApi = (initialEndpoint = null, autoFetch = true) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentEndpoint, setCurrentEndpoint] = useState(initialEndpoint);

  const fetchData = useCallback(async (endpoint = currentEndpoint, options = {}) => {
    if (!endpoint) return;
    
    console.log('useApi fetchData called with:', { endpoint, options });
    
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchOptions = {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      };
      
      // Only add body for non-GET requests
      if (options.method && options.method !== 'GET' && options.body) {
        fetchOptions.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
      }
      
      console.log('Final fetchOptions:', fetchOptions);
      
      const response = await fetch(endpoint, fetchOptions);
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

  const callEndpoint = useCallback((endpoint, options = {}) => {
    fetchData(endpoint, options);
  }, [fetchData]);

  const clearData = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { 
    data, 
    error, 
    isLoading, 
    currentEndpoint,
    refetch, 
    switchEndpoint, 
    callEndpoint,
    clearData
  };
};

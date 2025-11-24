import { useState, useCallback, useRef } from 'react';

// Configuration constants
const MAX_REQUESTS = 10000;
const MAX_CONCURRENCY = 20;
const CHROME_CONCURRENCY_LIMIT = 16;
const DEFAULT_CONCURRENCY_LIMIT = 8;
const DEFAULT_TIMEOUT_MS = 15000;
const DOWNSAMPLE_THRESHOLD = 50;
const UPDATE_BATCH_FREQUENCY = 3; // Update UI every N batches
const MIN_ADAPTIVE_CONCURRENCY = 2;
const RESOURCE_ERROR_THRESHOLD = 0.1; // 10%
const RESOURCE_ERROR_COUNT_THRESHOLD = 5;
const CONCURRENCY_REDUCTION_FACTOR = 0.7;
const CONCURRENCY_INCREASE_LIMIT = 1.5;
const CONCURRENCY_INCREASE_STEP = 2;
const FAST_RESPONSE_THRESHOLD_MS = 1000;
const SLOW_RESPONSE_THRESHOLD_MS = 2000;
const MIN_DELAY_MS = 25;
const RESOURCE_ERROR_DELAY_MS = 200;
const SLOW_RESPONSE_DELAY_MS = 100;

export const useParallelApi = () => {
  const [results, setResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [chartData, setChartData] = useState([]);
  const shouldStopRef = useRef(false);

  const runParallelRequests = useCallback(async (config) => {
    const { endpoint, count, concurrency = 6, delay = 100, adaptiveConcurrency = true } = config;
    
    // Validate inputs with more flexible limits
    const safeCount = Math.min(count, MAX_REQUESTS);
    let currentConcurrency = Math.min(concurrency, MAX_CONCURRENCY);
    
    // Adaptive concurrency based on browser capabilities
    if (adaptiveConcurrency) {
      const navigatorConcurrency = navigator.hardwareConcurrency || 4;
      const browserLimit = navigator.userAgent.includes('Chrome') ? CHROME_CONCURRENCY_LIMIT : DEFAULT_CONCURRENCY_LIMIT;
      currentConcurrency = Math.min(concurrency, Math.max(navigatorConcurrency * 2, browserLimit));
    }
    
    setIsRunning(true);
    shouldStopRef.current = false;
    setResults([]);
    setChartData([]);
    setProgress({ completed: 0, total: safeCount });

    const results = [];
    const chartDataPoints = [];
    const startTime = Date.now();
    const errorCounts = { timeout: 0, resource: 0, network: 0 };
    let dynamicConcurrency = currentConcurrency;

    // Function to make a single request with adaptive timeout
    const makeRequest = async (requestId, timeoutMs = DEFAULT_TIMEOUT_MS) => {
      const queueStartTime = Date.now(); // When promise was created
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      try {
        // Measure actual request execution time (not queue time)
        const requestStartTime = performance.now();
        
        const response = await fetch(endpoint, { 
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive' // Reuse connections when possible
          }
        });
        
        const requestEndTime = performance.now();
        clearTimeout(timeoutId);
        
        // Parse response body if possible
        let data = null;
        try {
          data = await response.json();
        } catch (e) {
          // If response body isn't JSON, that's okay for load testing
          data = { error: 'Non-JSON response' };
        }
        
        const parseEndTime = performance.now();
        
        // Calculate different timing metrics
        const networkDuration = Math.round(requestEndTime - requestStartTime);
        const totalDuration = Math.round(parseEndTime - requestStartTime);
        const queueTime = Date.now() - queueStartTime;
        
        return {
          id: requestId,
          success: response.ok, // true for 2xx, false for 4xx/5xx
          status: response.status,
          statusText: response.statusText,
          data,
          duration: totalDuration,        // Total time including JSON parsing
          networkDuration,                // Pure network time
          queueTime: Math.max(0, queueTime - totalDuration), // Time spent in queue
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        clearTimeout(timeoutId);
        const errorTime = Date.now();
        const duration = errorTime - queueStartTime; // Total time from queue to error
        
        let errorMessage = error.message;
        let errorType = 'network';
        
        if (error.name === 'AbortError') {
          errorMessage = `Request timeout (${timeoutMs/1000}s)`;
          errorType = 'timeout';
          errorCounts.timeout++;
        } else if (error.message.includes('ERR_INSUFFICIENT_RESOURCES')) {
          errorMessage = 'Browser resource limit reached';
          errorType = 'resource';
          errorCounts.resource++;
        } else {
          errorCounts.network++;
        }
        
        return {
          id: requestId,
          success: false,
          error: errorMessage,
          errorType,
          duration,
          networkDuration: 0,  // No network time for failed requests
          queueTime: duration, // All time was queue/error time
          timestamp: new Date().toISOString()
        };
      }
    };

    // Dynamic batch creation with adaptive concurrency
    const createBatch = (startIndex, batchSize) => {
      const batch = [];
      const endIndex = Math.min(startIndex + batchSize, safeCount);
      const actualSize = endIndex - startIndex; // How many we'll actually create
      for (let j = startIndex; j < endIndex; j++) {
        batch.push(makeRequest(j + 1));
      }
      return { batch, size: actualSize };
    };

    // Execute batches with adaptive concurrency management
    let processedCount = 0;
    let batchIndex = 0;
    
    while (processedCount < safeCount && !shouldStopRef.current) {
      // Ensure we don't create more requests than needed
      const remainingRequests = safeCount - processedCount;
      const batchSize = Math.min(dynamicConcurrency, remainingRequests);
      
      const { batch, size } = createBatch(processedCount, batchSize);
      const batchStartTime = Date.now();
      
      const batchResults = await Promise.allSettled(batch);
      const batchDuration = Date.now() - batchStartTime;
      
      // Process all results - both fulfilled and rejected
      const processedResults = batchResults.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          // Handle unexpected promise rejections
          console.error('Unexpected promise rejection in batch:', result.reason);
          return {
            id: processedCount + index + 1,
            success: false,
            error: result.reason?.message || 'Unexpected error',
            errorType: 'unexpected',
            duration: 0,
            networkDuration: 0,
            queueTime: 0,
            timestamp: new Date().toISOString()
          };
        }
      });
      
      results.push(...processedResults);
      processedCount += size;
      batchIndex++;
      
      // Calculate current metrics for chart
      const currentTime = Date.now() - startTime;
      const successfulInBatch = processedResults.filter(r => r.success).length;
      const failedInBatch = processedResults.filter(r => !r.success).length;
      const networkTimesInBatch = processedResults
        .filter(r => r.success && r.networkDuration > 0)
        .map(r => r.networkDuration);
      
      // Calculate percentiles for the batch
      const sortedTimes = [...networkTimesInBatch].sort((a, b) => a - b);
      const p50 = sortedTimes.length > 0 ? sortedTimes[Math.floor(sortedTimes.length * 0.5)] : 0;
      const p90 = sortedTimes.length > 0 ? sortedTimes[Math.floor(sortedTimes.length * 0.9)] : 0;
      const p99 = sortedTimes.length > 0 ? sortedTimes[Math.floor(sortedTimes.length * 0.99)] : 0;
      
      // Calculate RPS for this batch
      const batchRps = batchDuration > 0 ? (size / batchDuration) * 1000 : 0;
      const totalRps = currentTime > 0 ? (results.length / currentTime) * 1000 : 0;
      
      // Calculate error rate
      const totalErrors = results.filter(r => !r.success).length;
      const errorRate = results.length > 0 ? (totalErrors / results.length) * 100 : 0;
      
      // Create chart data point
      const chartPoint = {
        time: currentTime,
        timestamp: Date.now(),
        rps: totalRps,
        batchRps: batchRps,
        errorRate: errorRate,
        successful: successfulInBatch,
        failed: failedInBatch,
        totalSuccessful: results.filter(r => r.success).length,
        totalFailed: totalErrors,
        p50,
        p90,
        p99,
        avgLatency: networkTimesInBatch.length > 0 
          ? networkTimesInBatch.reduce((sum, t) => sum + t, 0) / networkTimesInBatch.length 
          : 0,
        minLatency: networkTimesInBatch.length > 0 ? Math.min(...networkTimesInBatch) : 0,
        maxLatency: networkTimesInBatch.length > 0 ? Math.max(...networkTimesInBatch) : 0,
      };
      
      chartDataPoints.push(chartPoint);
      
      // Adaptive concurrency adjustment based on error rates and performance
      const resourceErrorRate = errorCounts.resource / results.length;
      const avgResponseTime = batchDuration / size;
      
      if (resourceErrorRate > RESOURCE_ERROR_THRESHOLD || errorCounts.resource > RESOURCE_ERROR_COUNT_THRESHOLD) {
        // Too many resource errors - reduce concurrency
        dynamicConcurrency = Math.max(MIN_ADAPTIVE_CONCURRENCY, Math.floor(dynamicConcurrency * CONCURRENCY_REDUCTION_FACTOR));
        console.log(`Reduced concurrency to ${dynamicConcurrency} due to resource errors`);
      } else if (resourceErrorRate < 0.05 && avgResponseTime < FAST_RESPONSE_THRESHOLD_MS && dynamicConcurrency < currentConcurrency * CONCURRENCY_INCREASE_LIMIT) {
        // Low error rate and fast responses - can increase concurrency
        dynamicConcurrency = Math.min(currentConcurrency * CONCURRENCY_INCREASE_LIMIT, dynamicConcurrency + CONCURRENCY_INCREASE_STEP);
      }
      
      // Update state less frequently to reduce re-renders
      if (batchIndex % UPDATE_BATCH_FREQUENCY === 0 || processedCount >= safeCount) {
        setResults([...results]);
        setChartData([...chartDataPoints]);
      }
      setProgress({ completed: results.length, total: safeCount });

      // Dynamic delay based on performance
      let batchDelay = delay;
      if (errorCounts.resource > 0) {
        batchDelay = Math.max(delay, RESOURCE_ERROR_DELAY_MS); // Longer delay if resource issues
      } else if (avgResponseTime > SLOW_RESPONSE_THRESHOLD_MS) {
        batchDelay = Math.max(delay, SLOW_RESPONSE_DELAY_MS); // Longer delay if slow responses
      } else {
        batchDelay = Math.max(delay, MIN_DELAY_MS); // Shorter delay if performing well
      }
      
      if (processedCount < safeCount) {
        await new Promise(resolve => setTimeout(resolve, batchDelay));
      }
    }

    const totalDuration = Date.now() - startTime;
    setIsRunning(false);

    // Final results update
    setResults([...results]);
    setChartData([...chartDataPoints]);

    // Return summary statistics with safe calculations
    const successfulResults = results.filter(r => r.success);
    const failedResults = results.filter(r => !r.success);
    
    // Calculate metrics using network time (more accurate)
    const networkTimes = successfulResults.map(r => r.networkDuration).filter(d => d > 0);
    const queueTimes = successfulResults.map(r => r.queueTime).filter(d => d > 0);
    
    return {
      total: results.length,
      successful: successfulResults.length,
      failed: failedResults.length,
      totalDuration,
      // Network-only response times (most accurate for API performance)
      averageResponseTime: networkTimes.length > 0 
        ? networkTimes.reduce((sum, t) => sum + t, 0) / networkTimes.length 
        : 0,
      minResponseTime: networkTimes.length > 0 
        ? Math.min(...networkTimes) 
        : 0,
      maxResponseTime: networkTimes.length > 0 
        ? Math.max(...networkTimes) 
        : 0,
      // Additional queue time metrics
      averageQueueTime: queueTimes.length > 0 
        ? queueTimes.reduce((sum, t) => sum + t, 0) / queueTimes.length 
        : 0,
      maxQueueTime: queueTimes.length > 0 
        ? Math.max(...queueTimes) 
        : 0,
      requestsPerSecond: successfulResults.length > 0 
        ? Math.round((successfulResults.length / totalDuration) * 1000) 
        : 0,
      stopped: shouldStopRef.current
    };
  }, []);

  const stopRequests = useCallback(() => {
    shouldStopRef.current = true;
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setChartData([]);
    setProgress({ completed: 0, total: 0 });
    shouldStopRef.current = false;
  }, []);

  return {
    results,
    isRunning,
    progress,
    chartData,
    runParallelRequests,
    stopRequests,
    clearResults
  };
};

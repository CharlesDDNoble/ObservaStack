import { useState, useEffect } from 'react';
import { RequestFeedItem, BusinessMetrics } from '../types';

interface UseRequestFeedOptions {
  isRunning: boolean;
  interval?: number;
}

export const useRequestFeed = ({ isRunning, interval = 800 }: UseRequestFeedOptions) => {
  const [requestFeed, setRequestFeed] = useState<RequestFeedItem[]>([]);
  const [metrics, setMetrics] = useState<BusinessMetrics>({
    successRate: 97,
    avgResponseTime: 180,
    availability: 99.9
  });

  useEffect(() => {
    if (!isRunning) return;
    
    const feedInterval = setInterval(() => {
      const isSuccess = Math.random() > 0.15;
      const latency = isSuccess 
        ? Math.floor(Math.random() * 300) + 100 
        : Math.floor(Math.random() * 5000) + 3000;
      
      const newRequest: RequestFeedItem = {
        id: Date.now(),
        success: isSuccess,
        latency,
        timestamp: Date.now()
      };
      
      setRequestFeed(prev => [newRequest, ...prev.slice(0, 9)]);
      
      // Update metrics with some randomness
      setMetrics(prev => ({
        successRate: Math.max(85, Math.min(99, prev.successRate + (Math.random() - 0.5) * 2)),
        avgResponseTime: Math.max(180, Math.min(3000, prev.avgResponseTime + (Math.random() - 0.3) * 100)),
        availability: Math.max(90, Math.min(100, prev.availability + (Math.random() - 0.5) * 0.5))
      }));
    }, interval);
    
    return () => clearInterval(feedInterval);
  }, [isRunning, interval]);

  const reset = () => {
    setRequestFeed([]);
    setMetrics({
      successRate: 97,
      avgResponseTime: 180,
      availability: 99.9
    });
  };

  return { requestFeed, metrics, reset };
};

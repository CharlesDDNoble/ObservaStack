import { useState, useEffect } from 'react';

export const useTimer = (isRunning: boolean) => {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const reset = () => setElapsedTime(0);

  return { elapsedTime, reset };
};

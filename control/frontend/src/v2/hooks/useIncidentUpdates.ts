import { useState } from 'react';
import { IncidentUpdate } from '../types';

export const useIncidentUpdates = () => {
  const [updates, setUpdates] = useState<IncidentUpdate[]>([]);

  const addUpdate = (time: number, type: IncidentUpdate['type'], icon: string, message: string) => {
    const newUpdate: IncidentUpdate = {
      time,
      type,
      icon,
      message,
      timestamp: new Date()
    };
    setUpdates(prev => [newUpdate, ...prev]);
  };

  const clearUpdates = () => {
    setUpdates([]);
  };

  return { updates, addUpdate, clearUpdates };
};

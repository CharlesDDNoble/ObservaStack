// Utility functions for v2 UI

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const pad = (num: number): string => num < 10 ? `0${num}` : `${num}`;
  return `${pad(mins)}:${pad(secs)}`;
};

export const formatLocalTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
};

export const getDifficultyColor = (difficulty: string): string => {
  switch(difficulty) {
    case 'Beginner':
      return 'bg-green-500/20 text-green-400';
    case 'Intermediate':
      return 'bg-yellow-500/20 text-yellow-400';
    case 'Advanced':
      return 'bg-red-500/20 text-red-400';
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
};

export const getUpdateColor = (type: string): string => {
  switch(type) {
    case 'hint':
      return 'bg-blue-500/20 border-blue-500/30';
    case 'system':
      return 'bg-gray-500/20 border-gray-500/30';
    case 'metric':
      return 'bg-green-500/20 border-green-500/30';
    case 'incident':
      return 'bg-red-500/20 border-red-500/30';
    case 'stakeholder':
      return 'bg-purple-500/20 border-purple-500/30';
    default:
      return 'bg-gray-500/20 border-gray-500/30';
  }
};

export const getUpdateLabel = (type: string): string => {
  switch(type) {
    case 'hint':
      return 'System';
    case 'metric':
      return 'Metrics';
    case 'system':
      return 'System';
    case 'stakeholder':
      return 'Team';
    case 'incident':
      return 'Incident';
    default:
      return 'System';
  }
};

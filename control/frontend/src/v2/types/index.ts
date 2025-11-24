// Type definitions for ObservaStack v2 UI

export interface Scenario {
  id: number;
  name: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  successCriteria?: SuccessCriterion[];
}

export interface SuccessCriterion {
  id: string;
  description: string;
  completed: boolean;
}

export interface IncidentUpdate {
  time: number;
  type: 'hint' | 'system' | 'metric' | 'incident' | 'stakeholder';
  icon: string;
  message: string;
  timestamp: Date;
}

export interface RequestFeedItem {
  id: number;
  success: boolean;
  latency: number;
  timestamp: number;
}

export interface BusinessMetrics {
  successRate: number;
  avgResponseTime: number;
  availability: number;
}

export type TabType = 'user' | 'observability' | 'test';

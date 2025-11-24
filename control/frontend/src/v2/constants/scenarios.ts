import { Scenario } from '../types';

export const SCENARIOS: Scenario[] = [
  { 
    id: 1, 
    name: "High Latency", 
    difficulty: "Beginner", 
    description: "Users reporting slow page loads",
    successCriteria: [
      { id: 'latency', description: 'P95 latency < 200ms for 2 minutes', completed: false },
      { id: 'errors', description: 'Error rate < 1%', completed: false }
    ]
  },
  { 
    id: 2, 
    name: "Memory Leak", 
    difficulty: "Intermediate", 
    description: "Service memory growing over time",
    successCriteria: [
      { id: 'memory', description: 'Memory usage stable for 5 minutes', completed: false },
      { id: 'errors', description: 'No OOM errors', completed: false }
    ]
  },
  { 
    id: 3, 
    name: "CPU Regression", 
    difficulty: "Beginner", 
    description: "High CPU usage after deployment",
    successCriteria: [
      { id: 'cpu', description: 'CPU usage < 70% for 3 minutes', completed: false },
      { id: 'throughput', description: 'Request throughput restored to baseline', completed: false }
    ]
  },
  { 
    id: 4, 
    name: "Database Connection Pool Exhaustion", 
    difficulty: "Advanced", 
    description: "Service failing to connect to database",
    successCriteria: [
      { id: 'connections', description: 'Connection pool has available connections', completed: false },
      { id: 'errors', description: 'Connection errors < 1%', completed: false },
      { id: 'latency', description: 'Database query latency < 100ms', completed: false }
    ]
  }
];

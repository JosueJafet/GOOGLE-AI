export type EnergyLevel = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  uid: string;
  title: string;
  description?: string;
  energyRequired: EnergyLevel;
  duration: number; // in minutes
  completed: boolean;
  createdAt: number;
  priority: number; // 1-5
}

export interface FlowSession {
  id: string;
  uid: string;
  taskId: string;
  startTime: number;
  endTime?: number;
  duration: number;
  focusScore: number; // 1-100
}

export type View = 'dashboard' | 'tasks' | 'focus' | 'analytics' | 'settings';

export type Theme = 'dark' | 'light' | 'system';

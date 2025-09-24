
export interface User {
  id: string;
  name: string;
  isParent: boolean;
  avatar?: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignedTo: string; // User ID
  createdBy: string; // User ID
  dueDate: Date;
  completedAt?: Date;
  isCompleted: boolean;
  repeatType: 'none' | 'daily' | 'weekly' | 'monthly';
  category: 'chores' | 'homework' | 'personal' | 'other';
  priority: 'low' | 'medium' | 'high';
  points?: number;
}

export interface TaskCompletion {
  id: string;
  taskId: string;
  userId: string;
  completedAt: Date;
  notes?: string;
}

export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly';
export type TaskCategory = 'chores' | 'homework' | 'personal' | 'other';
export type TaskPriority = 'low' | 'medium' | 'high';

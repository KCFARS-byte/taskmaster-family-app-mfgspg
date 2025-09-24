
import { User, Task, TaskCompletion } from '../types';

// Sample data for demonstration
const sampleUsers: User[] = [
  {
    id: '1',
    name: 'Mom',
    isParent: true,
    color: '#E74C3C',
  },
  {
    id: '2',
    name: 'Dad',
    isParent: true,
    color: '#3498DB',
  },
  {
    id: '3',
    name: 'Emma',
    isParent: false,
    color: '#9B59B6',
  },
  {
    id: '4',
    name: 'Jake',
    isParent: false,
    color: '#F39C12',
  },
];

const createSampleTasks = (): Task[] => {
  const now = new Date();
  return [
    {
      id: '1',
      title: 'Clean bedroom',
      description: 'Make bed, organize toys, vacuum floor',
      assignedTo: '3',
      createdBy: '1',
      dueDate: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
      isCompleted: false,
      repeatType: 'weekly',
      category: 'chores',
      priority: 'medium',
      points: 10,
    },
    {
      id: '2',
      title: 'Math homework',
      description: 'Complete pages 45-47',
      assignedTo: '4',
      createdBy: '2',
      dueDate: new Date(now.getTime() + 2 * 60 * 60 * 1000), // In 2 hours
      isCompleted: false,
      repeatType: 'daily',
      category: 'homework',
      priority: 'high',
      points: 15,
    },
    {
      id: '3',
      title: 'Feed the dog',
      description: 'Give Buddy his morning food and fresh water',
      assignedTo: '3',
      createdBy: '1',
      dueDate: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago (overdue)
      isCompleted: false,
      repeatType: 'daily',
      category: 'chores',
      priority: 'high',
      points: 5,
    },
    {
      id: '4',
      title: 'Practice piano',
      description: '30 minutes of practice',
      assignedTo: '4',
      createdBy: '1',
      dueDate: new Date(now.getTime() + 3 * 60 * 60 * 1000), // In 3 hours
      isCompleted: true,
      completedAt: new Date(now.getTime() - 60 * 60 * 1000), // Completed 1 hour ago
      repeatType: 'daily',
      category: 'personal',
      priority: 'medium',
      points: 8,
    },
  ];
};

class TaskStore {
  private users: User[] = sampleUsers;
  private tasks: Task[] = createSampleTasks();
  private completions: TaskCompletion[] = [];

  // Users
  getUsers(): User[] {
    try {
      return [...this.users]; // Return a copy to prevent mutations
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }

  getUserById(id: string): User | undefined {
    try {
      if (!id || typeof id !== 'string') {
        console.log('Invalid user ID provided:', id);
        return undefined;
      }
      return this.users.find(user => user.id === id);
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return undefined;
    }
  }

  getChildren(): User[] {
    try {
      return this.users.filter(user => !user.isParent);
    } catch (error) {
      console.error('Error getting children:', error);
      return [];
    }
  }

  getParents(): User[] {
    try {
      return this.users.filter(user => user.isParent);
    } catch (error) {
      console.error('Error getting parents:', error);
      return [];
    }
  }

  addUser(user: Omit<User, 'id'>): User {
    try {
      if (!user.name || typeof user.name !== 'string') {
        throw new Error('User name is required and must be a string');
      }

      const newUser: User = {
        ...user,
        id: Date.now().toString(),
        name: user.name.trim(),
      };
      this.users.push(newUser);
      console.log('Added new user:', newUser.name);
      return newUser;
    } catch (error) {
      console.error('Error adding user:', error);
      throw error;
    }
  }

  // Tasks
  getTasks(): Task[] {
    try {
      return [...this.tasks]; // Return a copy to prevent mutations
    } catch (error) {
      console.error('Error getting tasks:', error);
      return [];
    }
  }

  getTaskById(id: string): Task | undefined {
    try {
      if (!id || typeof id !== 'string') {
        console.log('Invalid task ID provided:', id);
        return undefined;
      }
      return this.tasks.find(task => task.id === id);
    } catch (error) {
      console.error('Error getting task by ID:', error);
      return undefined;
    }
  }

  getTasksForUser(userId: string): Task[] {
    try {
      if (!userId || typeof userId !== 'string') {
        console.log('Invalid user ID provided for tasks:', userId);
        return [];
      }
      return this.tasks.filter(task => task.assignedTo === userId);
    } catch (error) {
      console.error('Error getting tasks for user:', error);
      return [];
    }
  }

  getOverdueTasks(): Task[] {
    try {
      const now = new Date();
      return this.tasks.filter(task => {
        try {
          return !task.isCompleted && task.dueDate && task.dueDate < now;
        } catch (error) {
          console.error('Error checking if task is overdue:', error);
          return false;
        }
      });
    } catch (error) {
      console.error('Error getting overdue tasks:', error);
      return [];
    }
  }

  getTodaysTasks(): Task[] {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      
      return this.tasks.filter(task => {
        try {
          return task.dueDate && task.dueDate >= startOfDay && task.dueDate < endOfDay;
        } catch (error) {
          console.error('Error checking if task is today:', error);
          return false;
        }
      });
    } catch (error) {
      console.error('Error getting today\'s tasks:', error);
      return [];
    }
  }

  addTask(task: Omit<Task, 'id'>): Task {
    try {
      if (!task.title || typeof task.title !== 'string') {
        throw new Error('Task title is required and must be a string');
      }

      if (!task.assignedTo || typeof task.assignedTo !== 'string') {
        throw new Error('Task must be assigned to a user');
      }

      if (!task.dueDate || !(task.dueDate instanceof Date)) {
        throw new Error('Task must have a valid due date');
      }

      const newTask: Task = {
        ...task,
        id: Date.now().toString(),
        title: task.title.trim(),
        description: task.description?.trim(),
        isCompleted: false,
      };
      this.tasks.push(newTask);
      console.log('Added new task:', newTask.title);
      return newTask;
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  }

  updateTask(id: string, updates: Partial<Task>): Task | undefined {
    try {
      if (!id || typeof id !== 'string') {
        console.log('Invalid task ID provided for update:', id);
        return undefined;
      }

      const taskIndex = this.tasks.findIndex(task => task.id === id);
      if (taskIndex === -1) {
        console.log('Task not found for update:', id);
        return undefined;
      }

      // Validate updates
      if (updates.title !== undefined && (!updates.title || typeof updates.title !== 'string')) {
        throw new Error('Task title must be a non-empty string');
      }

      if (updates.dueDate !== undefined && !(updates.dueDate instanceof Date)) {
        throw new Error('Due date must be a valid Date object');
      }

      this.tasks[taskIndex] = { 
        ...this.tasks[taskIndex], 
        ...updates,
        title: updates.title ? updates.title.trim() : this.tasks[taskIndex].title,
        description: updates.description ? updates.description.trim() : this.tasks[taskIndex].description,
      };
      console.log('Updated task:', this.tasks[taskIndex].title);
      return this.tasks[taskIndex];
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  completeTask(id: string, userId: string, notes?: string): boolean {
    try {
      if (!id || typeof id !== 'string') {
        console.log('Invalid task ID provided for completion:', id);
        return false;
      }

      if (!userId || typeof userId !== 'string') {
        console.log('Invalid user ID provided for completion:', userId);
        return false;
      }

      const task = this.getTaskById(id);
      if (!task) {
        console.log('Task not found for completion:', id);
        return false;
      }

      const now = new Date();
      const updateResult = this.updateTask(id, {
        isCompleted: true,
        completedAt: now,
      });

      if (!updateResult) {
        console.log('Failed to update task completion status');
        return false;
      }

      // Add completion record
      const completion: TaskCompletion = {
        id: Date.now().toString(),
        taskId: id,
        userId,
        completedAt: now,
        notes: notes?.trim(),
      };
      this.completions.push(completion);

      console.log('Task completed:', task.title);
      return true;
    } catch (error) {
      console.error('Error completing task:', error);
      return false;
    }
  }

  deleteTask(id: string): boolean {
    try {
      if (!id || typeof id !== 'string') {
        console.log('Invalid task ID provided for deletion:', id);
        return false;
      }

      const taskIndex = this.tasks.findIndex(task => task.id === id);
      if (taskIndex === -1) {
        console.log('Task not found for deletion:', id);
        return false;
      }

      const task = this.tasks[taskIndex];
      this.tasks.splice(taskIndex, 1);
      console.log('Deleted task:', task.title);
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  }

  // Statistics
  getCompletionStats(userId: string): {
    completed: number;
    total: number;
    percentage: number;
  } {
    try {
      if (!userId || typeof userId !== 'string') {
        console.log('Invalid user ID provided for completion stats:', userId);
        return { completed: 0, total: 0, percentage: 0 };
      }

      const userTasks = this.getTasksForUser(userId);
      const completed = userTasks.filter(task => task.isCompleted).length;
      const total = userTasks.length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      return { completed, total, percentage };
    } catch (error) {
      console.error('Error getting completion stats:', error);
      return { completed: 0, total: 0, percentage: 0 };
    }
  }

  getTotalPoints(userId: string): number {
    try {
      if (!userId || typeof userId !== 'string') {
        console.log('Invalid user ID provided for total points:', userId);
        return 0;
      }

      const userTasks = this.getTasksForUser(userId);
      return userTasks
        .filter(task => task.isCompleted)
        .reduce((total, task) => {
          try {
            const points = task.points || 0;
            return total + (typeof points === 'number' && !isNaN(points) ? points : 0);
          } catch (error) {
            console.error('Error calculating points for task:', error);
            return total;
          }
        }, 0);
    } catch (error) {
      console.error('Error getting total points:', error);
      return 0;
    }
  }
}

export const taskStore = new TaskStore();

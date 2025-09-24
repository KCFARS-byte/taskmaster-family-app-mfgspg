
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

const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Clean bedroom',
    description: 'Make bed, organize toys, vacuum floor',
    assignedTo: '3',
    createdBy: '1',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
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
    dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // In 2 hours
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
    dueDate: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago (overdue)
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
    dueDate: new Date(Date.now() + 3 * 60 * 60 * 1000), // In 3 hours
    isCompleted: true,
    completedAt: new Date(Date.now() - 60 * 60 * 1000), // Completed 1 hour ago
    repeatType: 'daily',
    category: 'personal',
    priority: 'medium',
    points: 8,
  },
];

class TaskStore {
  private users: User[] = sampleUsers;
  private tasks: Task[] = sampleTasks;
  private completions: TaskCompletion[] = [];

  // Users
  getUsers(): User[] {
    return this.users;
  }

  getUserById(id: string): User | undefined {
    return this.users.find(user => user.id === id);
  }

  getChildren(): User[] {
    return this.users.filter(user => !user.isParent);
  }

  getParents(): User[] {
    return this.users.filter(user => user.isParent);
  }

  addUser(user: Omit<User, 'id'>): User {
    const newUser: User = {
      ...user,
      id: Date.now().toString(),
    };
    this.users.push(newUser);
    return newUser;
  }

  // Tasks
  getTasks(): Task[] {
    return this.tasks;
  }

  getTaskById(id: string): Task | undefined {
    return this.tasks.find(task => task.id === id);
  }

  getTasksForUser(userId: string): Task[] {
    return this.tasks.filter(task => task.assignedTo === userId);
  }

  getOverdueTasks(): Task[] {
    const now = new Date();
    return this.tasks.filter(task => 
      !task.isCompleted && task.dueDate < now
    );
  }

  getTodaysTasks(): Task[] {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    return this.tasks.filter(task => 
      task.dueDate >= startOfDay && task.dueDate < endOfDay
    );
  }

  addTask(task: Omit<Task, 'id'>): Task {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
    };
    this.tasks.push(newTask);
    console.log('Added new task:', newTask.title);
    return newTask;
  }

  updateTask(id: string, updates: Partial<Task>): Task | undefined {
    const taskIndex = this.tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) return undefined;

    this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...updates };
    console.log('Updated task:', this.tasks[taskIndex].title);
    return this.tasks[taskIndex];
  }

  completeTask(id: string, userId: string, notes?: string): boolean {
    const task = this.getTaskById(id);
    if (!task) return false;

    const now = new Date();
    this.updateTask(id, {
      isCompleted: true,
      completedAt: now,
    });

    // Add completion record
    const completion: TaskCompletion = {
      id: Date.now().toString(),
      taskId: id,
      userId,
      completedAt: now,
      notes,
    };
    this.completions.push(completion);

    console.log('Task completed:', task.title);
    return true;
  }

  deleteTask(id: string): boolean {
    const taskIndex = this.tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) return false;

    const task = this.tasks[taskIndex];
    this.tasks.splice(taskIndex, 1);
    console.log('Deleted task:', task.title);
    return true;
  }

  // Statistics
  getCompletionStats(userId: string): {
    completed: number;
    total: number;
    percentage: number;
  } {
    const userTasks = this.getTasksForUser(userId);
    const completed = userTasks.filter(task => task.isCompleted).length;
    const total = userTasks.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
  }

  getTotalPoints(userId: string): number {
    const userTasks = this.getTasksForUser(userId);
    return userTasks
      .filter(task => task.isCompleted)
      .reduce((total, task) => total + (task.points || 0), 0);
  }
}

export const taskStore = new TaskStore();

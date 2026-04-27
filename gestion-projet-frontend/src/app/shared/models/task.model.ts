export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus | string;
  priority?: string;
  estimatedHours?: number;
  dueDate?: string;
  createdAt?: string;
  projectId?: number;
  project?: { id: number; name: string };
  parentTask?: { id: number; title: string };
  dependsOn?: { id: number; title: string };
  subtasks?: Task[];
  assignedTo?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  assignedUserId?: number;
  parentTaskId?: number | null;
  dependsOnId?: number | null;
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}

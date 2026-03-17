export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus | string;
  priority?: string;
  dueDate?: string;
  createdAt?: string;
  projectId?: number;
  project?: { id: number; name: string };

  // ✅ correspond à ce que le backend retourne réellement
  assignedTo?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };

  // garde pour compatibilité avec add/edit forms
  assignedUserId?: number;
}
export enum TaskStatus {
  TODO        = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE        = 'DONE'
}


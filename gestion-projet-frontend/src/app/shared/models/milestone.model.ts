export interface Milestone {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  createdAt?: string;
  project?: { id: number };
}

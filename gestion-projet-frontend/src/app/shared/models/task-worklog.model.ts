export interface TaskWorklog {
  id: number;
  task?: { id: number };
  user?: { id: number; firstName?: string; lastName?: string };
  workDate?: string;
  minutesSpent: number;
  notes?: string;
  createdAt?: string;
}

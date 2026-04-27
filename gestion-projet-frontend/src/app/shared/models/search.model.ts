import { Project } from './project.model';
import { Task } from './task.model';
import { User } from './user.model';

export interface GlobalSearchResult {
  projects: Project[];
  tasks: Task[];
  users: User[];
}

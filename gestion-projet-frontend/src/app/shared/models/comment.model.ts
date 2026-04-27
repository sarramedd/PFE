import { Project } from './project.model';
import { User } from './user.model';

export interface CommentMessage {
  id: number;
  content: string;
  createdAt?: string;
  author?: User;
  project?: Project;
  task?: {
    id: number;
    title?: string;
  };
}

export interface CreateCommentPayload {
  content: string;
  project?: {
    id: number;
  };
  task?: {
    id: number;
  };
}

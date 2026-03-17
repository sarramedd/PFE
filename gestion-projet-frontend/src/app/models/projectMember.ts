// projectmember.ts
export interface ProjectMember {
  id: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  roleInProject: string;
  joinedAt?: string;
}
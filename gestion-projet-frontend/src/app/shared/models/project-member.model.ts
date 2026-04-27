// projectmember.ts
export interface ProjectMember {
  id: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    organizationId?: number;
  };
  roleInProject: ProjectMemberRole;
  joinedAt?: string;
}

export enum ProjectMemberRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER'
}

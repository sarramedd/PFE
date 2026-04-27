export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: Role;
  createdAt?: string;
  cin?: number;
  isActive?: boolean;
  avatarUrl?: string;
  organizationId?: number;
  organizationName?: string;
  organizationLogoUrl?: string;
}
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  ORGANIZATION_ADMIN = 'ORGANIZATION_ADMIN',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  MEMBER = 'MEMBER'
}

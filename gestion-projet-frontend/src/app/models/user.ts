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
}
export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
  OWNER = 'OWNER'
}
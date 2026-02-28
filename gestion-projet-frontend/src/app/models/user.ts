export interface User {
     id?: number;
  name: string;
  email: string;
  password?: string;
  role: Role;
  createdAt?: string;
}
export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
  OWNER = 'OWNER'
}
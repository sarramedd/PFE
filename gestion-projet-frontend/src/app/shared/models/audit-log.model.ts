import { User } from './user.model';

export interface AuditLogItem {
  id: number;
  action: string;
  entityType: string;
  entityId: number;
  timestamp: string;
  performedBy?: User;
}

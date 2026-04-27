export interface NotificationItem {
  id: number;
  message: string;
  type?: 'GENERAL' | 'TASK_UPDATE' | 'COMMENT_MENTION' | 'DUE_REMINDER' | 'OVERLOAD_ALERT' | 'DAILY_DIGEST' | 'AUTOMATION';
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  user?: {
    id: number;
    firstName?: string;
    lastName?: string;
  };
}

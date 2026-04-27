import { TaskStatus } from './task.model';

export type AutomationActionType = 'NOTIFY_PROJECT_MANAGER' | 'CREATE_FOLLOWUP_TASK';

export interface AutomationRule {
  id: number;
  name: string;
  triggerStatus: TaskStatus;
  actionType: AutomationActionType;
  enabled: boolean;
  followUpDelayDays?: number;
  followUpTitleTemplate?: string;
  createdAt?: string;
}

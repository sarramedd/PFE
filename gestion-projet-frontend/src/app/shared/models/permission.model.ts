export type PermissionAction =
  | 'DELETE_PROJECT'
  | 'DELETE_TASK'
  | 'VIEW_REPORTING'
  | 'MANAGE_MEMBERS';

export type PermissionByAction = Record<PermissionAction, boolean>;

export type PermissionMatrix = Record<string, Partial<PermissionByAction>>;

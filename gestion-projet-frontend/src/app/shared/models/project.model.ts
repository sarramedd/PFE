export interface Project {

  id: number;

  name: string;

  description?: string;

  startDate?: string;

  endDate?: string;

  status?: ProjectStatus;

  createdAt?: string;

  organizationId?: number;
  organizationName?: string;

}
export enum ProjectStatus {
  ACTIVE="ACTIVE",
    ARCHIVED="ARCHIVED",
    COMPLETED="COMPLETED"
}

export type MeetingType =
  | 'STANDUP'
  | 'RETRO'
  | 'SPRINT_PLANNING'
  | 'REVIEW'
  | 'ONE_ON_ONE'
  | 'OTHER';

export type MeetingModality = 'PRESENTIEL' | 'EN_LIGNE' | 'HYBRIDE';

export type MeetingStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type AttendeeResponse = 'PENDING' | 'ACCEPTED' | 'DECLINED';

export interface MeetingAttendeeDto {
  userId: number;
  name: string;
  email: string;
  response: AttendeeResponse;
  respondedAt: string | null;
}

export interface Meeting {
  id: number;
  projectId: number;
  projectName: string;
  title: string;
  description: string | null;
  agenda: string | null;
  notes: string | null;
  type: MeetingType;
  modality?: MeetingModality;
  status: MeetingStatus;
  scheduledAt: string;
  durationMinutes: number;
  organizerId: number;
  organizerName: string;
  createdAt: string;
  roomName?: string;
  attendees: MeetingAttendeeDto[];
}

export interface MeetingRequest {
  projectId?: number | null;
  title?: string;
  description?: string | null;
  agenda?: string | null;
  type?: MeetingType;
  modality?: MeetingModality;
  scheduledAt?: string;
  durationMinutes?: number;
  attendeeUserIds?: number[];
}

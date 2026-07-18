import { apiRequest } from './api';

export type MeetingStatus = 'idle' | 'processing' | 'completed' | 'failed';

export interface MeetingAttendeeInput {
  name: string;
  email?: string;
  role?: string;
}

export interface CreateMeetingPayload {
  title: string;
  date: string;
  description?: string;
  transcript?: string;
}

export interface Meeting {
  _id: string;
  title: string;
  date: string;
  description?: string;
  transcript?: string;
  attendees: MeetingAttendeeInput[];
  status: MeetingStatus;
}

export interface MeetingRecord {
  _id: string;
  title: string;
  date: string;
  description?: string;
  transcript?: string;
  aiProcessingStatus: MeetingStatus;
  createdAt: string;
  updatedAt: string;
}

export async function createMeeting(payload: CreateMeetingPayload) {
  return apiRequest<MeetingRecord>('/meetings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getMeetings() {
  return apiRequest<Meeting[]>('/meetings');
}

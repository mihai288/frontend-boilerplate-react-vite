import { apiRequest } from './api';

export type MeetingStatus = 'idle' | 'processing' | 'completed' | 'failed';

export interface Meeting {
  _id: string;
  title: string;
  date: string;
  description?: string;
  transcript?: string;
  status: MeetingStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMeetingPayload {
  title: string;
  date: string;
  description?: string;
}

export function getMeetings() {
  return apiRequest<Meeting[]>('/meetings');
}

export function createMeeting(payload: CreateMeetingPayload) {
  return apiRequest<Meeting>('/meetings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

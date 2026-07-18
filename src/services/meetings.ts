import { apiRequest } from './api';

export interface MeetingAttendeeInput {
  name: string;
  email?: string;
  role?: string;
}

export interface CreateMeetingPayload {
export type MeetingStatus = 'idle' | 'processing' | 'completed' | 'failed';

export interface Meeting {
  _id: string;
  title: string;
  date: string;
  description?: string;
  transcript?: string;
  attendees: MeetingAttendeeInput[];
}

export interface MeetingRecord {
  _id: string;
  title: string;
  date: string;
  description?: string;
  transcript?: string;
  aiProcessingStatus: 'idle' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export async function createMeeting(payload: CreateMeetingPayload) {
  return apiRequest<MeetingRecord>('/meetings', {
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

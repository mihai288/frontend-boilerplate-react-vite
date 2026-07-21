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
  attendees?: MeetingAttendeeInput[];
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

export async function createMeeting(payload: CreateMeetingPayload): Promise<Meeting> {
  const createdRecord = await apiRequest<MeetingRecord>('/meetings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return {
    _id: createdRecord._id,
    title: createdRecord.title,
    date: createdRecord.date,
    description: createdRecord.description,
    transcript: createdRecord.transcript,
    attendees: payload.attendees ?? [],
    status: createdRecord.aiProcessingStatus ?? 'idle',
  };
}

export function getMeetings() {
  return apiRequest<Meeting[]>('/meetings');
}

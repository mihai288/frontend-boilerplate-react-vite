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
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MeetingRecord {
  _id: string;
  title: string;
  date: string;
  description?: string;
  transcript?: string;
  attendees?: MeetingAttendeeInput[];
  aiProcessingStatus?: MeetingStatus;
  status?: MeetingStatus;
  userId?: string;
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
    attendees: createdRecord.attendees ?? payload.attendees ?? [],
    status: createdRecord.status ?? createdRecord.aiProcessingStatus ?? 'idle',
    userId: createdRecord.userId,
    createdAt: createdRecord.createdAt,
    updatedAt: createdRecord.updatedAt,
  };
}

export function getMeetings() {
  return apiRequest<Meeting[]>('/meetings');
}

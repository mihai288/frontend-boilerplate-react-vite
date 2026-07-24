import { apiRequest } from './api';

export type MeetingStatus = 'idle' | 'processing' | 'completed' | 'failed';

export interface MeetingAttendeeInput {
  name: string;
  email?: string;
  role?: string;
}

export interface MeetingActionItem {
  task: string;
  assignee: string;
  checked?: boolean;
}

export interface CreateMeetingPayload {
  title: string;
  date: string;
  description?: string;
  transcript?: string;
  attendees?: MeetingAttendeeInput[];
}

export interface UpdateMeetingPayload {
  title?: string;
  date?: string;
  description?: string;
  transcript?: string;
  attendees?: MeetingAttendeeInput[];
  actionItems?: MeetingActionItem[];
  status?: MeetingStatus;
}

export interface Meeting {
  _id: string;
  title: string;
  date: string;
  description?: string;
  transcript?: string;
  attendees: MeetingAttendeeInput[];
  status: MeetingStatus;
  summary?: string;
  keyPoints: string[];
  actionItems: MeetingActionItem[];
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
  summary?: string;
  keyPoints?: string[];
  actionItems?: MeetingActionItem[];
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

function mapMeetingRecord(
  record: MeetingRecord,
  fallbackAttendees: MeetingAttendeeInput[] = [],
): Meeting {
  return {
    _id: record._id,
    title: record.title,
    date: record.date,
    description: record.description,
    transcript: record.transcript,
    attendees: record.attendees ?? fallbackAttendees,
    status: record.status ?? record.aiProcessingStatus ?? 'idle',
    summary: record.summary,
    keyPoints: record.keyPoints ?? [],
    actionItems: (record.actionItems ?? []).map((item) => ({
      task: item.task,
      assignee: item.assignee,
      checked: Boolean(item.checked),
    })),
    userId: record.userId,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export async function createMeeting(payload: CreateMeetingPayload): Promise<Meeting> {
  const createdRecord = await apiRequest<MeetingRecord>('/meetings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return mapMeetingRecord(createdRecord, payload.attendees ?? []);
}

export async function updateMeeting(id: string, payload: UpdateMeetingPayload): Promise<Meeting> {
  const updatedRecord = await apiRequest<MeetingRecord>(`/meetings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  return mapMeetingRecord(updatedRecord, payload.attendees ?? []);
}

export async function processMeeting(id: string): Promise<Meeting> {
  const updatedRecord = await apiRequest<MeetingRecord>(`/meetings/${id}/process`, {
    method: 'POST',
  });

  return mapMeetingRecord(updatedRecord);
}

export async function getMeetingById(id: string): Promise<Meeting> {
  const meetingRecord = await apiRequest<MeetingRecord>(`/meetings/${id}`);
  return mapMeetingRecord(meetingRecord);
}

export async function getMeetings(): Promise<Meeting[]> {
  const records = await apiRequest<MeetingRecord[]>('/meetings');
  return records.map((record) => mapMeetingRecord(record));
}

export async function deleteMeeting(id: string): Promise<Meeting> {
  const deletedRecord = await apiRequest<MeetingRecord>(`/meetings/${id}`, {
    method: 'DELETE',
  });

  return mapMeetingRecord(deletedRecord);
}

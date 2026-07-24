import { apiRequest } from './api';

export type ActionItemStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'UNKNOWN';

export interface ActionItem {
  _id: string;
  meetingId: string;
  meetingTitle?: string;
  title: string;
  assignedTo?: string;
  deadline?: string;
  status: ActionItemStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateActionItemPayload {
  meetingId: string;
  title: string;
  assignedTo?: string;
  deadline?: string;
  status?: ActionItemStatus;
}

export interface UpdateActionItemPayload {
  meetingId?: string;
  title?: string;
  assignedTo?: string;
  deadline?: string;
  status?: ActionItemStatus;
}

export interface QueryActionItemsParams {
  status?: ActionItemStatus;
  assignee?: string;
  meetingId?: string;
}

function buildQuery(params: QueryActionItemsParams = {}) {
  const query = new URLSearchParams();

  if (params.status) {
    query.set('status', params.status);
  }

  if (params.assignee) {
    query.set('assignee', params.assignee);
  }

  if (params.meetingId) {
    query.set('meetingId', params.meetingId);
  }

  const value = query.toString();
  return value ? `?${value}` : '';
}

export function getActionItems(params: QueryActionItemsParams = {}) {
  return apiRequest<ActionItem[]>(`/action-items${buildQuery(params)}`);
}

export function createActionItem(payload: CreateActionItemPayload) {
  return apiRequest<ActionItem>('/action-items', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateActionItem(id: string, payload: UpdateActionItemPayload) {
  return apiRequest<ActionItem>(`/action-items/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function toggleActionItemComplete(id: string) {
  return apiRequest<ActionItem>(`/action-items/${id}/toggle-complete`, {
    method: 'PATCH',
  });
}

export function deleteActionItem(id: string) {
  return apiRequest<{ deleted: boolean; id: string }>(`/action-items/${id}`, {
    method: 'DELETE',
  });
}

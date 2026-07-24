import { useEffect, useMemo, useState } from 'react';
import {
  deleteActionItem,
  getActionItems,
  toggleActionItemComplete,
  updateActionItem,
  type ActionItem,
  type ActionItemStatus,
} from '@services/actionItems';
import { getMeetings, type Meeting } from '@services/meetings';
import './TodosPage.css';

function formatDate(value?: string) {
  if (!value) {
    return 'No deadline';
  }

  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value));
}

function toDateInputValue(value?: string) {
  if (!value) {
    return '';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return parsed.toISOString().slice(0, 10);
}

export default function TodosPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [statusFilter, setStatusFilter] = useState<'all' | ActionItemStatus>('all');
  const [meetingFilter, setMeetingFilter] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [keywordFilter, setKeywordFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('all');

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editMeetingId, setEditMeetingId] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editAssignee, setEditAssignee] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [editStatus, setEditStatus] = useState<ActionItemStatus>('OPEN');

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const [meetingsData, actionItemsData] = await Promise.all([
          getMeetings(),
          getActionItems(),
        ]);

        if (isMounted) {
          setMeetings(meetingsData);
          setActionItems(actionItemsData);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : 'Unable to load action items.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const assignees = useMemo(() => {
    const values = new Set<string>();
    actionItems.forEach((item) => {
      if (item.assignedTo && item.assignedTo.trim()) {
        values.add(item.assignedTo.trim());
      }
    });
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [actionItems]);

  const filteredActionItems = useMemo(() => {
    const normalizedSearch = searchFilter.trim().toLowerCase();
    const normalizedKeyword = keywordFilter.trim().toLowerCase();

    return actionItems.filter((item) => {
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesMeeting = meetingFilter === 'all' || item.meetingId === meetingFilter;
      const normalizedAssignee = item.assignedTo?.trim() || 'Unassigned';
      const matchesAssignee = assigneeFilter === 'all' || normalizedAssignee === assigneeFilter;

      const matchesSearch =
        normalizedSearch.length === 0 || item.title.toLowerCase().includes(normalizedSearch);

      const matchesKeyword =
        normalizedKeyword.length === 0 ||
        (item.meetingTitle ?? '').toLowerCase().includes(normalizedKeyword);

      return matchesStatus && matchesMeeting && matchesAssignee && matchesSearch && matchesKeyword;
    });
  }, [actionItems, assigneeFilter, keywordFilter, meetingFilter, searchFilter, statusFilter]);

  const groupedItems = useMemo(() => {
    return {
      OPEN: filteredActionItems.filter((item) => item.status === 'OPEN'),
      IN_PROGRESS: filteredActionItems.filter((item) => item.status === 'IN_PROGRESS'),
      DONE: filteredActionItems.filter((item) => item.status === 'DONE'),
      UNKNOWN: filteredActionItems.filter((item) => item.status === 'UNKNOWN'),
    };
  }, [filteredActionItems]);

  const hasAnyActionItems = actionItems.length > 0;

  const meetingCounts = useMemo(() => {
    const counts = new Map<string, number>();
    actionItems.forEach((item) => {
      const label = item.meetingTitle ?? 'Untitled meeting';
      counts.set(label, (counts.get(label) ?? 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [actionItems]);

  const handleToggleComplete = async (item: ActionItem) => {
    try {
      const updated = await toggleActionItemComplete(item._id);
      setActionItems((current) =>
        current.map((entry) => (entry._id === item._id ? updated : entry)),
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to update item status.');
    }
  };

  const handleChangeStatus = async (item: ActionItem, status: ActionItemStatus) => {
    try {
      const updated = await updateActionItem(item._id, { status });
      setActionItems((current) =>
        current.map((entry) => (entry._id === item._id ? updated : entry)),
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to change status.');
    }
  };

  const handleDelete = async (item: ActionItem) => {
    const confirmed = window.confirm('Delete this action item?');
    if (!confirmed) {
      return;
    }

    try {
      await deleteActionItem(item._id);
      setActionItems((current) => current.filter((entry) => entry._id !== item._id));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to delete action item.');
    }
  };

  const handleStartEdit = (item: ActionItem) => {
    setEditingItemId(item._id);
    setEditMeetingId(item.meetingId);
    setEditTitle(item.title);
    setEditAssignee(item.assignedTo ?? '');
    setEditDeadline(toDateInputValue(item.deadline));
    setEditStatus(item.status);
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditMeetingId('');
    setEditTitle('');
    setEditAssignee('');
    setEditDeadline('');
    setEditStatus('OPEN');
  };

  const handleSaveEdit = async (item: ActionItem) => {
    if (!editTitle.trim()) {
      setErrorMessage('Action item title is required.');
      return;
    }

    try {
      const updated = await updateActionItem(item._id, {
        meetingId: editMeetingId,
        title: editTitle.trim(),
        assignedTo: editAssignee.trim() || undefined,
        deadline: editDeadline ? new Date(editDeadline).toISOString() : undefined,
        status: editStatus,
      });

      setActionItems((current) =>
        current.map((entry) => (entry._id === item._id ? updated : entry)),
      );
      handleCancelEdit();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to save action item.');
    }
  };

  return (
    <section className="todos-page" aria-label="Action items page">
      <header className="todos-page__header">
        <h1 className="todos-page__title">To-do List</h1>
      </header>

      <div className="todos-page__content">
        <aside className="todos-page__filters" aria-label="Action item filters">
          <label>
            ACTION ITEM SEARCH
            <input
              value={searchFilter}
              onChange={(event) => setSearchFilter(event.target.value)}
              placeholder="Search by action item description/title"
            />
          </label>

          <label>
            ACTION ITEM STATUS
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as 'all' | ActionItemStatus)}
            >
              <option value="all">All statuses</option>
              <option value="OPEN">OPEN</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="DONE">DONE</option>
              <option value="UNKNOWN">UNKNOWN</option>
            </select>
          </label>

          <label>
            ASSOCIATED MEETING FILTER
            <select
              value={meetingFilter}
              onChange={(event) => setMeetingFilter(event.target.value)}
            >
              <option value="all">All meetings</option>
              {meetings.map((meeting) => (
                <option key={meeting._id} value={meeting._id}>
                  {meeting.title}
                </option>
              ))}
            </select>
          </label>

          <label>
            MEETING TITLE KEYWORDS
            <input
              value={keywordFilter}
              onChange={(event) => setKeywordFilter(event.target.value)}
              placeholder="Search by associated meeting title"
            />
          </label>

          <div className="todos-page__create">
            <p>ACTION ITEMS ARE AI-GENERATED</p>
            <span className="assignee-chip assignee-chip--muted">
              New action items are extracted from meeting transcripts by AI.
            </span>
          </div>

          <div className="todos-page__assignees">
            <p>ASSIGNEE FILTER</p>
            <button
              type="button"
              className={`assignee-chip ${assigneeFilter === 'all' ? 'assignee-chip--active' : ''}`}
              onClick={() => setAssigneeFilter('all')}
            >
              all
            </button>
            {assignees.length === 0 ? (
              <span className="assignee-chip assignee-chip--muted">No assignees yet</span>
            ) : null}
            {assignees.map((assignee) => (
              <button
                key={assignee}
                type="button"
                className={`assignee-chip ${assigneeFilter === assignee ? 'assignee-chip--active' : ''}`}
                onClick={() => setAssigneeFilter(assignee)}
              >
                {assignee}
              </button>
            ))}
          </div>

          <div className="todos-page__meeting-counts">
            <p>ACTION ITEM COUNT PER MEETING</p>
            {meetingCounts.length === 0 ? (
              <span className="assignee-chip assignee-chip--muted">No items yet</span>
            ) : null}
            {meetingCounts.map(([meetingTitle, count]) => (
              <span key={meetingTitle} className="meeting-count-chip">
                {meetingTitle}: {count}
              </span>
            ))}
          </div>
        </aside>

        <section className="todos-page__main" aria-live="polite">
          <div className="todos-page__main-header">
            <span>Action Item List</span>
            <span>{filteredActionItems.length} visible</span>
          </div>

          {isLoading ? <p className="todos-page__state">Loading action items...</p> : null}
          {errorMessage ? (
            <p className="todos-page__state todos-page__state--error">{errorMessage}</p>
          ) : null}

          {!isLoading && !errorMessage && !hasAnyActionItems ? (
            <div className="todos-page__placeholder">ACTION ITEMS</div>
          ) : null}

          {!isLoading && !errorMessage && hasAnyActionItems ? (
            <div className="todos-page__groups">
              {(['OPEN', 'IN_PROGRESS', 'DONE', 'UNKNOWN'] as ActionItemStatus[]).map((group) => (
                <article key={group} className="todos-page__group">
                  <h3>
                    {group.replace('_', ' ')} <small>({groupedItems[group].length})</small>
                  </h3>

                  {groupedItems[group].length === 0 ? (
                    <p className="todos-page__empty">No items</p>
                  ) : (
                    <ul>
                      {groupedItems[group].map((item) => (
                        <li
                          key={item._id}
                          className={`action-item ${
                            item.deadline &&
                            item.status !== 'DONE' &&
                            new Date(item.deadline) < new Date()
                              ? 'action-item--overdue'
                              : ''
                          }`}
                        >
                          {editingItemId === item._id ? (
                            <div className="action-item__edit-grid">
                              <label>
                                Description / Title
                                <input
                                  value={editTitle}
                                  onChange={(event) => setEditTitle(event.target.value)}
                                />
                              </label>

                              <label>
                                Associated Meeting
                                <select
                                  value={editMeetingId}
                                  onChange={(event) => setEditMeetingId(event.target.value)}
                                >
                                  {meetings.map((meeting) => (
                                    <option key={meeting._id} value={meeting._id}>
                                      {meeting.title}
                                    </option>
                                  ))}
                                </select>
                              </label>

                              <label>
                                Assigned Person / Attendee
                                <input
                                  value={editAssignee}
                                  onChange={(event) => setEditAssignee(event.target.value)}
                                />
                              </label>

                              <label>
                                Deadline / Due Date
                                <input
                                  type="date"
                                  value={editDeadline}
                                  onChange={(event) => setEditDeadline(event.target.value)}
                                />
                              </label>

                              <label>
                                Status
                                <select
                                  value={editStatus}
                                  onChange={(event) =>
                                    setEditStatus(event.target.value as ActionItemStatus)
                                  }
                                >
                                  <option value="OPEN">OPEN</option>
                                  <option value="IN_PROGRESS">IN PROGRESS</option>
                                  <option value="DONE">DONE</option>
                                  <option value="UNKNOWN">UNKNOWN</option>
                                </select>
                              </label>

                              <div className="action-item__actions">
                                <button type="button" onClick={() => handleSaveEdit(item)}>
                                  Save Changes
                                </button>
                                <button type="button" onClick={handleCancelEdit}>
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div>
                                <strong>{item.title}</strong>
                                <p>{item.meetingTitle ?? 'Untitled meeting'}</p>
                              </div>
                              <div className="action-item__meta">
                                <span>{item.assignedTo?.trim() || 'Unassigned'}</span>
                                <span>{formatDate(item.deadline)}</span>
                                <span
                                  className={`action-item__status action-item__status--${item.status}`}
                                >
                                  {item.status}
                                </span>
                                <div className="action-item__actions">
                                  <button type="button" onClick={() => handleToggleComplete(item)}>
                                    {item.status === 'DONE' ? 'Mark as OPEN' : 'Mark as DONE'}
                                  </button>
                                  <button type="button" onClick={() => handleStartEdit(item)}>
                                    Edit Fields
                                  </button>
                                  <button
                                    type="button"
                                    className="action-item__delete"
                                    onClick={() => handleDelete(item)}
                                  >
                                    Delete
                                  </button>
                                </div>
                                <div className="action-item__quick-status">
                                  <button
                                    type="button"
                                    onClick={() => handleChangeStatus(item, 'OPEN')}
                                  >
                                    OPEN
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleChangeStatus(item, 'IN_PROGRESS')}
                                  >
                                    IN_PROGRESS
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleChangeStatus(item, 'DONE')}
                                  >
                                    DONE
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleChangeStatus(item, 'UNKNOWN')}
                                  >
                                    UNKNOWN
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </section>
  );
}

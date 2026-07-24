import { useEffect, useMemo, useState } from 'react';
import { getMeetings, updateMeeting } from '@services/meetings';
import { useMeetingStore } from '../../../store/useMeetingStore';
import './TodosPage.css';

interface TodoGroup {
  id: string;
  meetingId: string;
  meetingTitle: string;
  meetingDate: string;
  attendeeName: string;
  items: Array<{
    actionIndex: number;
    task: string;
    checked: boolean;
  }>;
}

function getAssigneeLabel(assignee: string) {
  return assignee.trim() || 'Unassigned';
}

export default function TodosPage() {
  const meetings = useMeetingStore((state) => state.meetings);
  const isLoading = useMeetingStore((state) => state.isLoading);
  const errorMessage = useMeetingStore((state) => state.errorMessage);
  const setMeetings = useMeetingStore((state) => state.setMeetings);
  const setLoading = useMeetingStore((state) => state.setLoading);
  const setErrorMessage = useMeetingStore((state) => state.setErrorMessage);

  const [selectedAttendee, setSelectedAttendee] = useState('all');
  const [selectedMeetingId, setSelectedMeetingId] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [savingTodoKey, setSavingTodoKey] = useState<string | null>(null);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadMeetings() {
      setLoading(true);
      setErrorMessage('');

      try {
        const data = await getMeetings();

        if (isMounted) {
          setMeetings(data);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : 'Unable to load meetings');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadMeetings();

    return () => {
      isMounted = false;
    };
  }, [setErrorMessage, setLoading, setMeetings]);

  const todoGroups = useMemo(() => {
    const groups = new Map<string, TodoGroup>();

    meetings.forEach((meeting) => {
      meeting.actionItems.forEach((item, actionIndex) => {
        const attendeeName = getAssigneeLabel(item.assignee);
        const groupId = `${meeting._id}:${attendeeName}`;
        const existingGroup = groups.get(groupId);

        if (existingGroup) {
          existingGroup.items.push({
            actionIndex,
            task: item.task,
            checked: Boolean(item.checked),
          });
          return;
        }

        groups.set(groupId, {
          id: groupId,
          meetingId: meeting._id,
          meetingTitle: meeting.title,
          meetingDate: meeting.date,
          attendeeName,
          items: [
            {
              actionIndex,
              task: item.task,
              checked: Boolean(item.checked),
            },
          ],
        });
      });
    });

    // Sortare stabilă ca să nu mai sară cardurile când bifezi
    return Array.from(groups.values()).sort((left, right) => {
      const dateDiff = new Date(right.meetingDate).getTime() - new Date(left.meetingDate).getTime();

      if (dateDiff !== 0) {
        return dateDiff;
      }

      return left.attendeeName.localeCompare(right.attendeeName);
    });
  }, [meetings]);

  const attendeeOptions = useMemo(
    () =>
      Array.from(new Set(todoGroups.map((group) => group.attendeeName))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [todoGroups],
  );

  const meetingOptions = useMemo(
    () =>
      Array.from(
        new Map(todoGroups.map((group) => [group.meetingId, group.meetingTitle])).entries(),
      ).sort((left, right) => left[1].localeCompare(right[1])),
    [todoGroups],
  );

  const filteredTodoGroups = useMemo(() => {
    return todoGroups
      .map((group) => {
        const filteredItems = group.items.filter((item) => {
          if (statusFilter === 'open') {
            return !item.checked;
          }

          if (statusFilter === 'closed') {
            return item.checked;
          }

          return true;
        });

        return {
          ...group,
          items: filteredItems,
        };
      })
      .filter((group) => {
        if (selectedAttendee !== 'all' && group.attendeeName !== selectedAttendee) {
          return false;
        }

        if (selectedMeetingId !== 'all' && group.meetingId !== selectedMeetingId) {
          return false;
        }

        return group.items.length > 0;
      });
  }, [selectedAttendee, selectedMeetingId, statusFilter, todoGroups]);

  const completedCount = useMemo(
    () =>
      todoGroups.reduce(
        (count, group) => count + group.items.filter((item) => item.checked).length,
        0,
      ),
    [todoGroups],
  );

  const totalCount = useMemo(
    () => todoGroups.reduce((count, group) => count + group.items.length, 0),
    [todoGroups],
  );

  const filteredCount = useMemo(
    () => filteredTodoGroups.reduce((count, group) => count + group.items.length, 0),
    [filteredTodoGroups],
  );

  const handleToggleTodo = async (meetingId: string, actionIndex: number) => {
    const meeting = meetings.find((entry) => entry._id === meetingId);

    if (!meeting) {
      return;
    }

    const nextActionItems = meeting.actionItems.map((item, index) =>
      index === actionIndex ? { ...item, checked: !item.checked } : item,
    );
    const todoKey = `${meetingId}:${actionIndex}`;

    setSaveError('');
    setSavingTodoKey(todoKey);

    try {
      const persistedMeeting = await updateMeeting(meetingId, { actionItems: nextActionItems });

      setMeetings(
        meetings.map((entry) => (entry._id === persistedMeeting._id ? persistedMeeting : entry)),
      );
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : 'Unable to update todo completion status.',
      );
    } finally {
      setSavingTodoKey(null);
    }
  };

  return (
    <section className="todos-page" aria-live="polite">
      {isLoading ? <p className="todos-page__state">Loading tasks...</p> : null}
      {errorMessage ? (
        <p className="todos-page__state todos-page__state--error">{errorMessage}</p>
      ) : null}
      {saveError ? <p className="todos-page__state todos-page__state--error">{saveError}</p> : null}

      {!isLoading && !errorMessage && totalCount === 0 ? (
        <p className="todos-page__state">
          No action items yet. Process a meeting transcript to generate tasks here.
        </p>
      ) : null}

      {todoGroups.length > 0 ? (
        <div className="todos-page__content">
          <aside className="todos-page__sidebar" aria-label="Todo filters">
            <div className="todos-page__sidebar-section">
              <div className="todos-page__sidebar-heading">
                <h2 className="todos-page__sidebar-title">Filters</h2>
                <button
                  type="button"
                  className="todos-page__clear-button"
                  onClick={() => {
                    setSelectedAttendee('all');
                    setSelectedMeetingId('all');
                    setStatusFilter('all');
                  }}
                >
                  Clear
                </button>
              </div>

              <label className="todos-page__filter-field">
                <span className="todos-page__filter-label">Attendee</span>
                <select
                  value={selectedAttendee}
                  onChange={(event) => setSelectedAttendee(event.target.value)}
                >
                  <option value="all">All</option>
                  {attendeeOptions.map((attendee) => (
                    <option key={attendee} value={attendee}>
                      {attendee}
                    </option>
                  ))}
                </select>
              </label>

              <label className="todos-page__filter-field">
                <span className="todos-page__filter-label">Meeting</span>
                <select
                  value={selectedMeetingId}
                  onChange={(event) => setSelectedMeetingId(event.target.value)}
                >
                  <option value="all">All</option>
                  {meetingOptions.map(([meetingId, meetingTitle]) => (
                    <option key={meetingId} value={meetingId}>
                      {meetingTitle}
                    </option>
                  ))}
                </select>
              </label>

              <label className="todos-page__filter-field">
                <span className="todos-page__filter-label">Status</span>
                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as 'all' | 'open' | 'closed')
                  }
                >
                  <option value="all">All</option>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </label>
            </div>
          </aside>

          <div className="todos-page__results">
            {filteredCount === 0 ? (
              <p className="todos-page__state">No tasks match the selected filters.</p>
            ) : (
              <div className="todos-page__grid">
                {filteredTodoGroups.map((group) => (
                  <article key={group.id} className="todos-page__card">
                    <div className="todos-page__card-header">
                      <div className="todos-page__meta-block">
                        <span className="todos-page__meta-label">Attendee</span>
                        <p className="todos-page__meta-value">{group.attendeeName}</p>
                      </div>

                      <div className="todos-page__meta-block">
                        <span className="todos-page__meta-label">Meeting</span>
                        <p className="todos-page__meta-value">{group.meetingTitle}</p>
                      </div>
                    </div>

                    <div className="todos-page__tasks-block">
                      <span className="todos-page__meta-label">To-dos</span>

                      <ul className="todos-page__tasks-list">
                        {group.items.map((item) => {
                          const todoKey = `${group.meetingId}:${item.actionIndex}`;

                          return (
                            <li key={todoKey} className="todos-page__task-item">
                              <label className="todos-page__task-toggle">
                                <input
                                  type="checkbox"
                                  checked={item.checked}
                                  disabled={savingTodoKey === todoKey}
                                  onChange={() => {
                                    void handleToggleTodo(group.meetingId, item.actionIndex);
                                  }}
                                />
                                <span
                                  className={`todos-page__task-text${item.checked ? ' todos-page__task-text--checked' : ''}`}
                                >
                                  {item.task}
                                </span>
                              </label>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}

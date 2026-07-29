import { useEffect, useRef, useState } from 'react';
import type {
  ActionItemStatus,
  Meeting,
  MeetingActionItem,
  MeetingAttendeeInput,
} from '@services/meetings';
import MeetingStatusBadge from '@atoms/MeetingStatusBadge/MeetingStatusBadge';
import TodoStatusSelect from '@atoms/TodoStatusSelect/TodoStatusSelect';
import AttendeeRow from '@molecules/AttendeeRow/AttendeeRow';
import { formatMeetingDate } from '@/utils/formatMeetingDate';
import './MeetingDetailsModal.css';

interface MeetingDetailsModalProps {
  meeting: Meeting;
  initialTab?: DetailsTab;
  onClose: () => void;
  onSave: (updatedMeeting: Meeting) => Promise<void> | void;
  onDelete: (meetingId: string) => Promise<void>;
  onProcess: (meetingId: string) => Promise<Meeting>;
  onUpdateActionItems: (meetingId: string, actionItems: MeetingActionItem[]) => Promise<Meeting>;
}

type DetailsTab = 'description' | 'attendees' | 'transcript' | 'ai-results';

export default function MeetingDetailsModal({
  meeting,
  initialTab = 'description',
  onClose,
  onSave,
  onDelete,
  onProcess,
  onUpdateActionItems,
}: MeetingDetailsModalProps) {
  const tabs: Array<{ id: DetailsTab; label: string }> = [
    { id: 'description', label: 'Description' },
    { id: 'attendees', label: 'Attendees' },
    { id: 'transcript', label: 'Transcript' },
    { id: 'ai-results', label: 'AI results' },
  ];

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSavingActionItems, setIsSavingActionItems] = useState(false);
  const [activeTab, setActiveTab] = useState<DetailsTab>(initialTab);
  const [saveError, setSaveError] = useState('');
  const [processError, setProcessError] = useState('');
  const [pendingRemoveAttendeeIndex, setPendingRemoveAttendeeIndex] = useState<number | null>(null);
  const [newAttendeeIndex, setNewAttendeeIndex] = useState<number | null>(null);
  const previousMeetingIdRef = useRef(meeting._id);
  const [draft, setDraft] = useState<Meeting>({
    ...meeting,
    attendees: meeting.attendees ?? [],
    keyPoints: meeting.keyPoints ?? [],
    actionItems: meeting.actionItems ?? [],
  });

  useEffect(() => {
    const isDifferentMeeting = previousMeetingIdRef.current !== meeting._id;

    setDraft({
      ...meeting,
      attendees: meeting.attendees ?? [],
      keyPoints: meeting.keyPoints ?? [],
      actionItems: meeting.actionItems ?? [],
    });
    setIsEditing(false);
    setIsConfirmingDelete(false);
    if (isDifferentMeeting) {
      setActiveTab(initialTab);
    }
    setSaveError('');
    setProcessError('');
    setPendingRemoveAttendeeIndex(null);
    setNewAttendeeIndex(null);
    previousMeetingIdRef.current = meeting._id;
  }, [initialTab, meeting]);

  useEffect(() => {
    if (newAttendeeIndex === null) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setNewAttendeeIndex(null);
    }, 320);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [newAttendeeIndex]);

  const updateDraft = <K extends keyof Meeting>(field: K, value: Meeting[K]) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const updateAttendee = (index: number, field: keyof MeetingAttendeeInput, value: string) => {
    setDraft((current) => ({
      ...current,
      attendees: current.attendees.map((attendee, attendeeIndex) =>
        attendeeIndex === index ? { ...attendee, [field]: value } : attendee,
      ),
    }));
  };

  const addDraftAttendee = () => {
    setDraft((current) => {
      const nextIndex = current.attendees.length;
      const nextAttendees = [...current.attendees, { name: '', email: '', role: '' }];

      setNewAttendeeIndex(nextIndex);

      requestAnimationFrame(() => {
        const nextNameInput = document.getElementById(
          `attendee-name-${nextIndex}`,
        ) as HTMLInputElement | null;
        nextNameInput?.focus();
        nextNameInput?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      });

      return {
        ...current,
        attendees: nextAttendees,
      };
    });
  };

  const requestRemoveDraftAttendee = (index: number) => {
    setPendingRemoveAttendeeIndex(index);
  };

  const confirmRemoveDraftAttendee = () => {
    if (pendingRemoveAttendeeIndex === null) {
      return;
    }

    setDraft((current) => ({
      ...current,
      attendees: current.attendees.filter(
        (_, attendeeIndex) => attendeeIndex !== pendingRemoveAttendeeIndex,
      ),
    }));
    setPendingRemoveAttendeeIndex(null);
  };

  const cancelRemoveDraftAttendee = () => {
    setPendingRemoveAttendeeIndex(null);
  };

  const handleActionItemStatusChange = async (index: number, status: ActionItemStatus) => {
    const previousActionItems = draft.actionItems;
    const updatedActionItems = previousActionItems.map((item, itemIndex) =>
      itemIndex === index ? { ...item, status } : item,
    );

    setDraft((current) => ({ ...current, actionItems: updatedActionItems }));
    setProcessError('');
    setIsSavingActionItems(true);

    try {
      const persistedMeeting = await onUpdateActionItems(draft._id, updatedActionItems);
      setDraft({
        ...persistedMeeting,
        attendees: persistedMeeting.attendees ?? [],
        keyPoints: persistedMeeting.keyPoints ?? [],
        actionItems: persistedMeeting.actionItems ?? [],
      });
    } catch (error) {
      setDraft((current) => ({ ...current, actionItems: previousActionItems }));
      setProcessError(
        error instanceof Error ? error.message : 'Unable to update action item status.',
      );
    } finally {
      setIsSavingActionItems(false);
    }
  };

  const handleSave = async () => {
    if (!draft.title.trim()) {
      setSaveError('Title is required.');
      return;
    }

    const normalizedAttendees = draft.attendees
      .map((attendee) => ({
        name: attendee.name.trim(),
        email: attendee.email?.trim() ?? '',
        role: attendee.role?.trim() ?? '',
      }))
      .filter((attendee) => attendee.name.length > 0);

    setSaveError('');
    setIsSaving(true);

    try {
      await onSave({
        ...draft,
        title: draft.title.trim(),
        description: draft.description?.trim() ?? '',
        transcript: draft.transcript?.trim() ?? '',
        attendees: normalizedAttendees,
      });
      setIsEditing(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to save meeting changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaveError('');
    setIsDeleting(true);

    try {
      await onDelete(draft._id);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to delete meeting.');
      setIsConfirmingDelete(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleProcess = async () => {
    setProcessError('');
    setIsProcessing(true);

    try {
      const processingMeeting = await onProcess(draft._id);
      setDraft({
        ...processingMeeting,
        attendees: processingMeeting.attendees ?? [],
        keyPoints: processingMeeting.keyPoints ?? [],
        actionItems: processingMeeting.actionItems ?? [],
      });
    } catch (error) {
      setProcessError(error instanceof Error ? error.message : 'Unable to process this meeting.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Logică pentru a extrage persoanele recunoscute de AI, evitând dublurile
  const manualAttendeeNames = new Set(draft.attendees.map((a) => a.name.toLowerCase().trim()));
  const aiAssignees = Array.from(
    new Set(
      draft.actionItems
        .map((item) => item.assignee.trim())
        .filter((name) => name !== 'Unassigned' && name !== ''),
    ),
  ).filter((name) => !manualAttendeeNames.has(name.toLowerCase()));

  const canAddAttendee =
    draft.attendees.length === 0 || draft.attendees[draft.attendees.length - 1]?.name.trim() !== '';

  return (
    <div className="meeting-details-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="meeting-details-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="meeting-details-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="meeting-details-modal__close"
          aria-label="Close meeting details"
          onClick={onClose}
        >
          <span aria-hidden="true">&times;</span>
        </button>

        <div className="meeting-details-modal__header">
          <div className="meeting-details-modal__heading">
            <p className="meeting-details-modal__kicker">Meeting details</p>
            <h2 id="meeting-details-title" className="meeting-details-modal__title">
              {isEditing ? 'Edit meeting' : draft.title}
            </h2>
            <div className="meeting-details-modal__meta">
              <div className="meeting-details-modal__meta-item">
                <p className="meeting-details-modal__label">Status</p>
                <MeetingStatusBadge status={draft.status} />
              </div>

              <div className="meeting-details-modal__meta-item">
                <p className="meeting-details-modal__label">Date</p>
                <p className="meeting-details-modal__value">{formatMeetingDate(draft.date)}</p>
              </div>
            </div>

            {!isEditing ? (
              <div className="meeting-details-modal__toolbar">
                <button
                  type="button"
                  className="meeting-details-modal__button meeting-details-modal__button--primary"
                  onClick={handleProcess}
                  disabled={isProcessing || draft.status === 'processing'}
                >
                  {isProcessing || draft.status === 'processing' ? 'Processing...' : 'Process'}
                </button>
                <button
                  type="button"
                  className="meeting-details-modal__button meeting-details-modal__button--secondary"
                  onClick={() => setIsEditing(true)}
                >
                  Edit meeting
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {!isEditing ? (
          <div className="meeting-details-modal__content">
            {processError ? <p className="meeting-details-modal__error">{processError}</p> : null}

            <div
              className="meeting-details-modal__tabs"
              role="tablist"
              aria-label="Meeting details tabs"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`meeting-details-panel-${tab.id}`}
                  id={`meeting-details-tab-${tab.id}`}
                  className={`meeting-details-modal__tab${activeTab === tab.id ? ' meeting-details-modal__tab--active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div
              id={`meeting-details-panel-${activeTab}`}
              role="tabpanel"
              aria-labelledby={`meeting-details-tab-${activeTab}`}
              className="meeting-details-modal__section meeting-details-modal__section--wide"
            >
              {activeTab === 'description' ? (
                <>
                  <p className="meeting-details-modal__label">Description</p>
                  <div className="meeting-details-modal__scroll-region">
                    <p className="meeting-details-modal__value">
                      {draft.description || 'No description provided.'}
                    </p>
                  </div>
                </>
              ) : null}

              {activeTab === 'attendees' ? (
                <>
                  <p className="meeting-details-modal__label">Added by user</p>
                  <div className="meeting-details-modal__scroll-region">
                    {draft.attendees.length > 0 ? (
                      <div className="meeting-details-modal__attendees">
                        {draft.attendees.map((attendee, index) => (
                          <div key={`manual-${index}`} className="meeting-details-modal__attendee">
                            <span className="meeting-details-modal__attendee-name">
                              {attendee.name}
                            </span>
                            {(attendee.role || attendee.email) && (
                              <span className="meeting-details-modal__attendee-meta">
                                {attendee.role} {attendee.role && attendee.email ? ' • ' : ''}{' '}
                                {attendee.email}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="meeting-details-modal__value">No attendees registered.</p>
                    )}
                  </div>

                  {aiAssignees.length > 0 ? (
                    <div className="meeting-details-modal__ai-group">
                      <p className="meeting-details-modal__label">Added by AI</p>
                      <div className="meeting-details-modal__scroll-region">
                        <div className="meeting-details-modal__attendees">
                          {aiAssignees.map((assignee, index) => (
                            <div key={`ai-${index}`} className="meeting-details-modal__attendee">
                              <span className="meeting-details-modal__attendee-name">
                                {assignee}
                              </span>
                              <span className="meeting-details-modal__attendee-meta">
                                Added automatically from task assignments
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </>
              ) : null}

              {activeTab === 'transcript' ? (
                <>
                  <p className="meeting-details-modal__label">Transcript</p>
                  <div className="meeting-details-modal__scroll-region">
                    <p className="meeting-details-modal__value">
                      {draft.transcript || 'Transcript not available yet.'}
                    </p>
                  </div>
                </>
              ) : null}

              {activeTab === 'ai-results' ? (
                <>
                  <p className="meeting-details-modal__label">AI results</p>
                  <div className="meeting-details-modal__scroll-region">
                    <p className="meeting-details-modal__label">AI summary</p>
                    <p className="meeting-details-modal__value">
                      {draft.summary || 'No summary generated yet.'}
                    </p>

                    <div className="meeting-details-modal__ai-group">
                      <p className="meeting-details-modal__label">Key points</p>
                      {draft.keyPoints.length > 0 ? (
                        <ul className="meeting-details-modal__list">
                          {draft.keyPoints.map((point) => (
                            <li key={point}>{point}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="meeting-details-modal__value">No key points generated yet.</p>
                      )}
                    </div>

                    <div className="meeting-details-modal__ai-group">
                      <p className="meeting-details-modal__label">To-do list</p>
                      {draft.actionItems.length > 0 ? (
                        <ul className="meeting-details-modal__todo-list">
                          {draft.actionItems.map((item, index) => (
                            <li
                              key={`${item.task}-${item.assignee}-${index}`}
                              className="meeting-details-modal__todo-list-item"
                            >
                              <div className="meeting-details-modal__todo-item">
                                <div className="meeting-details-modal__todo-content">
                                  <span
                                    className={`meeting-details-modal__todo-text${item.status === 'DONE' ? ' meeting-details-modal__todo-text--done' : ''}`}
                                  >
                                    {item.task}
                                  </span>
                                  <span className="meeting-details-modal__todo-assignee">
                                    Attendee: {item.assignee}
                                  </span>
                                </div>
                                <TodoStatusSelect
                                  value={item.status}
                                  disabled={isSavingActionItems}
                                  onChange={(status) => {
                                    void handleActionItemStatusChange(index, status);
                                  }}
                                />
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="meeting-details-modal__value">
                          No action items generated yet.
                        </p>
                      )}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="meeting-details-modal__content meeting-details-modal__content--editing">
            <label className="meeting-details-modal__field">
              <span>Title</span>
              <input
                value={draft.title}
                onChange={(event) => updateDraft('title', event.target.value)}
              />
            </label>

            <label className="meeting-details-modal__field">
              <span>Date</span>
              <input
                type="datetime-local"
                value={draft.date.slice(0, 16)}
                onChange={(event) =>
                  updateDraft('date', new Date(event.target.value).toISOString())
                }
              />
            </label>

            <label className="meeting-details-modal__field meeting-details-modal__field--wide">
              <span>Description</span>
              <textarea
                rows={4}
                value={draft.description ?? ''}
                onChange={(event) => updateDraft('description', event.target.value)}
              />
            </label>

            <label className="meeting-details-modal__field meeting-details-modal__field--wide">
              <span>Transcript</span>
              <textarea
                rows={5}
                value={draft.transcript ?? ''}
                onChange={(event) => updateDraft('transcript', event.target.value)}
              />
            </label>

            <div className="meeting-details-modal__field meeting-details-modal__field--wide">
              <span>Attendees</span>
              <div className="meeting-details-modal__attendee-editor">
                {draft.attendees.length > 0 ? (
                  <div className="meeting-details-modal__attendee-editor-list meeting-details-modal__attendee-editor-list--scrollable">
                    {draft.attendees.map((attendee, index) => (
                      <AttendeeRow
                        key={index}
                        index={index}
                        attendee={{
                          name: attendee.name,
                          email: attendee.email ?? '',
                          role: attendee.role ?? '',
                        }}
                        canRemove={draft.attendees.length > 0}
                        isNew={index === newAttendeeIndex}
                        onChange={updateAttendee}
                        onRemove={requestRemoveDraftAttendee}
                      />
                    ))}
                  </div>
                ) : null}

                {pendingRemoveAttendeeIndex !== null ? (
                  <div
                    className="meeting-details-modal__attendee-remove-confirm"
                    role="status"
                    aria-live="polite"
                  >
                    <p className="meeting-details-modal__attendee-remove-confirm-text">
                      Remove attendee #{pendingRemoveAttendeeIndex + 1}?
                    </p>
                    <div className="meeting-details-modal__attendee-remove-confirm-actions">
                      <button
                        type="button"
                        className="meeting-details-modal__button meeting-details-modal__button--ghost"
                        onClick={cancelRemoveDraftAttendee}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="meeting-details-modal__button meeting-details-modal__button--danger"
                        onClick={confirmRemoveDraftAttendee}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : null}

                <button
                  type="button"
                  className="meeting-details-modal__attendee-add"
                  onClick={addDraftAttendee}
                  disabled={!canAddAttendee}
                >
                  + Add attendee
                </button>
              </div>
            </div>

            <div className="meeting-details-modal__footer">
              {isConfirmingDelete ? (
                <div
                  className="meeting-details-modal__delete-confirm"
                  role="status"
                  aria-live="polite"
                >
                  <p className="meeting-details-modal__delete-confirm-text">
                    Delete this meeting and all its attendees and to-dos?
                  </p>
                  <div className="meeting-details-modal__delete-confirm-actions">
                    <button
                      type="button"
                      className="meeting-details-modal__button meeting-details-modal__button--ghost"
                      onClick={() => setIsConfirmingDelete(false)}
                      disabled={isDeleting}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="meeting-details-modal__button meeting-details-modal__button--danger"
                      onClick={() => {
                        void handleDelete();
                      }}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="meeting-details-modal__button meeting-details-modal__button--danger"
                  onClick={() => {
                    setSaveError('');
                    setIsConfirmingDelete(true);
                  }}
                  disabled={isSaving || isDeleting}
                >
                  Delete meeting
                </button>
              )}

              <div className="meeting-details-modal__footer-end">
                {saveError ? <p className="meeting-details-modal__error">{saveError}</p> : null}
                <button
                  type="button"
                  className="meeting-details-modal__button meeting-details-modal__button--success"
                  onClick={handleSave}
                  disabled={isSaving || isDeleting || isConfirmingDelete}
                >
                  {isSaving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

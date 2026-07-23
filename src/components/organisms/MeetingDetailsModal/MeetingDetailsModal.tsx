import { useEffect, useState } from 'react';
import type { Meeting, MeetingAttendeeInput } from '@services/meetings';
import MeetingStatusBadge from '@atoms/MeetingStatusBadge/MeetingStatusBadge';
import './MeetingDetailsModal.css';

interface MeetingDetailsModalProps {
  meeting: Meeting;
  onClose: () => void;
  onSave: (updatedMeeting: Meeting) => Promise<void> | void;
}

function formatMeetingDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function MeetingDetailsModal({
  meeting,
  onClose,
  onSave,
}: MeetingDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [draft, setDraft] = useState<Meeting>({
    ...meeting,
    attendees: meeting.attendees ?? [],
  });

  useEffect(() => {
    setDraft({
      ...meeting,
      attendees: meeting.attendees ?? [],
    });
    setIsEditing(false);
    setSaveError('');
  }, [meeting]);

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

  const handleSave = async () => {
    if (!draft.title.trim()) {
      setSaveError('Title is required.');
      return;
    }

    setSaveError('');
    setIsSaving(true);

    try {
      await onSave({
        ...draft,
        title: draft.title.trim(),
        description: draft.description?.trim() ?? '',
        transcript: draft.transcript?.trim() ?? '',
      });
      setIsEditing(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to save meeting changes.');
    } finally {
      setIsSaving(false);
    }
  };

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
            {!isEditing ? (
              <div className="meeting-details-modal__toolbar">
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
            <div className="meeting-details-modal__section">
              <p className="meeting-details-modal__label">Date</p>
              <p className="meeting-details-modal__value">{formatMeetingDate(draft.date)}</p>
            </div>

            <div className="meeting-details-modal__section">
              <p className="meeting-details-modal__label">Status</p>
              <MeetingStatusBadge status={draft.status} />
            </div>

            <div className="meeting-details-modal__section meeting-details-modal__section--wide">
              <p className="meeting-details-modal__label">Description</p>
              <p className="meeting-details-modal__value">
                {draft.description || 'No description provided.'}
              </p>
            </div>

            <div className="meeting-details-modal__section meeting-details-modal__section--wide">
              <p className="meeting-details-modal__label">Transcript</p>
              <p className="meeting-details-modal__value">
                {draft.transcript || 'Transcript not available yet.'}
              </p>
            </div>

            <div className="meeting-details-modal__section meeting-details-modal__section--wide">
              <p className="meeting-details-modal__label">Attendees</p>
              {draft.attendees.length > 0 ? (
                <div className="meeting-details-modal__attendees">
                  {draft.attendees.map((attendee, index) => (
                    <div
                      key={`${attendee.name}-${index}`}
                      className="meeting-details-modal__attendee"
                    >
                      <span className="meeting-details-modal__attendee-name">
                        {attendee.name || 'Unnamed attendee'}
                      </span>
                      <span className="meeting-details-modal__attendee-meta">
                        {attendee.email || 'No email'}
                        {attendee.role ? ` • ${attendee.role}` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="meeting-details-modal__value">No attendees added.</p>
              )}
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
                {draft.attendees.map((attendee, index) => (
                  <div
                    key={`${attendee.name}-${index}`}
                    className="meeting-details-modal__attendee-editor-row"
                  >
                    <input
                      value={attendee.name}
                      placeholder="Name"
                      onChange={(event) => updateAttendee(index, 'name', event.target.value)}
                    />
                    <input
                      value={attendee.email ?? ''}
                      placeholder="Email"
                      onChange={(event) => updateAttendee(index, 'email', event.target.value)}
                    />
                    <input
                      value={attendee.role ?? ''}
                      placeholder="Role"
                      onChange={(event) => updateAttendee(index, 'role', event.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="meeting-details-modal__footer">
              {saveError ? <p className="meeting-details-modal__error">{saveError}</p> : null}
              <button
                type="button"
                className="meeting-details-modal__button meeting-details-modal__button--success"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

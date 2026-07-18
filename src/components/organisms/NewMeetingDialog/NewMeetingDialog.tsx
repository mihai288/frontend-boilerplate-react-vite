import { useState } from 'react';
import { useMeetingStore } from '../../../store/useMeetingStore';
import Button from '../../atoms/Button/Button';
import AttendeeRow, { type AttendeeDraft } from '../../molecules/AttendeeRow/AttendeeRow';
import { createMeeting } from '../../../services/meetings';
import './NewMeetingDialog.css';

export default function NewMeetingDialog() {
  const [title, setTitle] = useState('');
  const [meetingDateTime, setMeetingDateTime] = useState('');
  const [description, setDescription] = useState('');
  const [transcriptMode, setTranscriptMode] = useState<'text' | 'file'>('text');
  const [transcript, setTranscript] = useState('');
  const [transcriptFileName, setTranscriptFileName] = useState('');
  const [attendees, setAttendees] = useState<AttendeeDraft[]>([{ name: '', email: '', role: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const addMeeting = useMeetingStore((state) => state.addMeeting);
  const isDialogOpen = useMeetingStore((state) => state.isDialogOpen);
  const closeDialog = useMeetingStore((state) => state.closeDialog);

  if (!isDialogOpen) return null;

  const updateAttendee = (index: number, field: keyof AttendeeDraft, value: string) => {
    setAttendees((currentAttendees) =>
      currentAttendees.map((attendee, attendeeIndex) =>
        attendeeIndex === index ? { ...attendee, [field]: value } : attendee,
      ),
    );
  };

  const addAttendee = () => {
    setAttendees((currentAttendees) => [...currentAttendees, { name: '', email: '', role: '' }]);
  };

  const removeAttendee = (index: number) => {
    setAttendees((currentAttendees) =>
      currentAttendees.filter((_, attendeeIndex) => attendeeIndex !== index),
    );
  };

  const resetForm = () => {
    setTitle('');
    setMeetingDateTime('');
    setDescription('');
    setTranscriptMode('text');
    setTranscript('');
    setTranscriptFileName('');
    setAttendees([{ name: '', email: '', role: '' }]);
    setErrorMessage('');
  };

  const handleTranscriptFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setTranscriptFileName('');
      setTranscript('');
      return;
    }

    const fileContents = await file.text();
    setTranscriptMode('file');
    setTranscriptFileName(file.name);
    setTranscript(fileContents);
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    const normalizedTitle = title.trim();
    const normalizedDescription = description.trim();
    const normalizedTranscript = transcript.trim();
    const normalizedDate = meetingDateTime ? new Date(meetingDateTime) : null;
    const validAttendees = attendees
      .map((attendee) => ({
        name: attendee.name.trim(),
        email: attendee.email.trim(),
        role: attendee.role.trim(),
      }))
      .filter((attendee) => attendee.name.length > 0);

    if (!normalizedTitle) {
      setErrorMessage('Title is required.');
      return;
    }

    if (!normalizedDate || Number.isNaN(normalizedDate.getTime())) {
      setErrorMessage('Date and time are required.');
      return;
    }

    if (validAttendees.length === 0) {
      setErrorMessage('Add at least one attendee with a name.');
      return;
    }

    if (transcriptMode === 'file' && transcriptFileName && !normalizedTranscript) {
      setErrorMessage('The transcript file could not be read. Please choose another file.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const meetingData = {
      title: normalizedTitle,
      date: normalizedDate.toISOString(),
      description: normalizedDescription || undefined,
      transcript: normalizedTranscript || undefined,
      attendees: validAttendees,
    };

    try {
      const createdMeeting = await createMeeting(meetingData);
      addMeeting(createdMeeting);
      resetForm();
      closeDialog();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to create the meeting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dialog-overlay" role="presentation" onClick={closeDialog}>
      <div
        className="dialog-box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-meeting-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="dialog-header">
          <div>
            <p className="dialog-kicker">Meeting intake</p>
            <h2 className="dialog-title" id="new-meeting-title">
              Add Meeting
            </h2>
          </div>
          <p className="dialog-subtitle">
            Capture the meeting details, attendees, and transcript source in one submission.
          </p>
        </div>

        <form className="meeting-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="input-group">
              <label htmlFor="meeting-title">Title</label>
              <input
                id="meeting-title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Quarterly planning sync"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="meeting-date-time">Date and time</label>
              <input
                id="meeting-date-time"
                type="datetime-local"
                value={meetingDateTime}
                onChange={(event) => setMeetingDateTime(event.target.value)}
                required
              />
            </div>

            <div className="input-group input-group-wide">
              <label htmlFor="meeting-description">Description</label>
              <textarea
                id="meeting-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Optional context for the meeting"
                rows={3}
              />
            </div>
          </div>

          <section className="form-section">
            <div className="section-heading">
              <h3>Transcript</h3>
              <p>
                Provide text directly or upload a file and we will read it into the meeting record.
              </p>
            </div>

            <div className="transcript-toggle">
              <button
                type="button"
                className={`toggle-chip ${transcriptMode === 'text' ? 'active' : ''}`}
                onClick={() => setTranscriptMode('text')}
              >
                Text input
              </button>
              <button
                type="button"
                className={`toggle-chip ${transcriptMode === 'file' ? 'active' : ''}`}
                onClick={() => setTranscriptMode('file')}
              >
                File upload
              </button>
            </div>

            {transcriptMode === 'file' ? (
              <div className="input-group">
                <label htmlFor="transcript-file">Transcript file</label>
                <input
                  id="transcript-file"
                  type="file"
                  accept=".txt,.md,.csv,.json,.log"
                  onChange={handleTranscriptFileChange}
                />
                <span className="input-hint">{transcriptFileName || 'No file selected yet'}</span>
              </div>
            ) : null}

            <div className="input-group">
              <label htmlFor="meeting-transcript">Transcript text</label>
              <textarea
                id="meeting-transcript"
                value={transcript}
                onChange={(event) => setTranscript(event.target.value)}
                placeholder="Paste the transcript here or upload a file above"
                rows={8}
              />
            </div>
          </section>

          <section className="form-section">
            <div className="section-heading">
              <h3>Attendees</h3>
              <p>Add one or more participants. Only the name is required.</p>
            </div>

            <div className="attendee-list">
              {attendees.map((attendee, index) => (
                <AttendeeRow
                  key={`${index}-${attendee.name}-${attendee.email}`}
                  index={index}
                  attendee={attendee}
                  canRemove={attendees.length > 1}
                  onChange={updateAttendee}
                  onRemove={removeAttendee}
                />
              ))}
            </div>

            <button type="button" className="add-attendee-button" onClick={addAttendee}>
              + Add attendee
            </button>
          </section>

          {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

          <div className="dialog-buttons">
            <Button text="Cancel" onClick={closeDialog} />
            <button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Add Meeting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

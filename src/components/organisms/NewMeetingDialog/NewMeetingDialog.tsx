import { useState } from 'react';
import { useMeetingStore } from '../../../store/useMeetingStore';
import Button from '../../atoms/Button/Button';
import './NewMeetingDialog.css';
import { createMeeting } from '@services/meetings';

export default function NewMeetingDialog() {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const addMeeting = useMeetingStore((state) => state.addMeeting);
  const isDialogOpen = useMeetingStore((state) => state.isDialogOpen);
  const closeDialog = useMeetingStore((state) => state.closeDialog);

  if (!isDialogOpen) return null;

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    setErrorMessage('');

    const meetingData = {
      title,
      date: new Date(date).toISOString(),
      description: description.trim() || undefined,
    };

    try {
      const createdMeeting = await createMeeting(meetingData);
      addMeeting(createdMeeting);
      setTitle('');
      setDate('');
      setDescription('');
      closeDialog();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to create meeting');
    }
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog-box">
        <h2 className="dialog-title">New Meeting</h2>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Meeting Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="input-group">
            <label>Date and time</label>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional notes about the meeting"
            />
          </div>

          {errorMessage ? <p className="dialog-error">{errorMessage}</p> : null}

          <div className="dialog-buttons">
            <Button text="Cancel" onClick={closeDialog} />
            <button type="submit" className="submit-button">
              Add Meeting
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

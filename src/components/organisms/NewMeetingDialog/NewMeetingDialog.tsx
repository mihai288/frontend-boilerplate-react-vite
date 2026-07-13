import { useState } from 'react';
import { useMeetingStore } from '../../../store/useMeetingStore';
import Button from '../../atoms/Button/Button';
import './NewMeetingDialog.css';

export default function NewMeetingDialog() {
  const [title, setTitle] = useState('');
  const [transcript, setTranscript] = useState('');

  const isDialogOpen = useMeetingStore((state) => state.isDialogOpen);
  const closeDialog = useMeetingStore((state) => state.closeDialog);

  if (!isDialogOpen) return null;

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();

    const meetingData = {
      title: title,
      transcript: transcript,
    };

    fetch('http://localhost:3000/meetings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(meetingData),
    }).then((response) => {
      if (response.ok) {
        setTitle('');
        setTranscript('');
        closeDialog();
      }
    });
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
            <label>Upload Transcript</label>
            <input type="text" value={transcript} onChange={(e) => setTranscript(e.target.value)} />
          </div>

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

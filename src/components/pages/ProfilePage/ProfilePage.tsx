import { useMemo, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useMeetingStore } from '@/store/useMeetingStore';
import MeetingDetailsModal from '@organisms/MeetingDetailsModal/MeetingDetailsModal';
import { deleteMeeting, processMeeting, type Meeting, updateMeeting } from '@services/meetings';
import { formatMeetingDate } from '@/utils/formatMeetingDate';
import './ProfilePage.css';

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);
  const accessToken = useAuthStore((state) => state.accessToken);
  const meetings = useMeetingStore((state) => state.meetings);

  const setMeetings = useMeetingStore((state) => state.setMeetings);
  const removeMeeting = useMeetingStore((state) => state.removeMeeting);
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(user?.name || '');
  const [draftEmail, setDraftEmail] = useState(user?.email || '');
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  const initials = useMemo(() => {
    const name = isEditing ? draftName : user?.name;
    return (
      name
        ?.split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase() || 'U'
    );
  }, [user?.name, draftName, isEditing]);

  const completedMeetings = meetings.filter((meeting) => meeting.status === 'completed').length;
  const activeMeetings = meetings.filter((meeting) => meeting.status === 'processing').length;
  const totalMeetings = meetings.length;

  const upsertMeeting = (updatedMeeting: Meeting) => {
    setMeetings(
      meetings.map((meeting) => (meeting._id === updatedMeeting._id ? updatedMeeting : meeting)),
    );
    setSelectedMeeting((current) =>
      current && current._id === updatedMeeting._id ? updatedMeeting : current,
    );
  };

  const handleEdit = () => {
    setDraftName(user?.name || '');
    setDraftEmail(user?.email || '');
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!draftName.trim()) return;
    setSession({
      access_token: accessToken ?? '',
      user: { ...user, name: draftName.trim(), email: draftEmail.trim() },
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="profile-page">
      <section className="profile-page__hero">
        <div className="profile-page__hero-card">
          <div className="profile-page__avatar" aria-hidden="true">
            {initials}
          </div>
          <div>
            <h2>{user?.name || 'Anonymous user'}</h2>
            <p>{user?.email || 'No email available'}</p>
          </div>
        </div>
      </section>

      <section className="profile-page__stats">
        <div className="profile-page__stat-card">
          <p className="profile-page__stat-label">Total meetings</p>
          <p className="profile-page__stat-value">{totalMeetings}</p>
        </div>
        <div className="profile-page__stat-card">
          <p className="profile-page__stat-label">Processed meetings</p>
          <p className="profile-page__stat-value">{completedMeetings}</p>
        </div>
        <div className="profile-page__stat-card">
          <p className="profile-page__stat-label">In progress</p>
          <p className="profile-page__stat-value">{activeMeetings}</p>
        </div>
      </section>

      <section className="profile-page__content">
        <div className="profile-page__panel">
          <div className="profile-page__panel-header">
            <h2>Profile details</h2>
            {!isEditing ? (
              <button type="button" className="profile-page__action-button" onClick={handleEdit}>
                Edit profile
              </button>
            ) : (
              <div className="profile-page__edit-actions">
                <button
                  type="button"
                  className="profile-page__action-button profile-page__action-button--secondary"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button type="button" className="profile-page__action-button" onClick={handleSave}>
                  Save
                </button>
              </div>
            )}
          </div>

          <div className="profile-page__detail-list">
            <div className="profile-page__detail-row">
              <span className="profile-page__detail-label">Name</span>
              {isEditing ? (
                <input
                  className="profile-page__edit-input"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                />
              ) : (
                <span className="profile-page__detail-value">{user?.name || 'Not available'}</span>
              )}
            </div>
            <div className="profile-page__detail-row">
              <span className="profile-page__detail-label">Email</span>
              {isEditing ? (
                <input
                  className="profile-page__edit-input"
                  type="email"
                  value={draftEmail}
                  onChange={(e) => setDraftEmail(e.target.value)}
                />
              ) : (
                <span className="profile-page__detail-value">{user?.email || 'Not available'}</span>
              )}
            </div>
          </div>
        </div>

        <div className="profile-page__panel">
          <div className="profile-page__panel-header">
            <h2>Recent meetings</h2>
          </div>

          {meetings.length > 0 ? (
            <ul className="profile-page__meeting-list">
              {meetings.slice(0, 3).map((meeting) => (
                <li
                  key={meeting._id}
                  className="profile-page__meeting-item profile-page__meeting-item--clickable"
                  onClick={() => setSelectedMeeting(meeting)}
                >
                  <strong>{meeting.title}</strong>
                  <span>{formatMeetingDate(meeting.date)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="profile-page__empty">No meetings yet</p>
          )}
        </div>
      </section>
      {selectedMeeting ? (
        <MeetingDetailsModal
          meeting={selectedMeeting}
          onClose={() => setSelectedMeeting(null)}
          onSave={async (updatedMeeting) => {
            const persistedMeeting = await updateMeeting(updatedMeeting._id, {
              title: updatedMeeting.title,
              date: updatedMeeting.date,
              description: updatedMeeting.description,
              transcript: updatedMeeting.transcript,
              attendees: updatedMeeting.attendees,
              actionItems: updatedMeeting.actionItems,
            });

            upsertMeeting(persistedMeeting);
            setSelectedMeeting(null);
          }}
          onDelete={async (meetingId) => {
            await deleteMeeting(meetingId);
            removeMeeting(meetingId);
            setSelectedMeeting(null);
          }}
          onProcess={async (meetingId) => {
            const processingMeeting = await processMeeting(meetingId);
            upsertMeeting(processingMeeting);
            return processingMeeting;
          }}
          onUpdateActionItems={async (meetingId, actionItems) => {
            const persistedMeeting = await updateMeeting(meetingId, { actionItems });
            upsertMeeting(persistedMeeting);
            return persistedMeeting;
          }}
        />
      ) : null}
    </div>
  );
}

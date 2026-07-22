import MeetingStatusBadge from '@atoms/MeetingStatusBadge/MeetingStatusBadge';
import type { Meeting } from '@services/meetings';
import './MeetingCard.css';

interface MeetingCardProps {
  meeting: Meeting;
  onOpen: () => void;
}

function formatMeetingDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function MeetingCard({ meeting, onOpen }: MeetingCardProps) {
  return (
    <article className="meeting-card">
      <button type="button" className="meeting-card__summary" onClick={onOpen}>
        <span className="meeting-card__title-group">
          <span className="meeting-card__icon">🗓️</span>
          <span className="meeting-card__text-block">
            <span className="meeting-card__date">{formatMeetingDate(meeting.date)}</span>
            <span className="meeting-card__title">{meeting.title}</span>
            <span className="meeting-card__subtitle">
              {meeting.description ? meeting.description : 'Open to view details and attendees'}
            </span>
          </span>
        </span>

        <span className="meeting-card__meta">
          <MeetingStatusBadge status={meeting.status} />
        </span>
      </button>
    </article>
  );
}

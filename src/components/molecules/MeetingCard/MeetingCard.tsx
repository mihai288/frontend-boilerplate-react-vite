import MeetingStatusBadge from '@atoms/MeetingStatusBadge/MeetingStatusBadge';
import type { Meeting } from '@services/meetings';
import { formatMeetingDate } from '@/utils/formatMeetingDate';
import './MeetingCard.css';

interface MeetingCardProps {
  meeting: Meeting;
  onOpen: () => void;
  onOpenAttendees: () => void;
}

export default function MeetingCard({ meeting, onOpen, onOpenAttendees }: MeetingCardProps) {
  const attendeeCount = meeting.attendees.filter(
    (attendee) => attendee.name.trim().length > 0,
  ).length;
  const attendeeLabel = attendeeCount === 1 ? '1 attendee' : `${attendeeCount} attendees`;

  return (
    <article className="meeting-card">
      <div className="meeting-card__summary">
        <button type="button" className="meeting-card__main" onClick={onOpen}>
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
        </button>

        <span className="meeting-card__meta">
          <MeetingStatusBadge status={meeting.status} />
          <button
            type="button"
            className="meeting-card__attendees"
            aria-label={`Open attendees list: ${attendeeLabel}`}
            onClick={onOpenAttendees}
          >
            {attendeeLabel}
          </button>
        </span>
      </div>
    </article>
  );
}

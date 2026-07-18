import MeetingStatusBadge from '@atoms/MeetingStatusBadge/MeetingStatusBadge';
import type { Meeting } from '@services/meetings';
import './MeetingCard.css';

interface MeetingCardProps {
  meeting: Meeting;
  isExpanded: boolean;
  onToggle: () => void;
}

function formatMeetingDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function MeetingCard({ meeting, isExpanded, onToggle }: MeetingCardProps) {
  return (
    <article className={`meeting-card ${isExpanded ? 'meeting-card--expanded' : ''}`}>
      <button type="button" className="meeting-card__summary" onClick={onToggle}>
        <span className="meeting-card__title-group">
          <span className="meeting-card__chevron">{isExpanded ? '▾' : '▸'}</span>
          <span>
            <span className="meeting-card__date">{formatMeetingDate(meeting.date)}</span>
            <span className="meeting-card__title">{meeting.title}</span>
          </span>
        </span>

        <span className="meeting-card__meta">
          <MeetingStatusBadge status={meeting.status} />
        </span>
      </button>

      {isExpanded ? (
        <div className="meeting-card__details">
          <div>
            <p className="meeting-card__label">Description</p>
            <p className="meeting-card__text">
              {meeting.description || 'No description provided.'}
            </p>
          </div>

          <div>
            <p className="meeting-card__label">Transcript</p>
            <p className="meeting-card__text">
              {meeting.transcript || 'Transcript not available yet.'}
            </p>
          </div>

          <div>
            <p className="meeting-card__label">Record ID</p>
            <p className="meeting-card__text meeting-card__text--mono">{meeting._id}</p>
          </div>
        </div>
      ) : null}
    </article>
  );
}

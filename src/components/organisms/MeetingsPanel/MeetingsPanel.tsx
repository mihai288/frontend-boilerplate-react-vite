import MeetingCard from '@molecules/MeetingCard/MeetingCard';
import type { Meeting } from '@services/meetings';
import './MeetingsPanel.css';

interface MeetingsPanelProps {
  meetings: Meeting[];
  expandedMeetingId: string | null;
  onToggleMeeting: (meetingId: string) => void;
}

export default function MeetingsPanel({
  meetings,
  expandedMeetingId,
  onToggleMeeting,
}: MeetingsPanelProps) {
  return (
    <section className="meetings-panel" aria-label="Meetings list">
      <div className="meetings-panel__header">
        <span>Date</span>
        <span>Title</span>
        <span>Status</span>
      </div>

      <div className="meetings-panel__list">
        {meetings.map((meeting) => (
          <MeetingCard
            key={meeting._id}
            meeting={meeting}
            isExpanded={expandedMeetingId === meeting._id}
            onToggle={() => onToggleMeeting(meeting._id)}
          />
        ))}
      </div>
    </section>
  );
}

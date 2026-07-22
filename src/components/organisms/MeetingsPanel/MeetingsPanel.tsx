import MeetingCard from '@molecules/MeetingCard/MeetingCard';
import type { Meeting } from '@services/meetings';
import './MeetingsPanel.css';

interface MeetingsPanelProps {
  meetings: Meeting[];
  onOpenMeeting: (meeting: Meeting) => void;
}

export default function MeetingsPanel({ meetings, onOpenMeeting }: MeetingsPanelProps) {
  return (
    <section className="meetings-panel" aria-label="Meetings list">
      <div className="meetings-panel__list">
        {meetings.map((meeting) => (
          <MeetingCard key={meeting._id} meeting={meeting} onOpen={() => onOpenMeeting(meeting)} />
        ))}
      </div>
    </section>
  );
}

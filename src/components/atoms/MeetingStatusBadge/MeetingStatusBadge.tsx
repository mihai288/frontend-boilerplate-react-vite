import './MeetingStatusBadge.css';
import type { MeetingStatus } from '@services/meetings';

interface MeetingStatusBadgeProps {
  status: MeetingStatus;
}

const statusLabels: Record<MeetingStatus, string> = {
  idle: 'Idle',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
};

export default function MeetingStatusBadge({ status }: MeetingStatusBadgeProps) {
  return (
    <span className={`meeting-status-badge meeting-status-badge--${status}`}>
      {statusLabels[status]}
    </span>
  );
}

import './MeetingsSidebar.css';

interface MeetingsSidebarProps {
  query: string;
  status: string;
  onQueryChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export default function MeetingsSidebar({
  query,
  status,
  onQueryChange,
  onStatusChange,
}: MeetingsSidebarProps) {
  return (
    <aside className="meetings-sidebar" aria-label="Meeting filters">
      <label className="meetings-sidebar__field">
        <span>Search</span>
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Title or description"
        />
      </label>

      <label className="meetings-sidebar__field">
        <span>Status</span>
        <select value={status} onChange={(event) => onStatusChange(event.target.value)}>
          <option value="all">All</option>
          <option value="idle">Idle</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </label>

      <div className="meetings-sidebar__hint">
        The page loads the full meetings collection from the backend and filters the result locally.
      </div>
    </aside>
  );
}

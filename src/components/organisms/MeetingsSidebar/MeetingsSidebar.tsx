import './MeetingsSidebar.css';

interface MeetingsSidebarProps {
  query: string;
  status: string;
  dateFilter: string;
  sortBy: 'date' | 'name' | 'created';
  onQueryChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onSortByChange: (value: 'date' | 'name' | 'created') => void;
}

export default function MeetingsSidebar({
  query,
  status,
  dateFilter,
  sortBy,
  onQueryChange,
  onStatusChange,
  onDateChange,
  onSortByChange,
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

      <label className="meetings-sidebar__field">
        <span>Date</span>
        <input
          type="date"
          value={dateFilter}
          onChange={(event) => onDateChange(event.target.value)}
        />
      </label>

      <label className="meetings-sidebar__field">
        <span>Sort by</span>
        <select
          value={sortBy}
          onChange={(event) => onSortByChange(event.target.value as 'date' | 'name' | 'created')}
        >
          <option value="date">Date</option>
          <option value="name">Name</option>
          <option value="created">Last created</option>
        </select>
      </label>
    </aside>
  );
}

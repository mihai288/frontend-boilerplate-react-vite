import type { ActionItemStatus } from '@services/meetings';
import './TodoStatusSelect.css';

interface TodoStatusSelectProps {
  value: ActionItemStatus;
  onChange: (status: ActionItemStatus) => void;
  disabled?: boolean;
}

const statusOptions: Array<{ value: ActionItemStatus; label: string }> = [
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'DONE', label: 'Done' },
  { value: 'UNKNOWN', label: 'Unknown' },
];

export default function TodoStatusSelect({
  value,
  onChange,
  disabled = false,
}: TodoStatusSelectProps) {
  return (
    <select
      className={`todo-status-select todo-status-select--${value.toLowerCase().replace('_', '-')}`}
      value={value}
      disabled={disabled}
      aria-label="Task status"
      onChange={(event) => onChange(event.target.value as ActionItemStatus)}
    >
      {statusOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

import './AttendeeRow.css';

export interface AttendeeDraft {
  name: string;
  email: string;
  role: string;
}

interface AttendeeRowProps {
  index: number;
  attendee: AttendeeDraft;
  canRemove: boolean;
  isNew?: boolean;
  onChange: (index: number, field: keyof AttendeeDraft, value: string) => void;
  onRemove: (index: number) => void;
}

export default function AttendeeRow({
  index,
  attendee,
  canRemove,
  isNew = false,
  onChange,
  onRemove,
}: AttendeeRowProps) {
  return (
    <div className={`attendee-row ${isNew ? 'attendee-row--new' : ''}`}>
      <div className="attendee-field">
        <label htmlFor={`attendee-name-${index}`}>Name</label>
        <input
          id={`attendee-name-${index}`}
          type="text"
          value={attendee.name}
          onChange={(event) => onChange(index, 'name', event.target.value)}
          placeholder="Participant name"
          required
        />
      </div>

      <div className="attendee-field">
        <label htmlFor={`attendee-email-${index}`}>Email</label>
        <input
          id={`attendee-email-${index}`}
          type="email"
          value={attendee.email}
          onChange={(event) => onChange(index, 'email', event.target.value)}
          placeholder="participant@example.com"
        />
      </div>

      <div className="attendee-field">
        <label htmlFor={`attendee-role-${index}`}>Role / Type</label>
        <input
          id={`attendee-role-${index}`}
          type="text"
          value={attendee.role}
          onChange={(event) => onChange(index, 'role', event.target.value)}
          placeholder="Optional role"
        />
      </div>

      {canRemove ? (
        <button type="button" className="attendee-remove-button" onClick={() => onRemove(index)}>
          Remove
        </button>
      ) : null}
    </div>
  );
}

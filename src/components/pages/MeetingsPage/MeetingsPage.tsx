import { useEffect, useMemo, useState } from 'react';
import MeetingsPanel from '@organisms/MeetingsPanel/MeetingsPanel';
import MeetingsSidebar from '@organisms/MeetingsSidebar/MeetingsSidebar';
import MeetingDetailsModal from '@organisms/MeetingDetailsModal/MeetingDetailsModal';
import { getMeetings, type Meeting } from '@services/meetings';
import { useMeetingStore } from '../../../store/useMeetingStore';
import './MeetingsPage.css';

export default function MeetingsPage() {
  const meetings = useMeetingStore((state) => state.meetings);
  const isLoading = useMeetingStore((state) => state.isLoading);
  const errorMessage = useMeetingStore((state) => state.errorMessage);
  const setMeetings = useMeetingStore((state) => state.setMeetings);
  const setLoading = useMeetingStore((state) => state.setLoading);
  const setErrorMessage = useMeetingStore((state) => state.setErrorMessage);

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'created'>('date');
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    let isMounted = true;

    async function loadMeetings() {
      setLoading(true);
      setErrorMessage('');

      try {
        const data = await getMeetings();

        if (isMounted) {
          setMeetings(data);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : 'Unable to load meetings');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadMeetings();

    return () => {
      isMounted = false;
    };
  }, [setErrorMessage, setLoading, setMeetings]);

  const filteredMeetings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const filtered = meetings.filter((meeting) => {
      const matchesStatus = status === 'all' || meeting.status === status;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        meeting.title.toLowerCase().includes(normalizedQuery) ||
        (meeting.description ?? '').toLowerCase().includes(normalizedQuery);
      const matchesDate =
        dateFilter.length === 0 || new Date(meeting.date).toISOString().slice(0, 10) === dateFilter;

      return matchesStatus && matchesQuery && matchesDate;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.title.localeCompare(b.title);
      }

      if (sortBy === 'created') {
        const createdA = new Date(a.createdAt ?? a.date).getTime();
        const createdB = new Date(b.createdAt ?? b.date).getTime();
        return createdB - createdA;
      }

      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });
  }, [meetings, query, status, dateFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredMeetings.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, status, dateFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedMeetings = filteredMeetings.slice(
    (safeCurrentPage - 1) * PAGE_SIZE,
    safeCurrentPage * PAGE_SIZE,
  );

  return (
    <div className="meetings-page">
      <div className="meetings-page__content">
        <MeetingsSidebar
          query={query}
          status={status}
          dateFilter={dateFilter}
          sortBy={sortBy}
          onQueryChange={setQuery}
          onStatusChange={setStatus}
          onDateChange={setDateFilter}
          onSortByChange={setSortBy}
        />

        <section className="meetings-page__main" aria-live="polite">
          {isLoading ? <p className="meetings-page__state">Loading meetings...</p> : null}
          {errorMessage ? (
            <p className="meetings-page__state meetings-page__state--error">{errorMessage}</p>
          ) : null}
          {!isLoading && !errorMessage && filteredMeetings.length === 0 ? (
            <p className="meetings-page__state">No meetings match the current filters.</p>
          ) : null}

          {filteredMeetings.length > 0 ? (
            <>
              <MeetingsPanel
                meetings={paginatedMeetings}
                onOpenMeeting={(meeting) => setSelectedMeeting(meeting)}
              />

              {totalPages > 1 ? (
                <div className="meetings-page__pagination">
                  <button
                    type="button"
                    className="meetings-page__pagination-button"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={safeCurrentPage === 1}
                  >
                    Previous
                  </button>

                  <label className="meetings-page__page-select">
                    <span>Page</span>
                    <select
                      value={safeCurrentPage}
                      onChange={(event) => setCurrentPage(Number(event.target.value))}
                    >
                      {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                        <option key={page} value={page}>
                          {page} of {totalPages}
                        </option>
                      ))}
                    </select>
                  </label>

                  <button
                    type="button"
                    className="meetings-page__pagination-button"
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    disabled={safeCurrentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              ) : null}
            </>
          ) : null}
        </section>
      </div>

      {selectedMeeting ? (
        <MeetingDetailsModal
          meeting={selectedMeeting}
          onClose={() => setSelectedMeeting(null)}
          onSave={(updatedMeeting) => {
            setMeetings(
              meetings.map((meeting) =>
                meeting._id === updatedMeeting._id ? updatedMeeting : meeting,
              ),
            );
            setSelectedMeeting(null);
          }}
        />
      ) : null}
    </div>
  );
}

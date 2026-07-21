import { useEffect, useMemo, useState } from 'react';
import MeetingsPanel from '@organisms/MeetingsPanel/MeetingsPanel';
import MeetingsSidebar from '@organisms/MeetingsSidebar/MeetingsSidebar';
import { getMeetings } from '@services/meetings';
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
  const [expandedMeetingId, setExpandedMeetingId] = useState<string | null>(null);
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

    return meetings.filter((meeting) => {
      const matchesStatus = status === 'all' || meeting.status === status;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        meeting.title.toLowerCase().includes(normalizedQuery) ||
        (meeting.description ?? '').toLowerCase().includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [meetings, query, status]);

  const totalPages = Math.max(1, Math.ceil(filteredMeetings.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, status]);

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
          onQueryChange={setQuery}
          onStatusChange={setStatus}
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
                expandedMeetingId={expandedMeetingId}
                onToggleMeeting={(meetingId) =>
                  setExpandedMeetingId((currentId) => (currentId === meetingId ? null : meetingId))
                }
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
    </div>
  );
}

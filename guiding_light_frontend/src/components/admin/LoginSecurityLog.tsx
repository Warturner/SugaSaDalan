import React, { useEffect, useState } from 'react';
import { AlertTriangle, ChevronLeft, ChevronRight, RefreshCw, Search, ShieldCheck } from 'lucide-react';
import { apiFetch } from '../../services/api';

type SecurityEventType = 'login_failed' | 'login_success' | 'login_restricted';

interface LoginSecurityEntry {
  event_id: number | string;
  attempted_username: string;
  event_type: SecurityEventType;
  details: string;
  occurred_at: string;
}

interface SecurityResponse {
  success: boolean;
  events: LoginSecurityEntry[];
  page: number;
  has_more: boolean;
}

const eventLabels: Record<SecurityEventType, string> = {
  login_failed: 'Failed login',
  login_success: 'Successful login',
  login_restricted: 'Temporary restriction'
};

function formatTime(value: string): string {
  // MySQL date strings are displayed without guessing their server timezone.
  return value;
}

export default function LoginSecurityLog() {
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [events, setEvents] = useState<LoginSecurityEntry[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const invalidRange = fromDate !== '' && toDate !== '' && fromDate > toDate;

  useEffect(() => {
    if (invalidRange) {
      setError('Start date must not be after end date.');
      setEvents([]);
      setHasMore(false);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (fromDate) params.set('from', fromDate);
    if (toDate) params.set('to', toDate);
    if (type) params.set('type', type);
    params.set('page', String(page));

    setLoading(true);
    setError(null);
    const timer = window.setTimeout(() => {
      apiFetch<SecurityResponse>(`get_login_security.php?${params.toString()}`, {
        signal: controller.signal
      })
        .then(result => {
          if (controller.signal.aborted) return;
          setEvents(result.events);
          setHasMore(result.has_more);
        })
        .catch(err => {
          if (controller.signal.aborted) return;
          setEvents([]);
          setHasMore(false);
          setError(err instanceof Error ? err.message : 'Unable to load security events.');
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 300);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [search, fromDate, toDate, type, page, refresh, invalidRange]);

  return (
    <section className="w-full max-w-6xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 text-[#4b5e52]">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Admin only · Read only</span>
          </div>
          <h2 className="text-3xl font-serif italic text-stone-800">Login Security History</h2>
          <p className="mt-2 text-sm text-stone-500">
            Review successful and failed logins and temporary restrictions.
            Passwords and source IP addresses are not shown.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRefresh(v => v + 1)}
          className="inline-flex gap-2 items-center justify-center bg-[#4b5e52] text-white rounded-full px-5 py-3 text-xs font-bold uppercase tracking-wider hover:bg-[#3a4740]"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </header>

      <div className="bg-white p-5 sm:p-6 border border-stone-100 rounded-[24px] shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <label className="block">
            <span className="text-xs font-semibold text-stone-500">Search username / event</span>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="search" value={search} maxLength={100}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Username or event…"
                className="w-full border border-stone-200 bg-stone-50 pl-10 pr-3 py-3 rounded-xl text-sm text-stone-800"
              />
            </div>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-stone-500">From date</span>
            <input type="date" value={fromDate}
              onChange={e => { setFromDate(e.target.value); setPage(1); }}
              className="w-full mt-2 border border-stone-200 bg-stone-50 px-3 py-3 rounded-xl text-sm text-stone-800"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-stone-500">To date</span>
            <input type="date" value={toDate}
              onChange={e => { setToDate(e.target.value); setPage(1); }}
              className="w-full mt-2 border border-stone-200 bg-stone-50 px-3 py-3 rounded-xl text-sm text-stone-800"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-stone-500">Event type</span>
            <select value={type}
              onChange={e => { setType(e.target.value); setPage(1); }}
              className="w-full mt-2 border border-stone-200 bg-stone-50 px-3 py-3 rounded-xl text-sm text-stone-800"
            >
              <option value="">All events</option>
              <option value="login_failed">Failed login</option>
              <option value="login_success">Successful login</option>
              <option value="login_restricted">Temporary restriction</option>
            </select>
          </label>
        </div>
        <button type="button" className="text-sm text-[#4b5e52] underline"
          onClick={() => { setSearch(''); setFromDate(''); setToDate(''); setType(''); setPage(1); }}
        >Clear filters</button>
      </div>

      {error && <div role="alert" className="p-4 rounded-xl bg-red-50 text-red-700 flex items-center gap-2 text-sm">
        <AlertTriangle className="w-5 h-5 shrink-0" />{error}
      </div>}

      <div className="bg-white rounded-[24px] border border-stone-100 shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-stone-500 text-sm">Loading security events…</p>
        ) : !error && events.length === 0 ? (
          <p className="p-8 text-center text-stone-500 text-sm">No matching security events.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-stone-50 text-stone-500">
                <tr>
                  <th className="px-5 py-4">Date / time</th>
                  <th className="px-5 py-4">Username attempted</th>
                  <th className="px-5 py-4">Event</th>
                  <th className="px-5 py-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {events.map(event => (
                  <tr key={event.event_id}>
                    <td className="px-5 py-4 whitespace-nowrap text-stone-500">{formatTime(event.occurred_at)}</td>
                    <td className="px-5 py-4 text-stone-800 font-semibold break-all">{event.attempted_username}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        event.event_type === 'login_success'
                          ? 'bg-green-50 text-green-800'
                          : event.event_type === 'login_restricted'
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-red-50 text-red-800'
                      }`}>{eventLabels[event.event_type] ?? event.event_type}</span>
                    </td>
                    <td className="px-5 py-4 text-stone-600">{event.details || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <footer className="flex items-center justify-between">
        <span className="text-xs text-stone-500">Page {page} · 50 events per page</span>
        <div className="flex gap-2">
          <button type="button" disabled={loading || page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="p-2 border rounded-xl disabled:opacity-40" aria-label="Previous page">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button type="button" disabled={loading || !hasMore}
            onClick={() => setPage(p => p + 1)}
            className="p-2 border rounded-xl disabled:opacity-40" aria-label="Next page">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </section>
  );
}

import React, { useEffect, useState } from 'react';
import { Activity, Search, CalendarDays, RefreshCw, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';
import { apiFetch } from '../../../services/api';

type AccountAction =
  | 'account_created'
  | 'username_changed'
  | 'role_changed'
  | 'password_changed'
  | 'account_deleted';

interface AccountLogEntry {
  log_id: string | number;
  actor_username: string;
  target_username: string;
  action: AccountAction;
  details: string;
  created_at: string;
}

interface AccountLogResponse {
  success: boolean;
  logs: AccountLogEntry[];
  page: number;
  has_more: boolean;
}

const ACTION_LABELS: Record<AccountAction, string> = {
  account_created: 'Account created',
  username_changed: 'Username changed',
  role_changed: 'Role changed',
  password_changed: 'Password changed',
  account_deleted: 'Account deleted'
};

export default function AccountActivityLog() {
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [action, setAction] = useState('');
  const [page, setPage] = useState(1);
  const [refreshNumber, setRefreshNumber] = useState(0);
  const [logs, setLogs] = useState<AccountLogEntry[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const invalidRange = fromDate !== '' && toDate !== '' && fromDate > toDate;

  useEffect(() => {
    if (invalidRange) {
      setError('Start date must not be after end date.');
      setLogs([]);
      setHasMore(false);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (fromDate) params.set('from', fromDate);
    if (toDate) params.set('to', toDate);
    if (action) params.set('action', action);
    params.set('page', String(page));

    setLoading(true);
    setError(null);

    const timer = window.setTimeout(() => {
      apiFetch<AccountLogResponse>(`get_account_activity.php?${params.toString()}`, {
        signal: controller.signal
      })
        .then(data => {
          if (controller.signal.aborted) return;
          setLogs(data.logs);
          setHasMore(data.has_more);
        })
        .catch(err => {
          if (controller.signal.aborted) return;
          setLogs([]);
          setHasMore(false);
          setError(err instanceof Error ? err.message : 'Unable to load activity logs.');
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 300);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [search, fromDate, toDate, action, page, refreshNumber, invalidRange]);

  const clearFilters = () => {
    setSearch('');
    setFromDate('');
    setToDate('');
    setAction('');
    setPage(1);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 text-[#4b5e52]">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-[10px] tracking-widest uppercase font-bold">Admin only</span>
          </div>
          <h2 className="text-3xl font-serif italic text-stone-800">Account Activity</h2>
          <p className="text-sm text-stone-500 mt-2">Review successful account changes, including changes to deleted accounts.</p>
        </div>
        <button
          type="button"
          onClick={() => setRefreshNumber(value => value + 1)}
          className="inline-flex gap-2 items-center justify-center bg-[#4b5e52] text-white rounded-full px-5 py-3 text-xs font-bold uppercase tracking-wider hover:bg-[#3a4740]"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </header>

      <section aria-label="Activity filters" className="rounded-[24px] bg-white p-5 sm:p-6 border border-stone-100 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <label className="block sm:col-span-2 xl:col-span-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Search account history</span>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="search"
                value={search}
                maxLength={100}
                onChange={event => { setSearch(event.target.value); setPage(1); }}
                placeholder="Admin, username, activity…"
                className="w-full border border-stone-200 bg-stone-50 pl-10 pr-3 py-3 rounded-xl text-sm text-stone-800"
              />
            </div>
          </label>
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">From date</span>
            <input
              type="date"
              value={fromDate}
              onChange={event => { setFromDate(event.target.value); setPage(1); }}
              className="w-full mt-2 border border-stone-200 bg-stone-50 px-3 py-3 rounded-xl text-sm text-stone-800"
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">To date</span>
            <input
              type="date"
              value={toDate}
              onChange={event => { setToDate(event.target.value); setPage(1); }}
              className="w-full mt-2 border border-stone-200 bg-stone-50 px-3 py-3 rounded-xl text-sm text-stone-800"
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Activity type</span>
            <select
              value={action}
              onChange={event => { setAction(event.target.value); setPage(1); }}
              className="w-full mt-2 border border-stone-200 bg-stone-50 px-3 py-3 rounded-xl text-sm text-stone-800"
            >
              <option value="">All activities</option>
              {Object.entries(ACTION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="flex items-center gap-1 text-xs text-stone-400">
            <CalendarDays className="w-3.5 h-3.5" /> Dates use the database server's calendar time.
          </p>
          <button type="button" className="text-xs font-semibold text-[#4b5e52] hover:underline" onClick={clearFilters}>
            Clear filters
          </button>
        </div>
      </section>

      <section className="bg-white rounded-[24px] border border-stone-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 p-5 border-b border-stone-100">
          <Activity className="w-4 h-4 text-[#4b5e52]" />
          <h3 className="font-semibold text-stone-800">History records</h3>
          <span className="text-xs text-stone-400 ml-auto">Page {page} · up to 50 records</span>
        </div>

        {error ? (
          <div role="alert" className="p-8 text-red-600 text-sm">{error}</div>
        ) : loading ? (
          <p className="text-center p-10 text-stone-500 text-sm">Loading activity…</p>
        ) : logs.length === 0 ? (
          <p className="text-center p-10 text-stone-500 text-sm">No account activity matches these filters. New history starts after the migration.</p>
        ) : (
          <div className="divide-y divide-stone-100">
            {logs.map(log => (
              <article key={log.log_id} className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-2 md:gap-5">
                <div className="space-y-2">
                  <span className="inline-flex px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide rounded-full bg-[#4b5e52]/10 text-[#3a4740]">
                    {ACTION_LABELS[log.action] ?? log.action.replace(/_/g, ' ')}
                  </span>
                  <time className="block text-xs text-stone-500" dateTime={log.created_at}>
                    {log.created_at} (server time)
                  </time>
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="text-sm text-stone-700 break-words">
                    <strong className="text-stone-900">{log.actor_username}</strong>
                    <span className="text-stone-400"> acted on </span>
                    <strong className="text-stone-900">{log.target_username}</strong>
                  </p>
                  <p className="text-sm text-stone-600 break-words">{log.details}</p>
                </div>
              </article>
            ))}
          </div>
        )}

        <footer className="p-4 sm:p-5 border-t border-stone-100 flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={page === 1 || loading}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="inline-flex gap-1 items-center px-4 py-2 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 disabled:opacity-40"
          ><ChevronLeft className="w-4 h-4" /> Previous</button>
          <span className="text-xs text-stone-500">Page {page}</span>
          <button
            type="button"
            disabled={!hasMore || loading}
            onClick={() => setPage(p => p + 1)}
            className="inline-flex gap-1 items-center px-4 py-2 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 disabled:opacity-40"
          >Next <ChevronRight className="w-4 h-4" /></button>
        </footer>
      </section>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { AlertTriangle, LockKeyhole, RefreshCw, UnlockKeyhole } from 'lucide-react';
import { apiFetch } from '../../services/api';

interface Restriction {
  user_id: number;
  username: string;
  failed_attempts: number;
  remaining_seconds: number;
}

interface RestrictionResponse {
  success: boolean;
  restrictions: Restriction[];
}

interface UnlockResponse {
  success: boolean;
  message: string;
  username: string;
}

function countdown(seconds: number): string {
  const remaining = Math.max(0, seconds);
  const minutes = Math.floor(remaining / 60);
  const secs = remaining % 60;
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/** Admin only: parent route + both API endpoints enforce server-side RBAC. */
export default function ActiveLoginRestrictions({ onUnlocked }: { onUnlocked: () => void }) {
  const [entries, setEntries] = useState<Restriction[]>([]);
  const [fetchedAt, setFetchedAt] = useState(Date.now());
  const [now, setNow] = useState(Date.now());
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [chosen, setChosen] = useState<Restriction | null>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await apiFetch<RestrictionResponse>('get_login_restrictions.php');
        if (!active) return;
        setEntries(data.restrictions);
        setFetchedAt(Date.now());
        setError(null);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Unable to load active restrictions.');
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    const poll = window.setInterval(() => void load(), 15000);
    return () => { active = false; window.clearInterval(poll); };
  }, [revision]);

  const getRemaining = (entry: Restriction) => Math.max(
    0,
    entry.remaining_seconds - Math.max(0, Math.floor((now - fetchedAt) / 1000))
  );

  const unlock = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!chosen || submitting || reason.trim().length < 5 || reason.trim().length > 100) return;
    const username = chosen.username;
    if (!window.confirm(`Lift the username-based restriction for ${username}? The IP-based limit will NOT be reset.`)) return;
    setSubmitting(true);
    setError(null);
    setNotice(null);
    try {
      const result = await apiFetch<UnlockResponse>('unlock_login_restriction.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: chosen.user_id, reason: reason.trim() })
      });
      setNotice(result.message);
      setChosen(null);
      setReason('');
      setRevision(value => value + 1);
      onUnlocked();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to lift restriction.');
      setRevision(value => value + 1);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-white p-5 sm:p-6 rounded-[24px] border border-stone-100 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[#4b5e52] mb-1">
            <LockKeyhole className="h-5 w-5" />
            <h3 className="text-xl font-serif italic text-stone-800">Active Username Restrictions</h3>
          </div>
          <p className="text-xs text-stone-500">
            Only real staff accounts currently restricted by five failed attempts are listed.
            Timers update locally and are checked with the server every 15 seconds.
          </p>
        </div>
        <button type="button" onClick={() => setRevision(value => value + 1)}
          className="inline-flex gap-2 items-center px-4 py-2 rounded-full border border-stone-200 text-xs font-bold text-[#4b5e52]">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <p className="text-xs text-amber-800 bg-amber-50 px-4 py-3 rounded-xl">
        Unlocking a username preserves all security logs and does not clear the separate 20-failure IP limit.
        Verify the staff member's identity before releasing access.
      </p>

      {notice && <p role="status" className="text-sm text-green-800 bg-green-50 p-3 rounded-xl">{notice}</p>}
      {error && <p role="alert" className="text-sm text-red-700 bg-red-50 p-3 rounded-xl flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
      </p>}
      {loading ? (
        <p className="text-stone-500 text-sm">Checking active restrictions…</p>
      ) : entries.length === 0 ? (
        <p className="bg-stone-50 p-4 rounded-xl text-sm text-stone-500">No staff usernames currently restricted.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[570px] text-sm text-left">
            <thead className="bg-stone-50 text-stone-500">
              <tr>
                <th className="p-3">Username</th>
                <th className="p-3">Failures counted</th>
                <th className="p-3">Remaining</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {entries.map(entry => (
                <tr key={entry.user_id}>
                  <td className="p-3 font-semibold text-stone-800 break-all">{entry.username}</td>
                  <td className="p-3 text-stone-600">{entry.failed_attempts}</td>
                  <td className="p-3 font-mono text-amber-800">{countdown(getRemaining(entry))}</td>
                  <td className="p-3">
                    <button type="button" disabled={submitting || getRemaining(entry) === 0}
                      onClick={() => { setChosen(entry); setReason(''); setError(null); }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#4b5e52] text-white rounded-xl text-xs font-bold disabled:opacity-50">
                      <UnlockKeyhole className="w-4 h-4" /> Unlock early
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {chosen && (
        <form onSubmit={unlock} className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3">
          <p className="font-semibold text-sm text-stone-800">Unlock {chosen.username}</p>
          <p className="text-xs text-stone-600">Provide a reason for the audit log (5–100 characters). The account password is still required to sign in.</p>
          <label className="block text-sm font-medium text-stone-600">
            Reason
            <input type="text" value={reason} onChange={e => setReason(e.target.value)}
              maxLength={100} minLength={5} required autoComplete="off"
              placeholder="e.g., Owner verified, urgent story publication"
              className="block w-full mt-2 p-3 bg-white rounded-xl border border-stone-200" />
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={submitting || reason.trim().length < 5}
              className="px-4 py-2 rounded-xl text-white text-sm bg-[#4b5e52] disabled:opacity-50">
              {submitting ? 'Unlocking…' : 'Confirm unlock'}
            </button>
            <button type="button" disabled={submitting}
              onClick={() => { setChosen(null); setReason(''); }}
              className="px-4 py-2 rounded-xl border text-sm border-stone-200 text-stone-700">Cancel</button>
          </div>
        </form>
      )}
    </section>
  );
}

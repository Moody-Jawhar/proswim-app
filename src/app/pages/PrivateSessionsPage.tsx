import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MobileHeader } from '../components/MobileHeader';
import { MobileNav } from '../components/MobileNav';
import { Calendar, Clock, MapPin, User, Loader2, AlertCircle, CheckCircle2, XCircle, Repeat } from 'lucide-react';
import { getPrivateSessions, type PrivateSessionDto } from '../api/pswmApi';
import { PageHero } from '../components/PageHero';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export function PrivateSessionsPage() {
  const { packageId } = useParams<{ packageId: string }>();
  const [sessions, setSessions] = useState<PrivateSessionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const pid = packageId ? parseInt(packageId) : NaN;
    if (!Number.isFinite(pid)) {
      setError('Missing package.');
      setLoading(false);
      return;
    }
    getPrivateSessions(pid)
      .then(setSessions)
      .catch(() => setError('Could not load sessions.'))
      .finally(() => setLoading(false));
  }, [packageId]);

  const attended = sessions.filter(s => s.privateSessionAttended === true).length;
  const absent = sessions.filter(s => s.privateSessionAttended === false).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent pb-nav">
        <MobileHeader title="Sessions" showBack />
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <Loader2 className="size-8 text-[#1e5c97] animate-spin" />
          <p className="text-sm text-slate-500">Loading sessions…</p>
        </div>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pb-nav">
      <MobileHeader title="Private Sessions" showBack />
      <PageHero title="Private Sessions" subtitle="Your 1-on-1 coaching sessions" slide={4} tint="linear-gradient(120deg, rgba(36,44,67,0.78), rgba(79,70,229,0.55))" />
      <div className="px-4 pt-3 pb-4">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl p-4 mb-4">
            <AlertCircle className="size-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {sessions.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-4 grid grid-cols-3 divide-x divide-slate-100">
            <div className="flex flex-col items-center py-4">
              <p className="num-stat text-xl font-extrabold text-violet-600">{sessions.length}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Total</p>
            </div>
            <div className="flex flex-col items-center py-4">
              <p className="num-stat text-xl font-extrabold text-emerald-600">{attended}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Attended</p>
            </div>
            <div className="flex flex-col items-center py-4">
              <p className="num-stat text-xl font-extrabold text-red-500">{absent}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Absent</p>
            </div>
          </div>
        )}

        {sessions.length === 0 && !error && (
          <div className="text-center py-16 text-slate-400 text-sm">No sessions found.</div>
        )}

        <div className="space-y-2">
          {sessions.map((s) => {
            const attended = s.privateSessionAttended === true;
            const absent = s.privateSessionAttended === false;
            const cardStyle = attended
              ? { backgroundColor: '#22c55e', borderColor: '#22c55e' }
              : absent
              ? { backgroundColor: '#ef4444', borderColor: '#ef4444' }
              : { backgroundColor: '#ffffff', borderColor: '#f1f5f9' };
            const w = '#ffffff';
            const ws = 'rgba(255,255,255,0.75)';
            const colored = attended || absent;

            return (
            <div key={s.privateSessionId} className="rounded-2xl border shadow-sm p-4" style={cardStyle}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {s.privateSessionDate && (
                    <div className="flex items-center gap-1.5 text-sm font-medium mb-1.5">
                      <Calendar className="size-3.5 shrink-0" style={{ color: colored ? w : '#7c3aed' }} />
                      <span style={{ color: colored ? w : '#0f172a' }}>{formatDate(s.privateSessionDate)}</span>
                    </div>
                  )}
                  <div className="space-y-1">
                    {s.privateSessionTime && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <Clock className="size-3.5 shrink-0" style={{ color: colored ? ws : '#64748b' }} />
                        <span style={{ color: colored ? ws : '#64748b' }}>{s.privateSessionTime}</span>
                      </div>
                    )}
                    {s.coachFullName && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <User className="size-3.5 shrink-0" style={{ color: colored ? ws : '#64748b' }} />
                        <span style={{ color: colored ? ws : '#64748b' }}>{s.coachFullName}</span>
                      </div>
                    )}
                    {s.locationIcon && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <MapPin className="size-3.5 shrink-0" style={{ color: colored ? ws : '#64748b' }} />
                        <span style={{ color: colored ? ws : '#64748b' }}>{s.locationIcon}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1">
                  {attended && <CheckCircle2 className="size-5" style={{ color: w }} />}
                  {absent && <XCircle className="size-5" style={{ color: w }} />}
                  {s.privateSessionAttended === null && (
                    <div className="size-5 rounded-full border-2 border-slate-200" />
                  )}
                  {s.privateSessionState && s.privateSessionState !== 'Regular' && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: colored ? w : '#6d28d9' }}>
                      {s.privateSessionState}
                    </span>
                  )}
                </div>
              </div>
              {s.privateSessionState === 'Makeup' && (s.privateSessionMkupDate || s.privateSessionMkupTime || s.coachMkup) && (
                <div className="mt-2 pt-2 space-y-1" style={{ borderTop: `1px solid ${colored ? 'rgba(255,255,255,0.3)' : '#f1f5f9'}` }}>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: colored ? w : '#6d28d9' }}>
                    <Repeat className="size-3.5 shrink-0" />
                    <span>Makeup</span>
                  </div>
                  {s.privateSessionMkupDate && (
                    <p className="text-xs pl-5" style={{ color: colored ? ws : '#64748b' }}>
                      {formatDate(s.privateSessionMkupDate)}
                      {s.privateSessionMkupTime ? ` · ${s.privateSessionMkupTime}` : ''}
                    </p>
                  )}
                  {s.coachMkup && (
                    <p className="text-xs pl-5" style={{ color: colored ? ws : '#64748b' }}>Coach: {s.coachMkup}</p>
                  )}
                </div>
              )}
              {s.privateSessionRemarks && (
                <div className="mt-2 pt-2" style={{ borderTop: `1px solid ${colored ? 'rgba(255,255,255,0.3)' : '#f1f5f9'}` }}>
                  <span className="text-xs" style={{ color: colored ? ws : '#94a3b8' }}>{s.privateSessionRemarks}</span>
                </div>
              )}
            </div>
            );
          })}
        </div>
      </div>
      <MobileNav />
    </div>
  );
}

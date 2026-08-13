import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MobileHeader } from '../components/MobileHeader';
import { MobileNav } from '../components/MobileNav';
import { Calendar, Loader2, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import {
  getGroupSessions,
  type SessionDto,
} from '../api/pswmApi';
import { PageHero } from '../components/PageHero';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export function RegistrationSessionsPage() {
  const { semesterId } = useParams<{ semesterId: string }>();
  const [sessions, setSessions] = useState<SessionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const id = semesterId ? parseInt(semesterId) : NaN;
    if (!Number.isFinite(id)) {
      setError('Invalid registration.');
      setLoading(false);
      return;
    }

    // Sessions now carry the student's own attendance (myAttended), so the
    // old second call to /Group/Attendance is gone.
    getGroupSessions(id)
      .then(setSessions)
      .catch(() => setError('Could not load sessions.'))
      .finally(() => setLoading(false));
  }, [semesterId]);

  const attended = sessions.filter(s => s.myAttended === true).length;
  const absent = sessions.filter(s => s.myAttended === false).length;

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
      <MobileHeader title="Sessions & Attendance" showBack />
      <PageHero title="Sessions & Attendance" subtitle="Your class attendance record" slide={1} tint="linear-gradient(120deg, rgba(36,44,67,0.78), rgba(11,100,180,0.55))" />
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
              <p className="num-stat text-xl font-extrabold text-[#1e5c97]">{sessions.length}</p>
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
            const wasAttended = s.myAttended;
            const isAttended = wasAttended === true;
            const isAbsent = wasAttended === false;
            const cardStyle = isAttended
              ? { backgroundColor: '#22c55e', borderColor: '#22c55e' }
              : isAbsent
              ? { backgroundColor: '#ef4444', borderColor: '#ef4444' }
              : { backgroundColor: '#ffffff', borderColor: '#f1f5f9' };
            const white = '#ffffff';
            const whiteSubtle = 'rgba(255,255,255,0.75)';

            return (
              <div key={s.sessionId} className="rounded-2xl border shadow-sm p-4" style={cardStyle}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {s.sessionDate && (
                      <div className="flex items-center gap-1.5 text-sm font-medium mb-1">
                        <Calendar className="size-3.5 shrink-0" style={{ color: (isAttended || isAbsent) ? white : '#1e5c97' }} />
                        <span style={{ color: (isAttended || isAbsent) ? white : '#0f172a' }}>{formatDate(s.sessionDate)}</span>
                      </div>
                    )}
                    {s.className && (
                      <p className="text-xs" style={{ color: (isAttended || isAbsent) ? whiteSubtle : '#64748b' }}>{s.className}</p>
                    )}
                    {s.sessionStatus && (
                      <p className="text-xs mt-0.5" style={{ color: (isAttended || isAbsent) ? whiteSubtle : '#94a3b8' }}>{s.sessionStatus}</p>
                    )}
                  </div>
                  <div className="shrink-0">
                    {isAttended && <CheckCircle2 className="size-5" style={{ color: white }} />}
                    {isAbsent && <XCircle className="size-5" style={{ color: white }} />}
                    {wasAttended == null && (
                      <div className="size-5 rounded-full border-2 border-slate-200" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <MobileNav />
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MobileHeader } from '../components/MobileHeader';
import { MobileNav } from '../components/MobileNav';
import { Calendar, Loader2, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import {
  getGroupSessions,
  getGroupAttendance,
  type SessionDto,
  type AttendanceDto,
} from '../api/pswmApi';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export function RegistrationSessionsPage() {
  const { semesterId } = useParams<{ semesterId: string }>();
  const [sessions, setSessions] = useState<SessionDto[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Map<number, boolean | null>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const id = semesterId ? parseInt(semesterId) : NaN;
    if (!Number.isFinite(id)) {
      setError('Invalid registration.');
      setLoading(false);
      return;
    }

    Promise.allSettled([
      getGroupSessions(id),
      getGroupAttendance(id),
    ]).then(([sessionsRes, attendanceRes]) => {
      if (sessionsRes.status === 'fulfilled') {
        setSessions(sessionsRes.value);
      } else {
        setError('Could not load sessions.');
      }
      if (attendanceRes.status === 'fulfilled') {
        const map = new Map<number, boolean | null>();
        (attendanceRes.value as AttendanceDto[]).forEach(a => {
          map.set(a.attendanceSessionId, a.attendanceStudentAttended);
        });
        setAttendanceMap(map);
      }
    }).finally(() => setLoading(false));
  }, [semesterId]);

  const attended = sessions.filter(s => attendanceMap.get(s.sessionId) === true).length;
  const absent = sessions.filter(s => attendanceMap.get(s.sessionId) === false).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] pb-20">
        <MobileHeader title="Sessions" showBack />
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <Loader2 className="size-8 text-[#0B4F8C] animate-spin" />
          <p className="text-sm text-slate-500">Loading sessions…</p>
        </div>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-20">
      <MobileHeader title="Sessions & Attendance" showBack />
      <div className="px-4 pt-4 pb-4">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl p-4 mb-4">
            <AlertCircle className="size-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {sessions.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-4 grid grid-cols-3 divide-x divide-slate-100">
            <div className="flex flex-col items-center py-4">
              <p className="text-xl font-extrabold text-[#0B4F8C]">{sessions.length}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Total</p>
            </div>
            <div className="flex flex-col items-center py-4">
              <p className="text-xl font-extrabold text-emerald-600">{attended}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Attended</p>
            </div>
            <div className="flex flex-col items-center py-4">
              <p className="text-xl font-extrabold text-red-500">{absent}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Absent</p>
            </div>
          </div>
        )}

        {sessions.length === 0 && !error && (
          <div className="text-center py-16 text-slate-400 text-sm">No sessions found.</div>
        )}

        <div className="space-y-2">
          {sessions.map((s) => {
            const wasAttended = attendanceMap.get(s.sessionId);
            const isAttended = wasAttended === true;
            const isAbsent = wasAttended === false;
            const cardBg = isAttended ? 'bg-emerald-500 border-emerald-500' : isAbsent ? 'bg-red-500 border-red-500' : 'bg-white border-slate-100';
            const textColor = (isAttended || isAbsent) ? 'text-white' : 'text-slate-900';
            const subColor = (isAttended || isAbsent) ? 'text-white/70' : 'text-slate-500';
            const iconColor = (isAttended || isAbsent) ? 'text-white/80' : 'text-[#0B4F8C]';

            return (
              <div key={s.sessionId} className={`rounded-2xl border shadow-sm p-4 ${cardBg}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {s.sessionDate && (
                      <div className={`flex items-center gap-1.5 text-sm font-medium mb-1 ${textColor}`}>
                        <Calendar className={`size-3.5 shrink-0 ${iconColor}`} />
                        <span>{formatDate(s.sessionDate)}</span>
                      </div>
                    )}
                    {s.className && (
                      <p className={`text-xs ${subColor}`}>{s.className}</p>
                    )}
                    {s.sessionStatus && (
                      <p className={`text-xs mt-0.5 ${subColor}`}>{s.sessionStatus}</p>
                    )}
                  </div>
                  <div className="shrink-0">
                    {isAttended && <CheckCircle2 className="size-5 text-white" />}
                    {isAbsent && <XCircle className="size-5 text-white" />}
                    {wasAttended === undefined && (
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

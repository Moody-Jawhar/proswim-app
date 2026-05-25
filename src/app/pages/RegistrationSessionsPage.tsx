import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MobileHeader } from '../components/MobileHeader';
import { MobileNav } from '../components/MobileNav';
import { Calendar, Loader2, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { getGroupAttendance, type AttendanceDto } from '../api/pswmApi';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export function RegistrationSessionsPage() {
  const { semesterId } = useParams<{ semesterId: string }>();
  const [sessions, setSessions] = useState<AttendanceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const id = semesterId ? parseInt(semesterId) : undefined;
    getGroupAttendance(id)
      .then(setSessions)
      .catch(() => setError('Could not load sessions.'))
      .finally(() => setLoading(false));
  }, [semesterId]);

  const attended = sessions.filter(s => s.attendanceStudentAttended === true).length;
  const absent = sessions.filter(s => s.attendanceStudentAttended === false).length;

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
          {sessions.map((s) => (
            <div key={s.attendanceId} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {s.sessionDate && (
                    <div className="flex items-center gap-1.5 text-sm font-medium text-slate-900 mb-1">
                      <Calendar className="size-3.5 text-[#0B4F8C] shrink-0" />
                      <span>{formatDate(s.sessionDate)}</span>
                    </div>
                  )}
                  {s.className && (
                    <p className="text-xs text-slate-500">{s.className}</p>
                  )}
                  {s.attendanceStatus && (
                    <p className="text-xs text-slate-400 mt-0.5">{s.attendanceStatus}</p>
                  )}
                </div>
                <div className="shrink-0">
                  {s.attendanceStudentAttended === true && <CheckCircle2 className="size-5 text-emerald-500" />}
                  {s.attendanceStudentAttended === false && <XCircle className="size-5 text-red-400" />}
                  {s.attendanceStudentAttended === null && (
                    <div className="size-5 rounded-full border-2 border-slate-200" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <MobileNav />
    </div>
  );
}

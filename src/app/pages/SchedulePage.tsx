import { useEffect, useState } from 'react';
import { MobileHeader } from '../components/MobileHeader';
import { MobileNav } from '../components/MobileNav';
import { Calendar, Clock, MapPin, User, Loader2, AlertCircle, Waves } from 'lucide-react';
import {
  getStoredToken,
  getGroupRegistrations,
  getGroupSessions,
  getPrivatePackages,
  getPrivateSessions,
  type SessionDto,
  type PrivateSessionDto,
} from '../api/pswmApi';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Mock schedule for demo accounts
const MOCK_SCHEDULE = [
  {
    id: 'm1',
    type: 'group' as const,
    name: 'Fundamentals – Dolphin',
    days: ['Tue', 'Thu'],
    time: '3:30 PM',
    location: 'Achrafieh Pool',
    coach: 'Coach Lara',
    level: 'Beginner 3',
  },
  {
    id: 'm2',
    type: 'group' as const,
    name: 'Active Start – Seal',
    days: ['Sat'],
    time: '10:00 AM',
    location: 'Achrafieh Pool',
    coach: 'Coach Rami',
    level: 'Beginner 1',
  },
];

function getWeekDays(base: Date): Date[] {
  const start = new Date(base);
  start.setDate(base.getDate() - base.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function formatDate(d: Date) {
  return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export function SchedulePage() {
  const isRealAuth = !!getStoredToken();
  const today = new Date();
  const weekDays = getWeekDays(today);

  const [selectedDay, setSelectedDay] = useState<Date>(today);
  const [groupSessions, setGroupSessions] = useState<SessionDto[]>([]);
  const [privateSessions, setPrivateSessions] = useState<PrivateSessionDto[]>([]);
  const [loading, setLoading] = useState(isRealAuth);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isRealAuth) return;
    (async () => {
      try {
        setLoading(true);

        const [regsRes, pkgsRes] = await Promise.allSettled([
          getGroupRegistrations(),
          getPrivatePackages(),
        ]);
        const regs = regsRes.status === 'fulfilled' ? regsRes.value : [];
        const pkgs = pkgsRes.status === 'fulfilled' ? pkgsRes.value : [];

        const [groupResults, privateResults] = await Promise.all([
          Promise.allSettled(regs.map((r) => getGroupSessions(r.registrationSemesterId))),
          Promise.allSettled(pkgs.map((p) => getPrivateSessions(p.packageId))),
        ]);

        const seenG = new Set<number>();
        const allG = groupResults
          .filter((x): x is PromiseFulfilledResult<SessionDto[]> => x.status === 'fulfilled')
          .flatMap((x) => x.value)
          .filter((s) => (seenG.has(s.sessionId) ? false : (seenG.add(s.sessionId), true)));

        const seenP = new Set<number>();
        const allP = privateResults
          .filter((x): x is PromiseFulfilledResult<PrivateSessionDto[]> => x.status === 'fulfilled')
          .flatMap((x) => x.value)
          .filter((s) => (seenP.has(s.privateSessionId) ? false : (seenP.add(s.privateSessionId), true)));

        setGroupSessions(allG);
        setPrivateSessions(allP);

        if (regsRes.status === 'rejected' && pkgsRes.status === 'rejected') {
          setError('Could not load schedule.');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [isRealAuth]);

  // Sessions for selected day (real auth)
  const dayGroupSessions = groupSessions.filter(s => {
    if (!s.sessionDate) return false;
    return isSameDay(new Date(s.sessionDate), selectedDay);
  });

  const dayPrivateSessions = privateSessions.filter(s => {
    if (!s.privateSessionDate) return false;
    return isSameDay(new Date(s.privateSessionDate), selectedDay);
  });

  // Upcoming sessions (next 14 days) for list view
  const upcoming = [...groupSessions, ...privateSessions]
    .filter(s => {
      const d = 'sessionDate' in s ? s.sessionDate : (s as PrivateSessionDto).privateSessionDate;
      if (!d) return false;
      const date = new Date(d);
      return date >= today;
    })
    .sort((a, b) => {
      const da = 'sessionDate' in a ? a.sessionDate! : (a as PrivateSessionDto).privateSessionDate!;
      const db = 'sessionDate' in b ? b.sessionDate! : (b as PrivateSessionDto).privateSessionDate!;
      return new Date(da).getTime() - new Date(db).getTime();
    })
    .slice(0, 20);

  // Mock: days that have class
  const mockDaysWithClass = (day: Date) =>
    MOCK_SCHEDULE.some(s => s.days.includes(DAYS[day.getDay()]));

  // Mock: classes for selected day
  const mockDayClasses = MOCK_SCHEDULE.filter(s =>
    s.days.includes(DAYS[selectedDay.getDay()])
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white pb-20">
        <MobileHeader title="My Schedule" showBack />
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <Loader2 className="size-8 text-[#0B4F8C] animate-spin" />
          <p className="text-sm text-slate-500">Loading your schedule…</p>
        </div>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-24">
      <MobileHeader title="My Schedule" showBack />

      <div className="px-4 pt-4 pb-4">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl p-4 mb-4">
            <AlertCircle className="size-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Real auth — flat sessions list */}
        {isRealAuth && (
          <>
            {upcoming.length === 0 && !error && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-14 h-14 rounded-2xl bg-[#EBF3FC] flex items-center justify-center">
                  <Waves className="size-7 text-[#0B4F8C]" />
                </div>
                <p className="text-sm font-medium text-slate-500">No upcoming sessions</p>
              </div>
            )}
            <div className="space-y-2">
              {upcoming.map((s, i) => {
                if ('sessionDate' in s && s.sessionId !== undefined) {
                  return <GroupSessionCard key={`g-${s.sessionId}`} session={s as SessionDto} />;
                }
                return <PrivateSessionCard key={`p-${i}`} session={s as PrivateSessionDto} />;
              })}
            </div>
          </>
        )}

        {/* Mock — weekly schedule */}
        {!isRealAuth && (
          <div className="space-y-2">
            {MOCK_SCHEDULE.map(cls => (
              <MockClassCard key={cls.id} cls={cls} showDays />
            ))}
          </div>
        )}
      </div>

      <MobileNav />
    </div>
  );
}

function EmptyDay() {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3">
      <div className="w-14 h-14 rounded-2xl bg-[#EBF3FC] flex items-center justify-center">
        <Waves className="size-7 text-[#0B4F8C]" />
      </div>
      <p className="text-sm font-medium text-slate-500">No classes this day</p>
    </div>
  );
}

function GroupSessionCard({ session, showDate }: { session: SessionDto; showDate?: boolean }) {
  const date = session.sessionDate ? new Date(session.sessionDate) : null;
  const isPast = date ? date < new Date() : false;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#EBF3FC] flex items-center justify-center shrink-0">
          <Waves className="size-5 text-[#0B4F8C]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-slate-900">{session.className || 'Group Class'}</p>
            {session.sessionStatus && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                isPast
                  ? 'bg-slate-100 text-slate-500'
                  : 'bg-[#EBF3FC] text-[#0B4F8C]'
              }`}>
                {session.sessionStatus}
              </span>
            )}
          </div>
          <div className="mt-1.5 space-y-1">
            {showDate && date && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Calendar className="size-3.5 shrink-0" />
                <span>{formatDate(date)}</span>
              </div>
            )}
            {session.sessionDesc && (
              <p className="text-xs text-slate-500">{session.sessionDesc}</p>
            )}
            {session.registered > 0 && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <User className="size-3 shrink-0" />
                <span>{session.attended}/{session.registered} attended</span>
                {session.makeuped && <span className="ml-1">· makeup {session.makeuped}</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PrivateSessionCard({ session, showDate }: { session: PrivateSessionDto; showDate?: boolean }) {
  const date = session.privateSessionDate ? new Date(session.privateSessionDate) : null;
  const isMakeup = session.privateSessionState === 'Makeup';

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
          <User className="size-5 text-violet-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-slate-900">Private Session</p>
            {session.privateSessionState && session.privateSessionState !== 'Regular' && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 bg-violet-100 text-violet-600">
                {session.privateSessionState}
              </span>
            )}
          </div>
          <div className="mt-1.5 space-y-1">
            {showDate && date && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Calendar className="size-3.5 shrink-0" />
                <span>{formatDate(date)}</span>
              </div>
            )}
            {session.privateSessionTime && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Clock className="size-3.5 shrink-0" />
                <span>{session.privateSessionTime}</span>
              </div>
            )}
            {session.coachFullName && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <User className="size-3.5 shrink-0" />
                <span>{session.coachFullName}</span>
              </div>
            )}
            {session.locationIcon && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <MapPin className="size-3.5 shrink-0" />
                <span>{session.locationIcon}</span>
              </div>
            )}
            {isMakeup && (session.privateSessionMkupDate || session.privateSessionMkupTime || session.coachMkup) && (
              <div className="mt-1 pt-1 border-t border-slate-100 text-[11px] text-violet-700">
                Makeup
                {session.privateSessionMkupDate && (
                  <span className="text-slate-500">
                    {' · '}{formatDate(new Date(session.privateSessionMkupDate))}
                    {session.privateSessionMkupTime ? ` ${session.privateSessionMkupTime}` : ''}
                  </span>
                )}
                {session.coachMkup && <span className="text-slate-500"> · {session.coachMkup}</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MockClassCard({
  cls,
  showDays,
}: {
  cls: typeof MOCK_SCHEDULE[number];
  showDays?: boolean;
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#EBF3FC] flex items-center justify-center shrink-0">
          <Waves className="size-5 text-[#0B4F8C]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900">{cls.name}</p>
          <p className="text-xs text-[#0B4F8C] font-medium mt-0.5">{cls.level}</p>
          <div className="mt-1.5 space-y-1">
            {showDays && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Calendar className="size-3.5 shrink-0" />
                <span>{cls.days.join(' & ')}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="size-3.5 shrink-0" />
              <span>{cls.time}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <User className="size-3.5 shrink-0" />
              <span>{cls.coach}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <MapPin className="size-3.5 shrink-0" />
              <span>{cls.location}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

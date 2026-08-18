import { useEffect, useState } from 'react';
import { MobileHeader } from '../components/MobileHeader';
import { MobileNav } from '../components/MobileNav';
import { PageLoader } from '../components/PageLoader';
import { Calendar, Clock, MapPin, User, Loader2, AlertCircle, Waves, BookOpen } from 'lucide-react';
import {
  getStoredToken,
  getGroupRegistrations,
  getGroupSessions,
  getPrivateSessions,
  type RegistrationDto,
  type SessionDto,
  type PrivateSessionDto,
} from '../api/pswmApi';
import { PageHero } from '../components/PageHero';
import { t, monthShort, dayShort } from '../i18n';


function formatDate(d: Date) {
  return `${dayShort(d.getDay())}, ${monthShort(d.getMonth())} ${d.getDate()}`;
}

function dateOnly(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function SchedulePage() {
  const isRealAuth = !!getStoredToken();
  const today = new Date();
  const todayStart = dateOnly(today);

  const [registrations, setRegistrations] = useState<RegistrationDto[]>([]);
  const [groupSessions, setGroupSessions] = useState<SessionDto[]>([]);
  const [privateSessions, setPrivateSessions] = useState<PrivateSessionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isRealAuth) { setLoading(false); return; }
    (async () => {
      try {
        setLoading(true);

        // Local date, not toISOString() — UTC could still be "yesterday".
        const now = new Date();
        const fromDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        // One call each: the API now returns sessions across every semester /
        // package the student is on, filtered server-side to today onward.
        const [regsRes, groupRes, privateRes] = await Promise.allSettled([
          getGroupRegistrations(),
          getGroupSessions(undefined, fromDate),
          getPrivateSessions(undefined, { dateFrom: fromDate }),
        ]);

        setRegistrations(regsRes.status === 'fulfilled' ? regsRes.value : []);
        setGroupSessions(groupRes.status === 'fulfilled' ? groupRes.value : []);
        setPrivateSessions(privateRes.status === 'fulfilled' ? privateRes.value : []);

        if (regsRes.status === 'rejected' && groupRes.status === 'rejected' && privateRes.status === 'rejected') {
          setError(t('sched.loadError'));
        }
      } catch {
        setError(t('sched.loadError'));
      } finally {
        setLoading(false);
      }
    })();
  }, [isRealAuth]);

  // Active registrations (not stopped)
  const activeRegs = registrations.filter(r => !r.registrationStudentStopped);

  // Upcoming sessions — compare date-only to avoid timezone/time-of-day mismatches
  const upcoming = [...groupSessions, ...privateSessions]
    .filter(s => {
      const d = 'sessionDate' in s ? s.sessionDate : (s as PrivateSessionDto).privateSessionDate;
      if (!d) return false;
      return dateOnly(new Date(d)) >= todayStart;
    })
    .sort((a, b) => {
      const da = 'sessionDate' in a ? a.sessionDate! : (a as PrivateSessionDto).privateSessionDate!;
      const db = 'sessionDate' in b ? b.sessionDate! : (b as PrivateSessionDto).privateSessionDate!;
      return new Date(da).getTime() - new Date(db).getTime();
    })
    .slice(0, 30);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent pb-nav">
        <MobileHeader title={t('sched.title')} showBack />
        <PageLoader label={t('sched.loading')} />
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pb-nav">
      <MobileHeader title={t('sched.title')} showBack />
      <PageHero title={t('sched.title')} subtitle={t('sched.subtitle')} slide={1} tint="linear-gradient(120deg, rgba(36,44,67,0.78), rgba(11,100,180,0.55))" />
      <div className="px-4 pt-4 pb-4 space-y-5">

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl p-4">
            <AlertCircle className="size-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* My Classes — from registrations */}
        {activeRegs.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 px-1">{t('sched.myClasses')}</p>
            <div className="space-y-2">
              {activeRegs.map(r => (
                <div key={r.registrationId} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#e8f0f8] flex items-center justify-center shrink-0">
                      <BookOpen className="size-5 text-[#1e5c97]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          {[r.className1, r.className2, r.className3].filter(Boolean).map((cn, i) => (
                            <p key={i} className="text-sm font-semibold text-slate-900 leading-snug">{cn}</p>
                          ))}
                        </div>
                        {r.semesterName && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#e8f0f8] text-[#1e5c97] shrink-0 whitespace-nowrap">
                            {r.semesterName}
                          </span>
                        )}
                      </div>
                      {r.locationNickName && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1.5">
                          <MapPin className="size-3.5 shrink-0" />
                          <span>{r.locationNickName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Sessions */}
        {upcoming.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 px-1">{t('sched.upcoming')}</p>
            <div className="space-y-2">
              {upcoming.map((s, i) => {
                if ('sessionDate' in s && s.sessionId !== undefined) {
                  return <GroupSessionCard key={`g-${s.sessionId}`} session={s as SessionDto} showDate />;
                }
                return <PrivateSessionCard key={`p-${(s as PrivateSessionDto).privateSessionId ?? i}`} session={s as PrivateSessionDto} showDate />;
              })}
            </div>
          </div>
        )}

        {/* Empty state — only when nothing at all */}
        {activeRegs.length === 0 && upcoming.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[#e8f0f8] flex items-center justify-center">
              <Waves className="size-7 text-[#1e5c97]" />
            </div>
            <p className="text-sm font-medium text-slate-500">{t('sched.none')}</p>
            <p className="text-xs text-slate-400 text-center px-8">{t('sched.noneHint')}</p>
          </div>
        )}

      </div>
      <MobileNav />
    </div>
  );
}

function GroupSessionCard({ session, showDate }: { session: SessionDto; showDate?: boolean }) {
  const date = session.sessionDate ? new Date(session.sessionDate) : null;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#e8f0f8] flex items-center justify-center shrink-0">
          <Waves className="size-5 text-[#1e5c97]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-slate-900">{session.className || t('sched.groupClass')}</p>
            {session.sessionStatus && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 bg-[#e8f0f8] text-[#1e5c97]">
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
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Clock className="size-3.5 shrink-0" />
                <span>{session.sessionDesc}</span>
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
  const attended = session.privateSessionAttended === true;
  const absent = session.privateSessionAttended === false;
  const colored = attended || absent;
  const cardStyle = attended
    ? { backgroundColor: '#22c55e', borderColor: '#22c55e' }
    : absent
    ? { backgroundColor: '#ef4444', borderColor: '#ef4444' }
    : { backgroundColor: '#ffffff', borderColor: '#f1f5f9' };
  const w = '#ffffff';
  const ws = 'rgba(255,255,255,0.75)';

  return (
    <div className="border rounded-2xl p-4 shadow-sm" style={cardStyle}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: colored ? 'rgba(255,255,255,0.2)' : '#ede9fe' }}>
          <User className="size-5" style={{ color: colored ? w : '#7c3aed' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: colored ? w : '#0f172a' }}>{t('sched.privateSession')}</p>
          <div className="mt-1.5 space-y-1">
            {showDate && date && (
              <div className="flex items-center gap-1.5 text-xs">
                <Calendar className="size-3.5 shrink-0" style={{ color: colored ? ws : '#64748b' }} />
                <span style={{ color: colored ? ws : '#64748b' }}>{formatDate(date)}</span>
              </div>
            )}
            {session.privateSessionTime && (
              <div className="flex items-center gap-1.5 text-xs">
                <Clock className="size-3.5 shrink-0" style={{ color: colored ? ws : '#64748b' }} />
                <span style={{ color: colored ? ws : '#64748b' }}>{session.privateSessionTime}</span>
              </div>
            )}
            {session.coachFullName && (
              <div className="flex items-center gap-1.5 text-xs">
                <User className="size-3.5 shrink-0" style={{ color: colored ? ws : '#64748b' }} />
                <span style={{ color: colored ? ws : '#64748b' }}>{session.coachFullName}</span>
              </div>
            )}
            {session.locationIcon && (
              <div className="flex items-center gap-1.5 text-xs">
                <MapPin className="size-3.5 shrink-0" style={{ color: colored ? ws : '#64748b' }} />
                <span style={{ color: colored ? ws : '#64748b' }}>{session.locationIcon}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

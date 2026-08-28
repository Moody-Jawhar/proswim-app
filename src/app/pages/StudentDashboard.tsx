import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Loader2, MapPin, Award, CalendarClock, Users, GraduationCap, Wallet,
  Megaphone, CheckCircle2, ChevronRight, MessageCircle, UserCog, Clock,
  Newspaper, User,
} from 'lucide-react';
import { MobileHeader } from '../components/MobileHeader';
import { InsightsCard } from '../components/InsightsCard';
import { MobileNav } from '../components/MobileNav';
import { PageLoader } from '../components/PageLoader';
import { SwimmerSwitcher } from '../components/SwimmerSwitcher';
import { t, dateLocale } from '../i18n';
import {
  getStoredToken, getProfile, getGroupRegistrations, getGroupAttendanceSummary,
  getPrivatePackages, getGroupSessions, getPrivateSessions, getPaymentSummary,
  getNotifications,
  type ProfileDto, type RegistrationDto, type AttendanceSummaryDto,
  type PrivatePackageDto, type SessionDto, type PrivateSessionDto,
  type PaymentSummaryDto, type NotificationDto,
} from '../api/pswmApi';

const SLIDE = (n: number) => `https://www.proswim-lb.com/Gallery/_Website/Main/Slide${n}.jpg`;

const BRAND = '#1e5c97';
const GROUP_C = '#1A6FBF';
const PRIVATE_C = '#6D28D9';

interface NextSession {
  kind: 'Group' | 'Private';
  when: Date;
  time: string;
  label: string;
  location: string;
  /** Where a tap lands: the sessions tab of the registration/package. */
  to: string;
}

const iso = (d: Date) => d.toISOString().slice(0, 10);

function combine(dateStr: string | null, timeStr: string | null): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const m = (timeStr ?? '').match(/^(\d{1,2}):(\d{2})/);
  if (m) d.setHours(Number(m[1]), Number(m[2]), 0, 0);
  else d.setHours(23, 59, 0, 0); // date-only sorts after timed same-day sessions
  return d;
}

function dayLabel(d: Date): string {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const that = new Date(d); that.setHours(0, 0, 0, 0);
  const diff = Math.round((that.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return t('home.today');
  if (diff === 1) return t('home.tomorrow');
  return d.toLocaleDateString(dateLocale(), { weekday: 'long', day: 'numeric', month: 'short' });
}

export function StudentDashboard({ userName }: { userName: string; userEmail?: string }) {
  const navigate = useNavigate();
  const isRealAuth = !!getStoredToken();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileDto | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationDto[]>([]);
  const [attendance, setAttendance] = useState<AttendanceSummaryDto[]>([]);
  const [packages, setPackages] = useState<PrivatePackageDto[]>([]);
  const [groupSessions, setGroupSessions] = useState<SessionDto[]>([]);
  const [privSessions, setPrivSessions] = useState<Record<number, PrivateSessionDto[]>>({});
  const [payments, setPayments] = useState<PaymentSummaryDto | null>(null);
  const [announcement, setAnnouncement] = useState<NotificationDto | null>(null);

  useEffect(() => {
    if (!isRealAuth) { setLoading(false); return; }
    (async () => {
      const today = new Date();
      const ahead = new Date(); ahead.setDate(ahead.getDate() + 14);
      const [p, regs, att, pkgs, gs, pay, notifs] = await Promise.allSettled([
        getProfile(),
        getGroupRegistrations(),
        getGroupAttendanceSummary(),
        getPrivatePackages(),
        getGroupSessions(undefined, iso(today), iso(ahead)),
        getPaymentSummary(),
        getNotifications(),
      ]);
      if (p.status === 'fulfilled') setProfile(p.value);
      if (regs.status === 'fulfilled') setRegistrations(regs.value);
      if (att.status === 'fulfilled') setAttendance(att.value);
      if (gs.status === 'fulfilled') setGroupSessions(gs.value);
      if (pay.status === 'fulfilled') setPayments(pay.value);

      if (notifs.status === 'fulfilled') {
        const cutoff = Date.now() - 30 * 86400000;
        const important = notifs.value.find((n) =>
          ['urgent', 'announcement', 'schedule', 'competition'].includes((n.type ?? '').toLowerCase())
          && new Date(n.date).getTime() > cutoff);
        setAnnouncement(important ?? null);
      }

      if (pkgs.status === 'fulfilled') {
        setPackages(pkgs.value);
        // Upcoming private sessions per open package (max 2)
        const open = pkgs.value.filter((k) => k.sessionsLeft > 0).slice(0, 2);
        const results = await Promise.allSettled(
          open.map((k) => getPrivateSessions(k.packageId, { dateFrom: iso(today), dateTo: iso(ahead) })),
        );
        const byPackage: Record<number, PrivateSessionDto[]> = {};
        results.forEach((r, i) => {
          if (r.status === 'fulfilled') byPackage[open[i].packageId] = r.value;
        });
        setPrivSessions(byPackage);
      }
      setLoading(false);
    })();
  }, [isRealAuth]);

  const firstName = (profile?.studentFirstName || userName.split(' ')[0]) ?? '';

  // ── Next session across both programs ────────────────────────────────────
  const nextSession: NextSession | null = useMemo(() => {
    const now = new Date();
    const cands: NextSession[] = [];
    for (const s of groupSessions) {
      const status = (s.sessionStatus ?? '').toLowerCase().trim();
      if (status === 'cancelled' || status === 'canceled') continue;
      const when = combine(s.sessionDate, s.classTimeFrom);
      if (!when || when < now) continue;
      cands.push({
        kind: 'Group', when, time: s.classTimeFrom ?? '',
        label: s.className ?? t('home.groupSession'), location: s.locationNickName ?? '',
        to: s.semesterId ? `/registrations/${s.semesterId}/sessions` : '/registrations',
      });
    }
    for (const [pkgId, list] of Object.entries(privSessions)) {
      for (const s of list) {
        const state = (s.privateSessionState ?? '').toLowerCase().trim();
        if (state === 'cancelled' || state === 'canceled') continue;
        const when = combine(s.privateSessionDate, s.privateSessionTime);
        if (!when || when < now) continue;
        cands.push({
          kind: 'Private', when, time: s.privateSessionTime ?? '',
          label: s.coachFullName ? t('home.privateWith', { name: s.coachFullName }) : t('home.privateSession'), location: '',
          to: `/private/${pkgId}/sessions`,
        });
      }
    }
    cands.sort((a, b) => a.when.getTime() - b.when.getTime());
    return cands[0] ?? null;
  }, [groupSessions, privSessions]);

  const totalDue = (payments?.totalGroupDue ?? 0) + (payments?.totalPrivateDue ?? 0);
  const attTotals = attendance.reduce(
    (acc, a) => ({ total: acc.total + a.totalSessions, attended: acc.attended + a.attendedSessions }),
    { total: 0, attended: 0 },
  );
  const attPercent = attTotals.total > 0 ? Math.round((attTotals.attended / attTotals.total) * 100) : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent pb-nav">
        <MobileHeader title={t('home.title')} showBack={false} showSignOut showBell />
        <PageLoader label={t('home.loading')} />
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pb-nav">
      <MobileHeader title={t('home.title')} showBack={false} showSignOut showBell />

      <div className="px-4 pt-4">
        {/* ── Hero: identity, calm and compact ── */}
        <div className="rounded-2xl relative overflow-hidden mb-4" style={{ minHeight: 116 }}>
          <img src={SLIDE(3)} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(120deg, rgba(9,26,48,0.92) 0%, rgba(30,92,151,0.78) 70%, rgba(45,125,196,0.6) 100%)' }} />
          <div className="relative px-5 py-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.55)', letterSpacing: '0.14em' }}>
                  {t('home.welcome')}
                </p>
                <p className="font-display text-2xl mt-0.5" style={{ color: '#fff' }}>{firstName}</p>
              </div>
              {profile?.studentPhotoUrl && (
                <img src={profile.studentPhotoUrl} alt="" className="rounded-full object-cover"
                  style={{ width: 44, height: 44, border: '2px solid rgba(255,255,255,0.5)', flexShrink: 0 }} />
              )}
            </div>
            <div className="mt-2">
              <SwimmerSwitcher />
            </div>
            <div className="flex items-center gap-2 mt-2" style={{ flexWrap: 'wrap' }}>
              {profile?.studentLatestLevelName && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                  style={{ background: 'rgba(255,255,255,0.16)', color: '#BAE6FD' }}>
                  <Award className="size-3" /> {profile.studentLatestLevelName}
                </span>
              )}
              {profile?.locationNickName && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{ background: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.75)' }}>
                  <MapPin className="size-3" /> {profile.locationNickName}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Important announcement ── */}
        {announcement && (
          <div className="rounded-2xl p-4 mb-4 flex items-start gap-3"
            style={(announcement.type ?? '').toLowerCase() === 'urgent'
              ? { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }
              : { background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
            <Megaphone className="size-4 mt-0.5" style={{ color: (announcement.type ?? '').toLowerCase() === 'urgent' ? '#DC2626' : '#B45309', flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <p className="text-xs font-bold uppercase tracking-wide"
                style={{ color: (announcement.type ?? '').toLowerCase() === 'urgent' ? '#DC2626' : '#B45309' }}>
                {(announcement.type ?? '').toLowerCase() === 'urgent' ? t('home.urgent') : t('home.announcement')}
              </p>
              <p className="text-sm mt-0.5 text-slate-900">{announcement.desc}</p>
            </div>
          </div>
        )}

        {/* ── Up next ── */}
        <Section icon={<CalendarClock className="size-4" style={{ color: BRAND }} />} tint="rgba(30,92,151,0.12)" title={t('home.upNext')} />
        <div
          className={`bg-white rounded-2xl border border-slate-100 shadow-soft p-4 mb-5 ${nextSession ? 'active:scale-[0.99] transition-transform cursor-pointer' : ''}`}
          onClick={() => nextSession && navigate(nextSession.to)}
        >
          {nextSession ? (
            <div className="flex items-center gap-4">
              <div className="rounded-xl text-center px-3 py-2" style={{ background: 'rgba(30,92,151,0.07)', minWidth: 64 }}>
                <p className="num-stat text-2xl font-bold" style={{ color: BRAND }}>{nextSession.when.getDate()}</p>
                <p className="text-xs font-bold uppercase" style={{ color: '#64748B' }}>
                  {nextSession.when.toLocaleDateString(undefined, { month: 'short' })}
                </p>
              </div>
              <div className="flex-1" style={{ minWidth: 0 }}>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold rounded-full px-2 py-0.5"
                    style={nextSession.kind === 'Group'
                      ? { background: 'rgba(26,111,191,0.12)', color: GROUP_C }
                      : { background: 'rgba(109,40,217,0.10)', color: PRIVATE_C }}>
                    {nextSession.kind}
                  </span>
                  <span className="text-sm font-bold text-slate-900" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {nextSession.label}
                  </span>
                </div>
                <p className="text-sm mt-1 flex items-center gap-2" style={{ color: '#64748B' }}>
                  <span className="font-semibold" style={{ color: '#0F172A' }}>{dayLabel(nextSession.when)}</span>
                  {nextSession.time && <span className="inline-flex items-center gap-1"><Clock className="size-3" /> {nextSession.time}</span>}
                  {nextSession.location && <span className="inline-flex items-center gap-1"><MapPin className="size-3" /> {nextSession.location}</span>}
                </p>
              </div>
              {nextSession.to && <ChevronRight className="size-5" style={{ color: '#94A3B8', flexShrink: 0 }} />}
            </div>
          ) : (
            <p className="text-sm py-1" style={{ color: '#64748B' }}>{t('home.noUpcoming')}</p>
          )}
        </div>

        {/* ── Smart insights (on-device model) ── */}
        {isRealAuth && <InsightsCard />}

        {/* ── Payments ── */}
        <Section icon={<Wallet className="size-4" style={{ color: totalDue > 0 ? '#DC2626' : '#047857' }} />}
          tint={totalDue > 0 ? 'rgba(239,68,68,0.10)' : 'rgba(16,185,129,0.10)'} title={t('home.payments')} />
        <Link to="/payment-history" className="bg-white rounded-2xl border border-slate-100 shadow-soft p-4 mb-5 block active:scale-[0.99] transition-transform"
          style={{ borderLeft: `4px solid ${totalDue > 0 ? '#DC2626' : '#10B981'}` }}>
          {totalDue > 0 ? (
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold" style={{ color: '#B91C1C' }}>{t('home.outstanding')}</p>
                <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>
                  {(payments!.totalGroupDue > 0 ? ['group'] : []).concat(payments!.totalPrivateDue > 0 ? ['private'] : []).join(' + ')} payments pending, tap for details
                </p>
              </div>
              <p className="num-stat text-2xl font-bold" style={{ color: '#B91C1C', flexShrink: 0 }}>
                {totalDue.toLocaleString()}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="size-5" style={{ color: '#059669', flexShrink: 0 }} />
              <div>
                <p className="text-sm font-bold" style={{ color: '#047857' }}>{t('home.allSettled')}</p>
                <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{t('home.historyHint')}</p>
              </div>
            </div>
          )}
        </Link>

        {/* ── Attendance headline (when not shown per-course above) ── */}
        {attPercent != null && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-4 mb-5">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold" style={{ color: '#64748B' }}>Attendance this season</span>
              <span className="num-stat text-sm font-bold" style={{ color: BRAND }}>{attPercent}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
              <div className="h-full rounded-full" style={{ width: `${attPercent}%`, background: `linear-gradient(90deg, ${BRAND}, #2d7dc4)` }} />
            </div>
          </div>
        )}

        {/* ── Quick actions ── */}
        <Section icon={<UserCog className="size-4" style={{ color: BRAND }} />} tint="rgba(30,92,151,0.12)" title={t('home.quickActions')} />
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => {
              const name = profile ? [profile.studentFirstName, profile.studentLastName].filter(Boolean).join(' ') : userName;
              const text = `Hello ProSwim, I am ${name || 'a ProSwim parent'}. I would like to book a session.`;
              window.open(`https://wa.me/96178949498?text=${encodeURIComponent(text)}`);
            }}
            className="rounded-2xl p-4 text-left active:scale-[0.98] transition-transform"
            style={{ background: 'linear-gradient(135deg, #1e5c97, #2d7dc4)' }}
          >
            <MessageCircle className="size-5 mb-2" style={{ color: 'rgba(255,255,255,0.85)' }} />
            <p className="text-sm font-bold text-white">{t('home.book')}</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>{t('home.bookHint')}</p>
          </button>
          <button
            onClick={() => navigate('/profile/personal')}
            className="bg-white rounded-2xl border border-slate-100 shadow-soft p-4 text-left active:scale-[0.98] transition-transform"
          >
            <UserCog className="size-5 mb-2" style={{ color: BRAND }} />
            <p className="text-sm font-bold text-slate-900">{t('home.requestChange')}</p>
            <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{t('home.requestHint')}</p>
          </button>
        </div>

        {/* Shortcut tiles into the main areas of the app */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Link to="/registrations" className="bg-white rounded-2xl border border-slate-100 shadow-soft p-4 block active:scale-[0.98] transition-transform">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ background: 'rgba(26,111,191,0.12)' }}>
              <Users className="size-5" style={{ color: GROUP_C }} />
            </div>
            <p className="text-sm font-bold text-slate-900">{t('nav.group')}</p>
            <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{t('home.tileGroupHint')}</p>
          </Link>
          <Link to="/private" className="bg-white rounded-2xl border border-slate-100 shadow-soft p-4 block active:scale-[0.98] transition-transform">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ background: 'rgba(109,40,217,0.12)' }}>
              <GraduationCap className="size-5" style={{ color: PRIVATE_C }} />
            </div>
            <p className="text-sm font-bold text-slate-900">{t('nav.private')}</p>
            <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{t('home.tilePrivateHint')}</p>
          </Link>
          <Link to="/news" className="bg-white rounded-2xl border border-slate-100 shadow-soft p-4 block active:scale-[0.98] transition-transform">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ background: 'rgba(234,88,12,0.12)' }}>
              <Newspaper className="size-5" style={{ color: '#EA580C' }} />
            </div>
            <p className="text-sm font-bold text-slate-900">{t('nav.news')}</p>
            <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{t('home.tileNewsHint')}</p>
          </Link>
          <Link to="/profile" className="bg-white rounded-2xl border border-slate-100 shadow-soft p-4 block active:scale-[0.98] transition-transform">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ background: 'rgba(30,92,151,0.12)' }}>
              <User className="size-5" style={{ color: BRAND }} />
            </div>
            <p className="text-sm font-bold text-slate-900">{t('nav.profile')}</p>
            <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{t('home.tileProfileHint')}</p>
          </Link>
          <Link to="/locations" className="col-span-2 bg-white rounded-2xl border border-slate-100 shadow-soft p-4 flex items-center gap-3 active:scale-[0.98] transition-transform">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(11,100,180,0.12)' }}>
              <MapPin className="size-5" style={{ color: '#0B64B4' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900">{t('landing.viewLocations')}</p>
              <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{t('loc.subtitle')}</p>
            </div>
            <ChevronRight className="size-5 shrink-0" style={{ color: '#94A3B8' }} />
          </Link>
        </div>

        {/* Contact us, same WhatsApp line as the booking action */}
        <button
          onClick={() => window.open('https://wa.me/96178949498?text=' + encodeURIComponent('Hello ProSwim, I would like more information.'))}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl mb-4 active:scale-[0.98] transition-transform"
          style={{ backgroundColor: '#25D366' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span className="text-base font-bold" style={{ color: '#ffffff' }}>{t('landing.whatsapp')}</span>
        </button>
      </div>

      <MobileNav />
    </div>
  );
}

// Section header: consistent label treatment separating each area of the page.
function Section({ icon, tint, title }: { icon: React.ReactNode; tint: string; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-2 px-1">
      <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: tint }}>
        {icon}
      </div>
      <p className="font-display text-xs uppercase" style={{ color: '#475569', letterSpacing: '0.12em', fontWeight: 700 }}>
        {title}
      </p>
      <div className="flex-1" style={{ height: 1, background: 'rgba(100,116,139,0.12)' }} />
    </div>
  );
}

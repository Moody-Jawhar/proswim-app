import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MobileHeader } from '../components/MobileHeader';
import { MobileNav } from '../components/MobileNav';
import { PageLoader } from '../components/PageLoader';
import { Calendar, Loader2, AlertCircle, CheckCircle2, XCircle, CalendarX } from 'lucide-react';
import {
  getGroupSessions,
  type SessionDto,
} from '../api/pswmApi';
import { getAbsenceNotices, createAbsenceNotice, type AbsenceNoticeRow } from '../api/pswmApi';
import { PageHero } from '../components/PageHero';
import { t, monthShort, dayShort } from '../i18n';


function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${dayShort(d.getDay())}, ${monthShort(d.getMonth())} ${d.getDate()}`;
}

export function RegistrationSessionsPage() {
  const { semesterId } = useParams<{ semesterId: string }>();
  const [sessions, setSessions] = useState<SessionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notices, setNotices] = useState<AbsenceNoticeRow[]>([]);
  const [formFor, setFormFor] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const loadNotices = () => getAbsenceNotices().then(setNotices).catch(() => {});
  const noticeFor = (sessionId: number) =>
    notices.find((n) => Number(n.SessionId) === sessionId && String(n.Status) !== 'Rejected')
    ?? notices.find((n) => Number(n.SessionId) === sessionId);

  const isFuture = (s: SessionDto) => {
    if (!s.sessionDate) return false;
    const d = new Date(s.sessionDate);
    d.setHours(23, 59, 0, 0);
    return d.getTime() > Date.now();
  };

  async function submitNotice(sessionId: number) {
    if (!window.confirm(t('abs.confirm'))) return;
    setFormError('');
    setSubmitting(true);
    try {
      await createAbsenceNotice({ sessionId, reason: reason.trim() || null });
      setFormFor(null); setReason('');
      loadNotices();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : t('abs.fail'));
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    const id = semesterId ? parseInt(semesterId) : NaN;
    if (!Number.isFinite(id)) {
      setError(t('sess.invalidReg'));
      setLoading(false);
      return;
    }

    // Sessions now carry the student's own attendance (myAttended), so the
    // old second call to /Group/Attendance is gone.
    getGroupSessions(id)
      .then(setSessions)
      .catch(() => setError(t('sess.loadError')))
      .finally(() => setLoading(false));
    loadNotices();
  }, [semesterId]);

  const attended = sessions.filter(s => s.myAttended === true).length;
  const absent = sessions.filter(s => s.myAttended === false).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent pb-nav">
        <MobileHeader title={t('common.sessions')} showBack />
        <PageLoader label={t('sess.loading')} />
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pb-nav">
      <MobileHeader title={t('sess.title')} showBack />
      <PageHero title={t('sess.title')} subtitle={t('sess.subtitle')} slide={1} tint="linear-gradient(120deg, rgba(36,44,67,0.78), rgba(11,100,180,0.55))" />
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
              <p className="text-[10px] text-slate-400 mt-0.5">{t('common.total')}</p>
            </div>
            <div className="flex flex-col items-center py-4">
              <p className="num-stat text-xl font-extrabold text-emerald-600">{attended}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{t('common.attended')}</p>
            </div>
            <div className="flex flex-col items-center py-4">
              <p className="num-stat text-xl font-extrabold text-red-500">{absent}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{t('common.absent')}</p>
            </div>
          </div>
        )}

        {sessions.length === 0 && !error && (
          <div className="text-center py-16 text-slate-400 text-sm">{t('sess.none')}</div>
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

              {(() => {
                const n = noticeFor(s.sessionId);
                const status = n ? String(n.Status) : null;
                return (
                  <>
                    {status && (
                      <div className="mt-2 pt-2 flex items-center gap-1.5"
                        style={{ borderTop: `1px solid ${(isAttended || isAbsent) ? 'rgba(255,255,255,0.3)' : '#f1f5f9'}` }}>
                        <CalendarX className="size-3.5 shrink-0"
                          style={{ color: (isAttended || isAbsent) ? white : status === 'Approved' ? '#059669' : status === 'Rejected' ? '#DC2626' : '#B45309' }} />
                        <span className="text-[11px] font-bold"
                          style={{ color: (isAttended || isAbsent) ? white : status === 'Approved' ? '#059669' : status === 'Rejected' ? '#DC2626' : '#B45309' }}>
                          {status === 'Approved' ? t('abs.approved') : status === 'Rejected' ? t('abs.rejected') : t('abs.pending')}
                          {n && n.ReviewNote ? ` — ${String(n.ReviewNote)}` : ''}
                        </span>
                      </div>
                    )}
                    {!status && isFuture(s) && s.myAttended == null && formFor !== s.sessionId && (
                      <button
                        onClick={() => { setFormFor(s.sessionId); setFormError(''); }}
                        className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold"
                        style={{ background: 'rgba(220,38,38,0.08)', color: '#DC2626' }}
                      >
                        <CalendarX className="size-3.5" />
                        {t('abs.report')}
                      </button>
                    )}
                    {formFor === s.sessionId && (
                      <div className="mt-2 pt-2 space-y-2" style={{ borderTop: '1px solid #f1f5f9' }}>
                        <p className="text-[11px]" style={{ color: '#64748B' }}>{t('abs.note')}</p>
                        {formError && <p className="text-xs" style={{ color: '#DC2626' }}>{formError}</p>}
                        <div>
                          <p className="text-[11px] font-semibold mb-1" style={{ color: '#64748B' }}>{t('abs.reason')}</p>
                          <textarea rows={2} maxLength={2500} value={reason} onChange={(e) => setReason(e.target.value)}
                            placeholder={t('abs.reasonPh')}
                            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm bg-white" />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => submitNotice(s.sessionId)} disabled={submitting}
                            className="flex-1 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-50"
                            style={{ background: '#DC2626' }}>
                            {submitting ? t('abs.submitting') : t('abs.submit')}
                          </button>
                          <button onClick={() => setFormFor(null)} disabled={submitting}
                            className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 disabled:opacity-50"
                            style={{ color: '#64748B' }}>
                            {t('abs.cancel')}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
              </div>
            );
          })}
        </div>
      </div>
      <MobileNav />
    </div>
  );
}

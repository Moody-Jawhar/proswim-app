import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MobileHeader } from '../components/MobileHeader';
import { MobileNav } from '../components/MobileNav';
import { PageLoader } from '../components/PageLoader';
import { Calendar, Clock, MapPin, User, Loader2, AlertCircle, CheckCircle2, XCircle, Repeat, CalendarX, Info, Snowflake } from 'lucide-react';
import { getPrivateSessions, getPrivatePackages, getCancelRequests, createCancelRequest, respondCancelAlt, getFreezeRequests, type PrivateSessionDto, type PrivatePackageDto, type CancelRequestRow } from '../api/pswmApi';
import { PageHero } from '../components/PageHero';
import { t, monthShort, dayShort } from '../i18n';


function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${dayShort(d.getDay())}, ${monthShort(d.getMonth())} ${d.getDate()}`;
}

export function PrivateSessionsPage() {
  const { packageId } = useParams<{ packageId: string }>();
  const [sessions, setSessions] = useState<PrivateSessionDto[]>([]);
  const [pkg, setPkg] = useState<PrivatePackageDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Cancellation requests for THIS package, keyed by session id.
  const [requests, setRequests] = useState<CancelRequestRow[]>([]);
  const [formFor, setFormFor] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const pid = packageId ? parseInt(packageId) : NaN;
  // Currently inside an approved freeze window? Then the sessions are paused
  // and the page is locked behind a notice.
  const [frozen, setFrozen] = useState<{ from: string; to: string } | null>(null);
  const loadRequests = () =>
    getCancelRequests()
      .then((rows) => setRequests(rows.filter((r) => Number(r.PackageId) === pid)))
      .catch(() => {});

  const usedCount = requests.filter((r) => String(r.Status) !== 'Rejected').length;
  const requestFor = (sessionId: number) =>
    requests.find((r) => Number(r.PrivateSessionId) === sessionId && String(r.Status) !== 'Rejected')
    ?? requests.find((r) => Number(r.PrivateSessionId) === sessionId);

  // The DB stores only an attended bit — "upcoming" is any unattended
  // session whose start is still in the future.
  const startOf = (s: PrivateSessionDto): Date | null => {
    if (!s.privateSessionDate) return null;
    const d = new Date(s.privateSessionDate);
    const m = (s.privateSessionTime ?? '').match(/^(\d{1,2}):(\d{2})/);
    if (m) d.setHours(Number(m[1]), Number(m[2]), 0, 0); else d.setHours(23, 59, 0, 0);
    return d;
  };
  const isUpcoming = (s: PrivateSessionDto) => {
    const d = startOf(s);
    return s.privateSessionAttended !== true && d !== null && d.getTime() > Date.now();
  };

  // A change can only be requested >= 24h before the session starts.
  const canRequest = (s: PrivateSessionDto) => {
    if (s.privateSessionAttended === true) return false;
    const d = startOf(s);
    return d !== null && d.getTime() - Date.now() >= 24 * 3600 * 1000;
  };

  async function answerOffer(requestId: number, accept: boolean) {
    setSubmitting(true);
    try {
      await respondCancelAlt(requestId, accept);
      loadRequests();
      // Accepting reschedules the session — refresh the list too.
      if (accept && Number.isFinite(pid)) getPrivateSessions(pid).then(setSessions).catch(() => {});
    } catch {
      setFormError(t('cxl.altFail'));
    } finally {
      setSubmitting(false);
    }
  }

  async function submitRequest(sessionId: number) {
    if (!window.confirm(t('cxl.confirm'))) return;
    setFormError('');
    setSubmitting(true);
    try {
      await createCancelRequest({
        privateSessionId: sessionId,
        reason: reason.trim() || null,
      });
      setFormFor(null); setReason('');
      loadRequests();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : t('cxl.fail'));
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    const pid = packageId ? parseInt(packageId) : NaN;
    if (!Number.isFinite(pid)) {
      setError(t('sess.missingPkg'));
      setLoading(false);
      return;
    }
    getPrivateSessions(pid)
      .then(setSessions)
      .catch(() => setError(t('sess.loadError')))
      .finally(() => setLoading(false));
    getPrivatePackages()
      .then((pkgs) => setPkg(pkgs.find((k) => k.packageId === pid) ?? null))
      .catch(() => {});
    loadRequests();
    getFreezeRequests().then((rows) => {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const f = rows.find((r) =>
        Number(r.PackageId) === pid && String(r.Status) === 'Approved'
        && r.FreezeFrom != null && r.FreezeTo != null
        && new Date(String(r.FreezeFrom)) <= today && new Date(String(r.FreezeTo)) >= today);
      if (f) setFrozen({ from: String(f.FreezeFrom), to: String(f.FreezeTo) });
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packageId]);

  const attended = sessions.filter(s => s.privateSessionAttended === true).length;
  const absent = sessions.filter(s => s.privateSessionAttended !== true && !isUpcoming(s)).length;

  // Package name headlines the page; the hero line carries coach + progress.
  const pageTitle = pkg?.packageName || t('sess.privTitle');
  const heroInfo = [
    pkg?.coachFullName,
    pkg ? t('priv.attendedLeft', { a: pkg.countAttended, l: pkg.sessionsLeft }) : null,
  ].filter(Boolean).join(' · ');

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent pb-nav">
        <MobileHeader title={pageTitle} showBack backTo="/private" />
        <PageLoader label={t('sess.loading')} />
        <MobileNav />
      </div>
    );
  }

  if (frozen) {
    const fmtD = (v: string) => {
      const d = new Date(v);
      return isNaN(d.getTime()) ? v : `${dayShort(d.getDay())}, ${monthShort(d.getMonth())} ${d.getDate()}`;
    };
    return (
      <div className="min-h-screen bg-transparent pb-nav">
        <MobileHeader title={pageTitle} showBack backTo="/private" />
        <div className="px-4 pt-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: 'rgba(56,189,248,0.14)' }}>
              <Snowflake className="size-7" style={{ color: '#0284C7' }} />
            </div>
            <p className="text-base font-bold text-slate-900">{t('frz.blockedTitle')}</p>
            <p className="text-sm mt-1.5" style={{ color: '#64748B', lineHeight: 1.6 }}>
              {t('frz.blockedBody', { from: fmtD(frozen.from), to: fmtD(frozen.to) })}
            </p>
          </div>
        </div>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pb-nav">
      <MobileHeader title={pageTitle} showBack backTo="/private" />
      <PageHero title={pageTitle} subtitle={heroInfo || t('sess.privSubtitle')} slide={4} tint="linear-gradient(120deg, rgba(36,44,67,0.78), rgba(79,70,229,0.55))" />
      <div className="px-4 pt-3 pb-4">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl p-4 mb-4">
            <AlertCircle className="size-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Schedule-change rules + usage */}
        <div className="flex items-start gap-2 bg-white border border-slate-100 rounded-2xl p-3.5 mb-3 shadow-sm">
          <Info className="size-4 shrink-0 mt-0.5" style={{ color: '#6D28D9' }} />
          <div className="text-xs" style={{ color: '#64748B' }}>
            <p>{t('cxl.rules')}</p>
            {usedCount > 0 && (
              <p className="font-bold mt-1" style={{ color: '#6D28D9' }}>{t('cxl.used', { n: usedCount })}</p>
            )}
          </div>
        </div>

        {sessions.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-4 grid grid-cols-3 divide-x divide-slate-100">
            <div className="flex flex-col items-center py-4">
              <p className="num-stat text-xl font-extrabold text-violet-600">{sessions.length}</p>
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
            const attended = s.privateSessionAttended === true;
            const upcoming = isUpcoming(s);
            const absent = s.privateSessionAttended !== true && !upcoming;
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
                  {upcoming && (
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
                    <span>{t('sess.makeup')}</span>
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
              {(() => {
                const req = requestFor(s.privateSessionId);
                const status = req ? String(req.Status) : null;
                return (
                  <>
                    {status && (
                      <div className="mt-2 pt-2"
                        style={{ borderTop: `1px solid ${colored ? 'rgba(255,255,255,0.3)' : '#f1f5f9'}` }}>
                        <div className="flex items-center gap-1.5">
                          <CalendarX className="size-3.5 shrink-0"
                            style={{ color: status === 'Approved' ? '#059669' : status === 'Rejected' ? '#DC2626' : '#B45309' }} />
                          <span className="text-[11px] font-bold"
                            style={{ color: colored ? '#ffffff' : status === 'Approved' ? '#059669' : status === 'Rejected' ? '#DC2626' : '#B45309' }}>
                            {status === 'Approved'
                              ? (String(req?.AltStatus ?? '') === 'Accepted' || String(req?.AltStatus ?? '') === 'AutoAccepted'
                                  ? t('cxl.altAccepted')
                                  : String(req?.AltStatus ?? '') === 'Declined' ? t('cxl.altDeclined') : t('cxl.approved'))
                              : status === 'Rejected' ? t('cxl.rejected') : t('cxl.pending')}
                            {req && req.ReviewNote ? ` — ${String(req.ReviewNote)}` : ''}
                          </span>
                        </div>

                        {/* Staff-offered alternate slot: accept reschedules, decline keeps it cancelled */}
                        {req && String(req.AltStatus ?? '') === 'Offered' && (
                          <div className="mt-2 rounded-xl p-3" style={{ background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.25)' }}>
                            <p className="text-xs font-bold" style={{ color: '#065F46' }}>{t('cxl.altOffer')}</p>
                            <p className="text-sm font-bold mt-0.5" style={{ color: '#065F46' }}>
                              {req.AltDate ? formatDate(String(req.AltDate)) : ''}
                              {req.AltTime ? ` · ${String(req.AltTime)}` : ''}
                            </p>
                            {formError && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{formError}</p>}
                            <div className="flex gap-2 mt-2">
                              <button onClick={() => answerOffer(Number(req.RequestId), true)} disabled={submitting}
                                className="flex-1 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-50"
                                style={{ background: '#059669' }}>
                                {t('cxl.altAccept')}
                              </button>
                              <button onClick={() => answerOffer(Number(req.RequestId), false)} disabled={submitting}
                                className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 disabled:opacity-50"
                                style={{ color: '#64748B', background: '#ffffff' }}>
                                {t('cxl.altDecline')}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {!status && canRequest(s) && usedCount < 2 && formFor !== s.privateSessionId && (
                      <button
                        onClick={() => { setFormFor(s.privateSessionId); setFormError(''); }}
                        className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold"
                        style={{ background: 'rgba(220,38,38,0.08)', color: '#DC2626' }}
                      >
                        <CalendarX className="size-3.5" />
                        {t('cxl.request')}
                      </button>
                    )}
                    {formFor === s.privateSessionId && (
                      <div className="mt-2 pt-2 space-y-2" style={{ borderTop: '1px solid #f1f5f9' }}>
                        {formError && <p className="text-xs" style={{ color: '#DC2626' }}>{formError}</p>}
                        <div>
                          <p className="text-[11px] font-semibold mb-1" style={{ color: '#64748B' }}>{t('cxl.reason')}</p>
                          <textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)}
                            placeholder={t('cxl.reasonPh')}
                            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm bg-white" />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => submitRequest(s.privateSessionId)} disabled={submitting}
                            className="flex-1 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-50"
                            style={{ background: '#DC2626' }}>
                            {submitting ? t('cxl.submitting') : t('cxl.submit')}
                          </button>
                          <button onClick={() => setFormFor(null)} disabled={submitting}
                            className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 disabled:opacity-50"
                            style={{ color: '#64748B' }}>
                            {t('cxl.cancel')}
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

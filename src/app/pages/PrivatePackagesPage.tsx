import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MobileHeader } from '../components/MobileHeader';
import { MobileNav } from '../components/MobileNav';
import { PageLoader } from '../components/PageLoader';
import { Calendar, CreditCard, MapPin, User, Loader2, AlertCircle, Snowflake } from 'lucide-react';
import { getPrivatePackages, formatMoney, getFreezeRequests, createFreezeRequest, type PrivatePackageDto, type FreezeRequestRow } from '../api/pswmApi';
import { PageHero } from '../components/PageHero';
import { t, dateLocale } from '../i18n';

function fmtDay(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString(dateLocale(), { day: 'numeric', month: 'short', year: 'numeric' });
}

export function PrivatePackagesPage() {
  const [packages, setPackages] = useState<PrivatePackageDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [freezes, setFreezes] = useState<FreezeRequestRow[]>([]);
  const [freezeFor, setFreezeFor] = useState<number | null>(null);
  const [frzFrom, setFrzFrom] = useState('');
  const [frzTo, setFrzTo] = useState('');
  const [frzReason, setFrzReason] = useState('');
  const [frzBusy, setFrzBusy] = useState(false);
  const [frzError, setFrzError] = useState('');

  const loadFreezes = () => getFreezeRequests().then(setFreezes).catch(() => {});

  async function submitFreeze(packageId: number) {
    if (!frzFrom || !frzTo) { setFrzError(t('frz.needDates')); return; }
    setFrzError('');
    setFrzBusy(true);
    try {
      await createFreezeRequest({ packageId, freezeFrom: frzFrom, freezeTo: frzTo, reason: frzReason.trim() || null });
      setFreezeFor(null); setFrzFrom(''); setFrzTo(''); setFrzReason('');
      loadFreezes();
    } catch (e) {
      setFrzError(e instanceof Error ? e.message : t('frz.fail'));
    } finally {
      setFrzBusy(false);
    }
  }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getPrivatePackages()
      // Only the 3 most recent packages — older ones just add noise.
      .then((pkgs) => {
        setTotalCount(pkgs.length);
        setPackages(
        [...pkgs]
          .sort((a, b) =>
            new Date(b.packageStartDate ?? 0).getTime() - new Date(a.packageStartDate ?? 0).getTime()
            || b.packageId - a.packageId)
          .slice(0, 3),
        );
      })
      .catch(() => setError(t('priv.loadError')))
      .finally(() => setLoading(false));
    loadFreezes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent pb-nav">
        <MobileHeader title={t('priv.title')} />
        <PageLoader label={t('priv.loading')} />
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pb-nav">
      <MobileHeader title={t('priv.title')} />
      <PageHero title={t('priv.title')} subtitle={t('priv.subtitle')} slide={4} tint="linear-gradient(120deg, rgba(36,44,67,0.78), rgba(79,70,229,0.55))" />
      <div className="px-4 pt-3 pb-4">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl p-4 mb-4">
            <AlertCircle className="size-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {packages.length > 0 && (
          <div className="bg-[#1e5c97] rounded-2xl p-5 mb-4 flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <User className="size-5 text-white" />
            </div>
            <div>
              <p className="num-stat text-3xl font-extrabold text-white leading-none">{totalCount}</p>
              <p className="text-xs font-semibold mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {t('priv.bought')}
              </p>
            </div>
          </div>
        )}

        {packages.length === 0 && !error && (
          <div className="text-center py-16 text-slate-400 text-sm">{t('priv.none')}</div>
        )}

        <div className="space-y-3">
          {packages.map((pkg) => (
              <div key={pkg.packageId} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <div className="flex items-start gap-3 mb-1">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(91,173,255,0.18)' }}>
                    <User className="size-5 text-[#1A6FBF]" />
                  </div>
                  <p className="flex-1 min-w-0 text-sm font-bold text-slate-900">
                    <span className="font-medium text-slate-400">{t('priv.package')}</span>
                    {pkg.packageName}
                  </p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                    pkg.packageStatus === 'Active'
                      ? 'bg-emerald-100 text-emerald-700'
                      : pkg.packageStatus === 'Freeze'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {pkg.packageStatus}
                  </span>
                </div>
                {pkg.packageNamewInfo && (
                  <p className="text-[11px] text-slate-400 mb-2">{pkg.packageNamewInfo}</p>
                )}

                {pkg.coachFullName && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <User className="size-3.5 shrink-0" />
                    <span>{pkg.coachFullName}</span>
                  </div>
                )}
                {pkg.locationNickName && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                    <MapPin className="size-3.5 shrink-0" />
                    <span>{pkg.locationNickName}</span>
                  </div>
                )}

                {(pkg.packageStartDate || pkg.lastSessionDate) && (
                  <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <p className="text-slate-400">{t('priv.starts')}</p>
                      <p className="font-semibold text-slate-700">{fmtDay(pkg.packageStartDate)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400">{t('priv.expires')}</p>
                      <p className="font-semibold" style={{ color: pkg.lastSessionDate && new Date(pkg.lastSessionDate) < new Date() ? '#DC2626' : '#334155' }}>
                        {fmtDay(pkg.lastSessionDate)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <p className="text-slate-400">{t('common.sessions')}</p>
                    <p className="font-semibold text-slate-700">
                      {pkg.packageNumberOfSessions} {t('priv.purchased').toLowerCase()} · {t('priv.attendedLeft', { a: pkg.countAttended, l: pkg.sessionsLeft })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400">{t('priv.due')}</p>
                    <p className={`font-semibold ${pkg.duePayment > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {formatMoney(pkg.duePayment, pkg.packageCurrency)}
                    </p>
                  </div>
                </div>

                {(() => {
                  const reqs = freezes.filter((f) => Number(f.PackageId) === pkg.packageId);
                  const open = reqs.find((f) => String(f.Status) === 'Pending');
                  const fmtD = (v: unknown) => v ? fmtDay(String(v)) : '—';
                  return (
                    <div className="mt-2">
                      {reqs.slice(0, 2).map((f) => {
                        const st = String(f.Status);
                        const color = st === 'Approved' ? '#059669' : st === 'Rejected' ? '#DC2626' : '#B45309';
                        return (
                          <div key={Number(f.RequestId)} className="rounded-xl p-2.5 mt-1.5"
                            style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.25)' }}>
                            <div className="flex items-center gap-1.5">
                              <Snowflake className="size-3.5 shrink-0" style={{ color: '#0284C7' }} />
                              <span className="text-[11px] font-bold" style={{ color }}>
                                {st === 'Approved' ? t('frz.approved') : st === 'Rejected' ? t('frz.rejected') : t('frz.pending')}
                              </span>
                            </div>
                            <p className="text-xs mt-0.5" style={{ color: '#334155' }}>
                              {fmtD(f.FreezeFrom)} → {fmtD(f.FreezeTo)}
                            </p>
                            {f.Reason ? <p className="text-[11px] mt-0.5" style={{ color: '#64748B' }}>{String(f.Reason)}</p> : null}
                            {f.ReviewNote ? <p className="text-[11px] mt-0.5 italic" style={{ color: '#64748B' }}>“{String(f.ReviewNote)}”</p> : null}
                          </div>
                        );
                      })}

                      {!open && freezeFor !== pkg.packageId && pkg.packageStatus === 'Active' && (
                        <button
                          onClick={() => { setFreezeFor(pkg.packageId); setFrzError(''); }}
                          className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold"
                          style={{ background: 'rgba(2,132,199,0.08)', color: '#0284C7' }}
                        >
                          <Snowflake className="size-3.5" />
                          {t('frz.request')}
                        </button>
                      )}

                      {freezeFor === pkg.packageId && (
                        <div className="mt-2 pt-2 space-y-2" style={{ borderTop: '1px solid #f1f5f9' }}>
                          <p className="text-[11px]" style={{ color: '#64748B' }}>{t('frz.note')}</p>
                          {frzError && <p className="text-xs" style={{ color: '#DC2626' }}>{frzError}</p>}
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <p className="text-[11px] font-semibold mb-1" style={{ color: '#64748B' }}>{t('frz.from')}</p>
                              <input type="date" value={frzFrom} onChange={(e) => setFrzFrom(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm bg-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-[11px] font-semibold mb-1" style={{ color: '#64748B' }}>{t('frz.to')}</p>
                              <input type="date" value={frzTo} onChange={(e) => setFrzTo(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm bg-white" />
                            </div>
                          </div>
                          <div>
                            <p className="text-[11px] font-semibold mb-1" style={{ color: '#64748B' }}>{t('frz.reason')}</p>
                            <textarea rows={2} value={frzReason} onChange={(e) => setFrzReason(e.target.value)}
                              placeholder={t('frz.reasonPh')}
                              className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm bg-white" />
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => submitFreeze(pkg.packageId)} disabled={frzBusy}
                              className="flex-1 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-50"
                              style={{ background: '#0284C7' }}>
                              {frzBusy ? t('frz.submitting') : t('frz.submit')}
                            </button>
                            <button onClick={() => setFreezeFor(null)} disabled={frzBusy}
                              className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 disabled:opacity-50"
                              style={{ color: '#64748B' }}>
                              {t('frz.cancel')}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                <div className="flex gap-2 pt-3 border-t border-slate-100 mt-3">
                  <Link
                    to={`/private/${pkg.packageId}/sessions`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg,rgba(91,173,255,0.55) 0%,rgba(59,130,246,0.55) 100%)' }}
                  >
                    <Calendar className="size-4" />
                    {t('common.sessions')}
                  </Link>
                  <Link
                    to={`/private/${pkg.packageId}/payments`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg,rgba(52,211,153,0.55) 0%,rgba(16,185,129,0.55) 100%)' }}
                  >
                    <CreditCard className="size-4" />
                    {t('common.payments')}
                  </Link>
                </div>
              </div>
          ))}
        </div>
      </div>
      <MobileNav />
    </div>
  );
}

import { useEffect, useState } from 'react';
import { MobileHeader } from '../components/MobileHeader';
import { MobileNav } from '../components/MobileNav';
import { PageLoader } from '../components/PageLoader';
import { Loader2, AlertCircle, Waves, User, CalendarClock, Wallet } from 'lucide-react';
import {
  getGroupPayments,
  getGroupRegistrations,
  getPrivatePackages,
  getPrivatePayments,
  formatMoney,
  getPaymentOverview,
  type PaymentOverviewRow,
  type GroupPaymentDto,
  type PrivatePaymentDto,
} from '../api/pswmApi';
import { PageHero } from '../components/PageHero';
import { t, monthShort, dateLocale } from '../i18n';


function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${monthShort(d.getMonth())} ${d.getDate()}, ${d.getFullYear()}`;
}

export function PaymentsHistoryPage() {
  const [groupPayments, setGroupPayments] = useState<GroupPaymentDto[]>([]);
  const [privatePayments, setPrivatePayments] = useState<PrivatePaymentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<PaymentOverviewRow[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getPaymentOverview().then(setOverview).catch(() => {});
    (async () => {
      const [regsRes, pkgsRes] = await Promise.allSettled([
        getGroupRegistrations(),
        getPrivatePackages(),
      ]);

      const regs = regsRes.status === 'fulfilled' ? regsRes.value : [];
      const pkgs = pkgsRes.status === 'fulfilled' ? pkgsRes.value : [];

      const [groupResults, privateResults] = await Promise.all([
        Promise.allSettled(regs.map((r) => getGroupPayments(r.registrationSemesterId))),
        Promise.allSettled(pkgs.map((p) => getPrivatePayments(p.packageId))),
      ]);

      const groupOk = groupResults.filter((x): x is PromiseFulfilledResult<GroupPaymentDto[]> => x.status === 'fulfilled');
      const privateOk = privateResults.filter((x): x is PromiseFulfilledResult<PrivatePaymentDto[]> => x.status === 'fulfilled');

      const groupAll = groupOk.flatMap((x) => x.value);
      const privateAll = privateOk.flatMap((x) => x.value);

      const seenGroup = new Set<number>();
      setGroupPayments(groupAll.filter((p) => (seenGroup.has(p.paymentId) ? false : (seenGroup.add(p.paymentId), true))));

      const seenPrivate = new Set<number>();
      setPrivatePayments(privateAll.filter((p) => (seenPrivate.has(p.privatePaymentId) ? false : (seenPrivate.add(p.privatePaymentId), true))));

      const allGroupFailed = regs.length > 0 && groupOk.length === 0;
      const allPrivateFailed = pkgs.length > 0 && privateOk.length === 0;
      const nothingToLoad = regsRes.status === 'rejected' && pkgsRes.status === 'rejected';

      if (nothingToLoad || (allGroupFailed && allPrivateFailed)) {
        setError(t('payhist.loadError'));
      }

      setLoading(false);
    })();
  }, []);


  if (loading) {
    return (
      <div className="min-h-screen bg-transparent pb-nav">
        <MobileHeader title={t('payhist.title')} showBack />
        <PageLoader label={t('pay.loading')} />
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pb-nav">
      <MobileHeader title={t('payhist.title')} showBack />
      <PageHero title={t('payhist.title')} subtitle={t('payhist.subtitle')} slide={2} tint="linear-gradient(120deg, rgba(36,44,67,0.78), rgba(5,120,90,0.55))" />
      <div className="px-4 pt-3 pb-4 space-y-4">

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl p-4">
            <AlertCircle className="size-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {overview.length > 0 && (
          <div className="mb-5">
            <p className="text-sm font-semibold text-slate-900 mb-2">{t('payov.title')}</p>
            <div className="space-y-2.5">
              {overview.map((o, i) => {
                // Enrollments older than 2 years: listed for the record only —
                // no amounts, no deadline, no payment status.
                if (o.Old === 1 || o.Old === true) {
                  return (
                    <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-3 flex items-center gap-2">
                      <Wallet className="size-4 shrink-0" style={{ color: '#94A3B8' }} />
                      <span className="text-xs font-bold truncate" style={{ color: '#334155' }}>{String(o.Name ?? '')}</span>
                    </div>
                  );
                }
                const status = String(o.Status ?? 'Pending');
                const tone = status === 'Paid'
                  ? { fg: '#047857', bg: 'rgba(5,150,105,0.10)' }
                  : status === 'Overdue'
                  ? { fg: '#B91C1C', bg: 'rgba(220,38,38,0.10)' }
                  : { fg: '#92600A', bg: 'rgba(245,158,11,0.14)' };
                const due = Number(o.Due ?? 0);
                const cur = String(o.Currency ?? '');
                const dd = o.DueDate ? new Date(String(o.DueDate)) : null;
                const active = o.IsActive === 1 || o.IsActive === true;
                return (
                  <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: tone.bg }}>
                      <Wallet className="size-4 shrink-0" style={{ color: tone.fg }} />
                      <span className="text-xs font-bold truncate" style={{ color: '#0f172a' }}>{String(o.Name ?? '')}</span>
                      {active && (
                        <span className="text-[10px] font-bold rounded-full px-2 py-0.5 shrink-0"
                          style={{ background: 'rgba(30,92,151,0.12)', color: '#1e5c97' }}>
                          {t('payov.active')}
                        </span>
                      )}
                      <span className="text-[11px] font-bold uppercase tracking-wide ml-auto shrink-0" style={{ color: tone.fg }}>
                        {status === 'Paid' ? t('payov.statusPaid') : status === 'Overdue' ? t('payov.statusOverdue') : t('payov.statusPending')}
                      </span>
                    </div>
                    <div className="px-4 py-3 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-[11px]" style={{ color: '#94A3B8' }}>{t('payov.due')}</p>
                        <p className="num-stat text-xl font-extrabold" style={{ color: due > 0 ? tone.fg : '#047857' }}>
                          {formatMoney(Math.max(0, due), cur)}
                        </p>
                        <p className="text-[11px] mt-0.5" style={{ color: '#94A3B8' }}>
                          {t('payov.paidOf', { paid: formatMoney(Number(o.Paid ?? 0), cur), total: formatMoney(Number(o.Total ?? 0), cur) })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] flex items-center gap-1 justify-end" style={{ color: '#94A3B8' }}>
                          <CalendarClock className="size-3.5" /> {t('payov.deadline')}
                        </p>
                        <p className="text-sm font-bold" style={{ color: dd && due > 0 && status === 'Overdue' ? '#B91C1C' : '#334155' }}>
                          {dd ? dd.toLocaleDateString(dateLocale(), { day: 'numeric', month: 'short', year: 'numeric' }) : t('payov.noDeadline')}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-sm font-semibold text-slate-900 mt-5 mb-2">{t('payov.prev')}</p>
          </div>
        )}

        {groupPayments.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-slate-900 mb-2">{t('pay.groupTitle')}</p>
            <div className="space-y-2">
              {groupPayments.map((p) => (
                <div key={p.paymentId} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-[#e8f0f8] flex items-center justify-center shrink-0">
                        <Waves className="size-4 text-[#1e5c97]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {p.semesterName || `Receipt #${p.paymentId}`}
                        </p>
                        {p.paymentDate && (
                          <p className="text-xs text-slate-400">{formatDate(p.paymentDate)}</p>
                        )}
                      </div>
                    </div>
                    <p className="text-sm font-bold text-emerald-600">
                      {formatMoney(p.paymentPaidAmount, p.paymentPaidCurrency)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {privatePayments.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-slate-900 mb-2">{t('pay.privTitle')}</p>
            <div className="space-y-2">
              {privatePayments.map((p) => (
                <div key={p.privatePaymentId} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                        <User className="size-4 text-violet-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {p.packageName || `Receipt #${p.privatePaymentId}`}
                        </p>
                        {p.privatePaymentDate && (
                          <p className="text-xs text-slate-400">{formatDate(p.privatePaymentDate)}</p>
                        )}
                      </div>
                    </div>
                    <p className="text-sm font-bold text-emerald-600">
                      {formatMoney(p.privatePaymentPaidAmount, p.privatePaymentPaidCurrency)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {groupPayments.length === 0 && privatePayments.length === 0 && !error && (
          <div className="text-center py-16 text-slate-400 text-sm">{t('payhist.none')}</div>
        )}
      </div>
      <MobileNav />
    </div>
  );
}

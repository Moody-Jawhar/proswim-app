import { useEffect, useState } from 'react';
import { MobileHeader } from '../components/MobileHeader';
import { MobileNav } from '../components/MobileNav';
import { PageLoader } from '../components/PageLoader';
import { Loader2, AlertCircle, Waves, User } from 'lucide-react';
import {
  getGroupPayments,
  getGroupRegistrations,
  getPrivatePackages,
  getPrivatePayments,
  formatMoney,
  type GroupPaymentDto,
  type PrivatePaymentDto,
} from '../api/pswmApi';
import { PageHero } from '../components/PageHero';
import { t, monthShort } from '../i18n';


function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${monthShort(d.getMonth())} ${d.getDate()}, ${d.getFullYear()}`;
}

export function PaymentsHistoryPage() {
  const [groupPayments, setGroupPayments] = useState<GroupPaymentDto[]>([]);
  const [privatePayments, setPrivatePayments] = useState<PrivatePaymentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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

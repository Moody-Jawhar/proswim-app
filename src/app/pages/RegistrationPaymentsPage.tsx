import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MobileHeader } from '../components/MobileHeader';
import { MobileNav } from '../components/MobileNav';
import { PageLoader } from '../components/PageLoader';
import { CreditCard, Loader2, AlertCircle, X, FileText } from 'lucide-react';
import { getGroupPayments, type GroupPaymentDto, getGroupReceipt, type GroupReceiptDto, formatMoney, effectiveCurrency } from '../api/pswmApi';
import { PageHero } from '../components/PageHero';
import { PaperReceipt, type ReceiptLine } from '../components/PaperReceipt';
import { t, monthShort, dayShort, dateLocale } from '../i18n';


function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${monthShort(d.getMonth())} ${d.getDate()}, ${d.getFullYear()}`;
}

export function RegistrationPaymentsPage() {
  const { semesterId } = useParams<{ semesterId: string }>();
  const [payments, setPayments] = useState<GroupPaymentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState<{ data: GroupReceiptDto | null; loading: boolean; paymentId: number | null }>({ data: null, loading: false, paymentId: null });

  useEffect(() => {
    const sid = semesterId ? parseInt(semesterId) : NaN;
    if (!Number.isFinite(sid)) {
      setError(t('pay.missingSem'));
      setLoading(false);
      return;
    }
    getGroupPayments(sid)
      .then(setPayments)
      .catch(() => setError(t('pay.loadError')))
      .finally(() => setLoading(false));
  }, [semesterId]);

  const openReceipt = async (paymentId: number) => {
    setReceipt({ data: null, loading: true, paymentId });
    try {
      const data = await getGroupReceipt(paymentId);
      setReceipt({ data, loading: false, paymentId });
    } catch {
      setReceipt({ data: null, loading: false, paymentId: null });
    }
  };

  // Payments can be in different currencies, total per currency, never mix.
  const totalsByCurrency = payments.reduce<Record<string, number>>((acc, p) => {
    const cur = effectiveCurrency(p.paymentPaidAmount, p.paymentPaidCurrency);
    acc[cur] = (acc[cur] || 0) + p.paymentPaidAmount;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent pb-nav">
        <MobileHeader title={t('common.payments')} showBack backTo="/registrations" />
        <PageLoader label={t('pay.loading')} />
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pb-nav">
      <MobileHeader title={t('pay.groupTitle')} showBack backTo="/registrations" />
      <PageHero title={t('pay.groupTitle')} subtitle={t('pay.groupSubtitle')} slide={2} tint="linear-gradient(120deg, rgba(36,44,67,0.78), rgba(11,100,180,0.55))" />
      <div className="px-4 pt-3 pb-4">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl p-4 mb-4">
            <AlertCircle className="size-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {payments.length > 0 && (
          <div className="bg-[#1e5c97] rounded-2xl p-5 mb-4">
            <p className="text-xs font-semibold mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>{t('pay.totalPaid')}</p>
            {Object.entries(totalsByCurrency).map(([cur, amount]) => (
              <p key={cur} className="num-stat text-3xl font-extrabold" style={{ color: '#ffffff' }}>
                {amount.toLocaleString()} {cur}
              </p>
            ))}
          </div>
        )}

        {payments.length === 0 && !error && (
          <div className="text-center py-16 text-slate-400 text-sm">{t('pay.none')}</div>
        )}

        <div className="space-y-2">
          {payments.map((p) => (
            <div key={p.paymentId} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#e8f0f8] flex items-center justify-center shrink-0">
                    <CreditCard className="size-4 text-[#1e5c97]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Receipt #{p.paymentId}</p>
                    {p.paymentDate && <p className="text-xs text-slate-400">{formatDate(p.paymentDate)}</p>}
                  </div>
                </div>
                <p className="text-sm font-bold text-emerald-600">
                  {formatMoney(p.paymentPaidAmount, p.paymentPaidCurrency)}
                </p>
              </div>
              {p.semesterName && (
                <p className="text-xs text-slate-400">{p.semesterName}</p>
              )}
              <div className="flex justify-end mt-2 pt-2 border-t border-slate-50">
                <button
                  onClick={() => openReceipt(p.paymentId)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#1e5c97] active:opacity-60"
                >
                  <FileText className="size-3.5" />
                  View Receipt
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {receipt.paymentId !== null && (
        <div className="fixed inset-0 flex items-end" style={{ backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 100 }} onClick={() => setReceipt({ data: null, loading: false, paymentId: null })}>
          <div className="bg-white w-full rounded-t-3xl p-6 space-y-4" style={{ maxHeight: '86vh', overflowY: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <p className="text-base font-bold text-slate-900">Receipt #{receipt.paymentId}</p>
              <button onClick={() => setReceipt({ data: null, loading: false, paymentId: null })}>
                <X className="size-5 text-slate-400" />
              </button>
            </div>
            {receipt.loading && (
              <div className="flex justify-center py-8">
                <Loader2 className="size-6 text-[#1e5c97] animate-spin" />
              </div>
            )}
            {!receipt.loading && receipt.data && (() => {
              const d = receipt.data;
              const balance = d.paymentTotalAmount - d.paymentPaidAmount;
              const lines: ReceiptLine[] = [];
              if (d.studentName) lines.push({ label: t('common.student'), value: d.studentName });
              if (d.semesterName) lines.push({ label: t('pay.semester'), value: d.semesterName });
              if (d.paymentDate) lines.push({ label: t('pay.paymentDate'), value: new Date(d.paymentDate).toLocaleDateString(dateLocale(), { year: 'numeric', month: 'long', day: 'numeric' }) });
              lines.push({ label: t('pay.totalAmount'), value: formatMoney(d.paymentTotalAmount, d.paymentPaidCurrency) });
              lines.push({ label: t('pay.amountPaid'), value: formatMoney(d.paymentPaidAmount, d.paymentPaidCurrency), strong: true, tone: 'paid' });
              lines.push({ label: t('pay.balanceDue'), value: balance <= 0 ? t('pay.paidInFull') : formatMoney(balance, d.paymentPaidCurrency), tone: balance <= 0 ? 'paid' : 'due' });
              if (d.paymentNotes) lines.push({ label: t('common.notes'), value: d.paymentNotes });
              return <PaperReceipt serial={`#${receipt.paymentId}`} lines={lines} />;
            })()}
            {!receipt.loading && !receipt.data && (
              <p className="text-sm text-slate-400 text-center py-4">{t('pay.receiptNA')}</p>
            )}
          </div>
        </div>
      )}
      <MobileNav />
    </div>
  );
}

function ReceiptRow({ label, value, highlight, status }: { label: string; value: string; highlight?: boolean; status?: 'paid' | 'due' }) {
  const valueColor = highlight ? 'text-emerald-600' : status === 'paid' ? 'text-emerald-600' : status === 'due' ? 'text-red-500' : 'text-slate-900';
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-100 last:border-b-0">
      <span className="text-sm text-slate-400">{label}</span>
      <span className={`text-sm font-semibold ${valueColor}`}>{value}</span>
    </div>
  );
}

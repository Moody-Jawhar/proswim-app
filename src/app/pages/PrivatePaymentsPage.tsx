import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MobileHeader } from '../components/MobileHeader';
import { MobileNav } from '../components/MobileNav';
import { CreditCard, User, Loader2, AlertCircle, X, FileText } from 'lucide-react';
import { getPrivatePayments, type PrivatePaymentDto, getPrivateReceipt, type PrivateReceiptDto, formatMoney, effectiveCurrency } from '../api/pswmApi';
import { PageHero } from '../components/PageHero';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function PrivatePaymentsPage() {
  const { packageId } = useParams<{ packageId: string }>();
  const [payments, setPayments] = useState<PrivatePaymentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState<{ data: PrivateReceiptDto | null; loading: boolean; paymentId: number | null }>({ data: null, loading: false, paymentId: null });

  useEffect(() => {
    const pid = packageId ? parseInt(packageId) : NaN;
    if (!Number.isFinite(pid)) {
      setError('Missing package.');
      setLoading(false);
      return;
    }
    getPrivatePayments(pid)
      .then(setPayments)
      .catch(() => setError('Could not load payments.'))
      .finally(() => setLoading(false));
  }, [packageId]);

  const openReceipt = async (paymentId: number) => {
    setReceipt({ data: null, loading: true, paymentId });
    try {
      const data = await getPrivateReceipt(paymentId);
      setReceipt({ data, loading: false, paymentId });
    } catch {
      setReceipt({ data: null, loading: false, paymentId: null });
    }
  };

  // Payments can be in different currencies — total per currency, never mix.
  const totalsByCurrency = payments.reduce<Record<string, number>>((acc, p) => {
    const cur = effectiveCurrency(p.privatePaymentPaidAmount, p.privatePaymentPaidCurrency);
    acc[cur] = (acc[cur] || 0) + p.privatePaymentPaidAmount;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent pb-nav">
        <MobileHeader title="Payments" showBack />
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <Loader2 className="size-8 text-[#1e5c97] animate-spin" />
          <p className="text-sm text-slate-500">Loading payments…</p>
        </div>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pb-nav">
      <MobileHeader title="Private Payments" showBack />
      <PageHero title="Private Payments" subtitle="Private coaching payment history" slide={4} tint="linear-gradient(120deg, rgba(36,44,67,0.78), rgba(79,70,229,0.55))" />
      <div className="px-4 pt-3 pb-4">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl p-4 mb-4">
            <AlertCircle className="size-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {payments.length > 0 && (
          <div className="bg-violet-600 rounded-2xl p-5 mb-4">
            <p className="text-xs font-semibold mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>Total Paid</p>
            {Object.entries(totalsByCurrency).map(([cur, amount]) => (
              <p key={cur} className="num-stat text-3xl font-extrabold" style={{ color: '#ffffff' }}>
                {amount.toLocaleString()} {cur}
              </p>
            ))}
          </div>
        )}

        {payments.length === 0 && !error && (
          <div className="text-center py-16 text-slate-400 text-sm">No payments found.</div>
        )}

        <div className="space-y-2">
          {payments.map((p) => (
            <div key={p.privatePaymentId} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-start justify-between gap-2 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                    <CreditCard className="size-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-slate-900">Receipt #{p.privatePaymentId}</p>
                    {p.privatePaymentDate && (
                      <p className="text-sm text-slate-400 mt-0.5">{formatDate(p.privatePaymentDate)}</p>
                    )}
                  </div>
                </div>
                <p className="text-base font-bold text-emerald-600">
                  {formatMoney(p.privatePaymentPaidAmount, p.privatePaymentPaidCurrency)}
                </p>
              </div>
              {p.coachFullName && (
                <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-3">
                  <User className="size-4 shrink-0" />
                  <span>{p.coachFullName}</span>
                </div>
              )}
              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  onClick={() => openReceipt(p.privatePaymentId)}
                  className="flex items-center gap-2 text-sm font-semibold text-violet-600 active:opacity-60"
                >
                  <FileText className="size-4" />
                  View Receipt
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {receipt.paymentId !== null && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setReceipt({ data: null, loading: false, paymentId: null })}>
          <div className="bg-white w-full rounded-t-3xl p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <p className="text-base font-bold text-slate-900">Receipt #{receipt.paymentId}</p>
              <button onClick={() => setReceipt({ data: null, loading: false, paymentId: null })}>
                <X className="size-5 text-slate-400" />
              </button>
            </div>
            {receipt.loading && (
              <div className="flex justify-center py-8">
                <Loader2 className="size-6 text-violet-600 animate-spin" />
              </div>
            )}
            {!receipt.loading && receipt.data && (() => {
              const d = receipt.data;
              const balance = d.privatePaymentTotalAmount - d.privatePaymentPaidAmount;
              return (
                <div className="space-y-0">
                  {d.studentName && <ReceiptRow label="Student" value={d.studentName} />}
                  {d.packageName && <ReceiptRow label="Package" value={d.packageName} />}
                  {d.coachFullName && <ReceiptRow label="Coach" value={d.coachFullName} />}
                  {d.privatePaymentDate && <ReceiptRow label="Payment Date" value={new Date(d.privatePaymentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />}
                  <ReceiptRow label="Total Amount" value={formatMoney(d.privatePaymentTotalAmount, d.privatePaymentPaidCurrency)} />
                  <ReceiptRow label="Amount Paid" value={formatMoney(d.privatePaymentPaidAmount, d.privatePaymentPaidCurrency)} highlight />
                  <ReceiptRow
                    label="Balance Due"
                    value={balance <= 0 ? 'Paid in Full' : formatMoney(balance, d.privatePaymentPaidCurrency)}
                    status={balance <= 0 ? 'paid' : 'due'}
                  />
                  {d.privatePaymentNotes && <ReceiptRow label="Notes" value={d.privatePaymentNotes} />}
                </div>
              );
            })()}
            {!receipt.loading && !receipt.data && (
              <p className="text-sm text-slate-400 text-center py-4">Receipt not available</p>
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

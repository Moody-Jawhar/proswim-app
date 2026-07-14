import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MobileHeader } from '../components/MobileHeader';
import { MobileNav } from '../components/MobileNav';
import { CreditCard, Loader2, AlertCircle, X, FileText } from 'lucide-react';
import { getGroupPayments, type GroupPaymentDto, getGroupReceipt, type GroupReceiptDto } from '../api/pswmApi';
import { PageHero } from '../components/PageHero';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
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
      setError('Missing semester.');
      setLoading(false);
      return;
    }
    getGroupPayments(sid)
      .then(setPayments)
      .catch(() => setError('Could not load payments.'))
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

  const totalPaid = payments.reduce((s, p) => s + p.paymentPaidAmount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] pb-20">
        <MobileHeader title="Payments" showBack />
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <Loader2 className="size-8 text-[#0B4F8C] animate-spin" />
          <p className="text-sm text-slate-500">Loading payments…</p>
        </div>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-20">
      <MobileHeader title="Group Payments" showBack />
      <PageHero title="Group Payments" subtitle="Registration payment history" slide={2} tint="rgba(11,100,180,0.58)" />
      <div className="px-4 pt-3 pb-4">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl p-4 mb-4">
            <AlertCircle className="size-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {payments.length > 0 && (
          <div className="bg-[#0B4F8C] rounded-2xl p-5 mb-4">
            <p className="text-xs font-semibold mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>Total Paid</p>
            <p className="num-stat text-3xl font-extrabold" style={{ color: '#ffffff' }}>
              {totalPaid.toLocaleString()} {payments[0]?.paymentPaidCurrency}
            </p>
          </div>
        )}

        {payments.length === 0 && !error && (
          <div className="text-center py-16 text-slate-400 text-sm">No payments found.</div>
        )}

        <div className="space-y-2">
          {payments.map((p) => (
            <div key={p.paymentId} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#EBF3FC] flex items-center justify-center shrink-0">
                    <CreditCard className="size-4 text-[#0B4F8C]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Receipt #{p.paymentId}</p>
                    {p.paymentDate && <p className="text-xs text-slate-400">{formatDate(p.paymentDate)}</p>}
                  </div>
                </div>
                <p className="text-sm font-bold text-emerald-600">
                  {p.paymentPaidAmount.toLocaleString()} {p.paymentPaidCurrency}
                </p>
              </div>
              {p.semesterName && (
                <p className="text-xs text-slate-400">{p.semesterName}</p>
              )}
              <div className="flex justify-end mt-2 pt-2 border-t border-slate-50">
                <button
                  onClick={() => openReceipt(p.paymentId)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#0B4F8C] active:opacity-60"
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
                <Loader2 className="size-6 text-[#0B4F8C] animate-spin" />
              </div>
            )}
            {!receipt.loading && receipt.data && (() => {
              const d = receipt.data;
              const cur = d.paymentPaidCurrency || '';
              const balance = d.paymentTotalAmount - d.paymentPaidAmount;
              return (
                <div className="space-y-0">
                  {d.studentName && <ReceiptRow label="Student" value={d.studentName} />}
                  {d.semesterName && <ReceiptRow label="Semester" value={d.semesterName} />}
                  {d.paymentDate && <ReceiptRow label="Payment Date" value={new Date(d.paymentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />}
                  <ReceiptRow label="Total Amount" value={`${d.paymentTotalAmount.toLocaleString()} ${cur}`} />
                  <ReceiptRow label="Amount Paid" value={`${d.paymentPaidAmount.toLocaleString()} ${cur}`} highlight />
                  <ReceiptRow
                    label="Balance Due"
                    value={balance <= 0 ? 'Paid in Full' : `${balance.toLocaleString()} ${cur}`}
                    status={balance <= 0 ? 'paid' : 'due'}
                  />
                  {d.paymentNotes && <ReceiptRow label="Notes" value={d.paymentNotes} />}
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

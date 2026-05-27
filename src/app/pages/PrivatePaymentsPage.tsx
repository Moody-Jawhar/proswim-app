import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MobileHeader } from '../components/MobileHeader';
import { MobileNav } from '../components/MobileNav';
import { CreditCard, User, Loader2, AlertCircle } from 'lucide-react';
import { getPrivatePayments, type PrivatePaymentDto } from '../api/pswmApi';

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

  const totalPaid = payments.reduce((s, p) => s + p.privatePaymentPaidAmount, 0);
  const totalAmount = payments.reduce((s, p) => s + p.privatePaymentTotalAmount, 0);

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
      <MobileHeader title="Private Payments" showBack />
      <div className="px-4 pt-4 pb-4">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl p-4 mb-4">
            <AlertCircle className="size-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {payments.length > 0 && (
          <div className="bg-violet-600 rounded-2xl p-5 mb-4">
            <p className="text-xs font-semibold mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>Payment Summary</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-2xl font-extrabold" style={{ color: '#ffffff' }}>{totalPaid.toLocaleString()}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>Total paid</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold" style={{ color: totalAmount - totalPaid > 0 ? '#FCD34D' : '#ffffff' }}>
                  {(totalAmount - totalPaid).toLocaleString()}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>Balance due</p>
              </div>
            </div>
          </div>
        )}

        {payments.length === 0 && !error && (
          <div className="text-center py-16 text-slate-400 text-sm">No payments found.</div>
        )}

        <div className="space-y-2">
          {payments.map((p) => (
            <div key={p.privatePaymentId} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                    <CreditCard className="size-4 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Receipt #{p.privatePaymentId}</p>
                    {p.privatePaymentDate && (
                      <p className="text-xs text-slate-400">{formatDate(p.privatePaymentDate)}</p>
                    )}
                  </div>
                </div>
                <p className="text-sm font-bold text-emerald-600">
                  {p.privatePaymentPaidAmount.toLocaleString()} {p.privatePaymentPaidCurrency}
                </p>
              </div>
              {p.coachFullName && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
                  <User className="size-3.5 shrink-0" />
                  <span>{p.coachFullName}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
                <span>Total amount</span>
                <span className="font-medium text-slate-700">
                  {p.privatePaymentTotalAmount.toLocaleString()} {p.privatePaymentPaidCurrency}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <MobileNav />
    </div>
  );
}

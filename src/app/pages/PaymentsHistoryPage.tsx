import { useEffect, useState } from 'react';
import { MobileHeader } from '../components/MobileHeader';
import { MobileNav } from '../components/MobileNav';
import { Loader2, AlertCircle, Waves, User } from 'lucide-react';
import {
  getGroupPayments,
  getPrivatePayments,
  type GroupPaymentDto,
  type PrivatePaymentDto,
} from '../api/pswmApi';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function PaymentsHistoryPage() {
  const [groupPayments, setGroupPayments] = useState<GroupPaymentDto[]>([]);
  const [privatePayments, setPrivatePayments] = useState<PrivatePaymentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const [groupRes, privateRes] = await Promise.allSettled([
        getGroupPayments(),
        getPrivatePayments(),
      ]);
      if (groupRes.status === 'fulfilled') setGroupPayments(groupRes.value);
      if (privateRes.status === 'fulfilled') setPrivatePayments(privateRes.value);
      if (groupRes.status === 'rejected' && privateRes.status === 'rejected') {
        setError('Could not load payment history.');
      }
      setLoading(false);
    })();
  }, []);

  const totalGroupPaid = groupPayments.reduce((s, p) => s + p.paymentPaidAmount, 0);
  const totalGroupDue = groupPayments.reduce((s, p) => s + (p.paymentTotalAmount - p.paymentPaidAmount), 0);
  const totalPrivatePaid = privatePayments.reduce((s, p) => s + p.privatePaymentPaidAmount, 0);
  const totalPrivateDue = privatePayments.reduce((s, p) => s + (p.privatePaymentTotalAmount - p.privatePaymentPaidAmount), 0);
  const hasAny = groupPayments.length > 0 || privatePayments.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] pb-20">
        <MobileHeader title="Payment History" showBack />
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
      <MobileHeader title="Payment History" showBack />
      <div className="px-4 pt-4 pb-4 space-y-4">

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl p-4">
            <AlertCircle className="size-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {hasAny && (
          <div className="bg-[#0B4F8C] rounded-2xl p-5">
            <p className="text-xs font-semibold mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>Overall Summary</p>
            <div className="grid grid-cols-2 gap-3">
              {groupPayments.length > 0 && (
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-[10px] font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Group Paid</p>
                  <p className="text-lg font-extrabold" style={{ color: '#ffffff' }}>
                    {totalGroupPaid.toLocaleString()}
                  </p>
                  {totalGroupDue > 0 && (
                    <p className="text-[10px] mt-0.5" style={{ color: '#FCD34D' }}>
                      {totalGroupDue.toLocaleString()} due
                    </p>
                  )}
                </div>
              )}
              {privatePayments.length > 0 && (
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-[10px] font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Private Paid</p>
                  <p className="text-lg font-extrabold" style={{ color: '#ffffff' }}>
                    {totalPrivatePaid.toLocaleString()}
                  </p>
                  {totalPrivateDue > 0 && (
                    <p className="text-[10px] mt-0.5" style={{ color: '#FCD34D' }}>
                      {totalPrivateDue.toLocaleString()} due
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {groupPayments.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-slate-900 mb-2">Group Payments</p>
            <div className="space-y-2">
              {groupPayments.map((p) => (
                <div key={p.paymentId} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-[#EBF3FC] flex items-center justify-center shrink-0">
                        <Waves className="size-4 text-[#0B4F8C]" />
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
                      {p.paymentPaidAmount.toLocaleString()} {p.paymentPaidCurrency}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {privatePayments.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-slate-900 mb-2">Private Payments</p>
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
                      {p.privatePaymentPaidAmount.toLocaleString()} {p.privatePaymentPaidCurrency}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!hasAny && !error && (
          <div className="text-center py-16 text-slate-400 text-sm">No payment history found.</div>
        )}
      </div>
      <MobileNav />
    </div>
  );
}

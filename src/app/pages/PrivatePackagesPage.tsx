import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MobileHeader } from '../components/MobileHeader';
import { MobileNav } from '../components/MobileNav';
import { Calendar, CreditCard, MapPin, User, Loader2, AlertCircle } from 'lucide-react';
import { getPrivatePackages, type PrivatePackageDto } from '../api/pswmApi';
import { PageHero } from '../components/PageHero';

export function PrivatePackagesPage() {
  const [packages, setPackages] = useState<PrivatePackageDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getPrivatePackages()
      .then(setPackages)
      .catch(() => setError('Could not load packages.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] pb-20">
        <MobileHeader title="Private Packages" showBack />
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <Loader2 className="size-8 text-[#0B4F8C] animate-spin" />
          <p className="text-sm text-slate-500">Loading packages…</p>
        </div>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-20">
      <MobileHeader title="Private Packages" showBack />
      <PageHero title="Private Packages" subtitle="Personal coaching sessions" slide={4} tint="rgba(79,70,229,0.58)" />
      <div className="px-4 pt-3 pb-4">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl p-4 mb-4">
            <AlertCircle className="size-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {packages.length === 0 && !error && (
          <div className="text-center py-16 text-slate-400 text-sm">No private packages found.</div>
        )}

        <div className="space-y-3">
          {packages.map((pkg) => (
              <div key={pkg.packageId} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold text-slate-900">{pkg.packageName}</p>
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

                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <p className="text-slate-400">Sessions</p>
                    <p className="font-semibold text-slate-700">
                      {pkg.countAttended} attended · {pkg.sessionsLeft} left
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400">Due</p>
                    <p className={`font-semibold ${pkg.duePayment > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {pkg.duePayment.toLocaleString()} {pkg.packageCurrency}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-slate-100 mt-3">
                  <Link
                    to={`/private/${pkg.packageId}/sessions`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg,rgba(167,139,250,0.55) 0%,rgba(139,92,246,0.55) 100%)' }}
                  >
                    <Calendar className="size-4" />
                    Sessions
                  </Link>
                  <Link
                    to={`/private/${pkg.packageId}/payments`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg,rgba(167,139,250,0.55) 0%,rgba(139,92,246,0.55) 100%)' }}
                  >
                    <CreditCard className="size-4" />
                    Payments
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

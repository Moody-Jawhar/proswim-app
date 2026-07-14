import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MobileHeader } from '../components/MobileHeader';
import { MobileNav } from '../components/MobileNav';
import { Calendar, CreditCard, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { getGroupRegistrations, type RegistrationDto } from '../api/pswmApi';
import { PageHero } from '../components/PageHero';

export function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<RegistrationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getGroupRegistrations()
      .then(setRegistrations)
      .catch(() => setError('Could not load registrations.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] pb-20">
        <MobileHeader title="Registrations" showBack />
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <Loader2 className="size-8 text-[#0B4F8C] animate-spin" />
          <p className="text-sm text-slate-500">Loading registrations…</p>
        </div>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-20">
      <MobileHeader title="Registrations" showBack />
      <PageHero title="My Registrations" subtitle="Group classes & semesters" slide={1} tint="rgba(11,100,180,0.58)" />
      <div className="px-4 pt-3 pb-4">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl p-4 mb-4">
            <AlertCircle className="size-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {registrations.length === 0 && !error && (
          <div className="text-center py-16 text-slate-400 text-sm">No registrations found.</div>
        )}

        <div className="space-y-3">
          {registrations.map((reg) => {
            const names = [reg.className1, reg.className2, reg.className3].filter(Boolean) as string[];
            return (
              <div key={reg.registrationId} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">
                      {names.length > 0 ? names.join(' / ') : reg.semesterName || 'Registration'}
                    </p>
                    <p className="text-xs text-[#0B4F8C] font-medium mt-0.5">{reg.semesterName}</p>
                  </div>
                  {reg.registrationStudentStopped && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600 shrink-0">
                      Stopped
                    </span>
                  )}
                </div>

                {reg.locationNickName && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                    <MapPin className="size-3.5 shrink-0" />
                    <span>{reg.locationNickName}</span>
                  </div>
                )}

                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  <Link
                    to={`/registrations/${reg.registrationSemesterId}/sessions`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg,rgba(91,173,255,0.55) 0%,rgba(59,130,246,0.55) 100%)' }}
                  >
                    <Calendar className="size-4" />
                    Sessions
                  </Link>
                  <Link
                    to={`/registrations/${reg.registrationSemesterId}/payments`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg,rgba(52,211,153,0.55) 0%,rgba(16,185,129,0.55) 100%)' }}
                  >
                    <CreditCard className="size-4" />
                    Payments
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <MobileNav />
    </div>
  );
}

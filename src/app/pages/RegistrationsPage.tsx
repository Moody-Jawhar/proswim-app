import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MobileHeader } from '../components/MobileHeader';
import { MobileNav } from '../components/MobileNav';
import { PageLoader } from '../components/PageLoader';
import { Calendar, CreditCard, MapPin, Loader2, AlertCircle, Users } from 'lucide-react';
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
      <div className="min-h-screen bg-transparent pb-nav">
        <MobileHeader title="Group Registrations" showBack backTo="/dashboard" />
        <PageLoader label="Loading registrations…" />
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pb-nav">
      <MobileHeader title="Group Registrations" showBack backTo="/dashboard" />
      <PageHero title="Group Registrations" subtitle="Group classes & semesters" slide={1} tint="linear-gradient(120deg, rgba(36,44,67,0.78), rgba(11,100,180,0.55))" />
      <div className="px-4 pt-3 pb-4">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl p-4 mb-4">
            <AlertCircle className="size-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {registrations.length > 0 && (
          <div className="bg-[#1e5c97] rounded-2xl p-5 mb-4 flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <Users className="size-5 text-white" />
            </div>
            <div>
              <p className="num-stat text-3xl font-extrabold text-white leading-none">{registrations.length}</p>
              <p className="text-xs font-semibold mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Semester{registrations.length === 1 ? '' : 's'} registered
              </p>
            </div>
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
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(91,173,255,0.18)' }}>
                    <Users className="size-5 text-[#1A6FBF]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900">
                      {reg.semesterName || 'Registration'}
                    </p>
                    {names.length > 0 && (
                      <p className="text-xs text-slate-500 mt-0.5">{names.join(' / ')}</p>
                    )}
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

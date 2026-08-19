import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MobileHeader } from '../components/MobileHeader';
import { MobileNav } from '../components/MobileNav';
import { PageLoader } from '../components/PageLoader';
import { Calendar, CreditCard, MapPin, Loader2, AlertCircle, Users, ScrollText } from 'lucide-react';
import { getGroupRegistrations, getGroupRulesStatus, acceptGroupRules, type RegistrationDto } from '../api/pswmApi';
import { PageHero } from '../components/PageHero';
import { t } from '../i18n';

export function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<RegistrationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Rules gate: parents must read & accept the group rules once.
  const [rulesAccepted, setRulesAccepted] = useState<boolean | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [rulesError, setRulesError] = useState('');

  async function acceptRules() {
    setAccepting(true);
    setRulesError('');
    try {
      await acceptGroupRules();
      setRulesAccepted(true);
    } catch {
      setRulesError(t('rules.fail'));
    } finally {
      setAccepting(false);
    }
  }

  useEffect(() => {
    getGroupRegistrations()
      // Only the swimmer's 3 most recent semesters — older history just
      // buries the current one.
      .then((regs) => {
        setRegistrations(
        [...regs]
          .sort((a, b) =>
            new Date(b.registrationDate ?? 0).getTime() - new Date(a.registrationDate ?? 0).getTime()
            || b.registrationId - a.registrationId)
          .slice(0, 3),
        );
      })
      .catch(() => setError(t('reg.loadError')))
      .finally(() => setLoading(false));
    getGroupRulesStatus()
      .then((r) => setRulesAccepted(r.accepted))
      .catch(() => setRulesAccepted(true)); // fail open
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent pb-nav">
        <MobileHeader title={t('reg.title')} />
        <PageLoader label={t('reg.loading')} />
        <MobileNav />
      </div>
    );
  }

  if (rulesAccepted === false) {
    return (
      <div className="min-h-screen bg-transparent pb-nav">
        <MobileHeader title={t('reg.title')} />
        <div className="px-4 pt-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4" style={{ background: 'rgba(30,92,151,0.08)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(30,92,151,0.15)' }}>
                <ScrollText className="size-5" style={{ color: '#1e5c97' }} />
              </div>
              <p className="text-base font-bold text-slate-900">{t('grules.title')}</p>
            </div>
            <div className="px-5 py-4">
              <div className="space-y-3">
                {t('grules.body').split('\n\n').map((line, i) => {
                  const m = line.match(/^(\S{1,3}\.)\s*([\s\S]*)$/);
                  return (
                    <div key={i} className="flex gap-2.5">
                      <span className="text-sm font-bold shrink-0" style={{ color: '#1e5c97' }}>{m ? m[1] : '•'}</span>
                      <span className="text-sm" style={{ color: '#475569', lineHeight: 1.6 }}>{m ? m[2] : line}</span>
                    </div>
                  );
                })}
              </div>
              {rulesError && <p className="text-xs mt-3" style={{ color: '#DC2626' }}>{rulesError}</p>}
              <button
                onClick={acceptRules}
                disabled={accepting}
                className="btn-grad w-full py-3.5 rounded-xl font-semibold text-sm mt-4 disabled:opacity-50 active:scale-[0.98] transition-transform"
              >
                {accepting ? t('rules.accepting') : t('rules.confirm')}
              </button>
            </div>
          </div>
        </div>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pb-nav">
      <MobileHeader title={t('reg.title')} />
      <PageHero title={t('reg.title')} subtitle={t('reg.subtitle')} slide={1} tint="linear-gradient(120deg, rgba(36,44,67,0.78), rgba(11,100,180,0.55))" />
      <div className="px-4 pt-3 pb-4">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl p-4 mb-4">
            <AlertCircle className="size-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {registrations.length === 0 && !error && (
          <div className="text-center py-16 text-slate-400 text-sm">{t('reg.none')}</div>
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
                      {reg.semesterName || t('reg.fallback')}
                    </p>
                    {names.length > 0 && (
                      <p className="text-xs text-slate-500 mt-0.5">{names.join(' / ')}</p>
                    )}
                  </div>
                  {reg.registrationStudentStopped && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600 shrink-0">
                      {t('common.stopped')}
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
                    {t('common.sessions')}
                  </Link>
                  <Link
                    to={`/registrations/${reg.registrationSemesterId}/payments`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg,rgba(52,211,153,0.55) 0%,rgba(16,185,129,0.55) 100%)' }}
                  >
                    <CreditCard className="size-4" />
                    {t('common.payments')}
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

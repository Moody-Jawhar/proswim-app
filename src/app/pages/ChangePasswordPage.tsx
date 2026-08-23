import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, KeyRound, CheckCircle2 } from 'lucide-react';
import { MobileHeader } from '../components/MobileHeader';
import { MobileNav } from '../components/MobileNav';
import { changePassword, validatePasswordPolicy } from '../api/pswmApi';
import { t } from '../i18n';

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  // Forced mode: fresh accounts must change their password before continuing.
  const required = Boolean(location.state?.required);
  const needsVerify = location.state?.deviceVerified === false;

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError('');

    const policyError = validatePasswordPolicy(next);
    if (policyError) { setError(policyError); return; }
    if (next !== confirm) { setError(t('changepw.mismatch')); return; }
    if (next === current) { setError(t('changepw.sameAsOld')); return; }

    setLoading(true);
    try {
      await changePassword(current, next);
      setDone(true);
      setTimeout(() => {
        if (required && needsVerify) navigate('/verify', { replace: true });
        else if (required) navigate('/dashboard', { replace: true });
        else navigate(-1);
      }, 1200);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('changepw.fail'));
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-4 py-4 pr-12 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-[#1e5c97] focus:ring-2 focus:ring-[#1e5c97]/10 outline-none transition-all text-base';

  return (
    <div className="min-h-screen bg-transparent pb-nav">
      <MobileHeader title={t('changepw.title')} showBack={!required} />

      <div className="px-4 pt-6 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'rgba(91,173,255,0.18)' }}>
              <KeyRound className="size-5 text-[#1A6FBF]" />
            </div>
            <div>
              <p className="text-base font-bold text-slate-900">
                {required ? t('changepw.setNew') : t('changepw.change')}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {required
                  ? t('changepw.replaceGiven')
                  : t('changepw.policy')}
              </p>
            </div>
          </div>

          {done ? (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl text-sm">
              <CheckCircle2 className="size-4 shrink-0" />
              {t('changepw.success')}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-500 mb-2">{t('changepw.current')}</label>
                <input
                  type={show ? 'text' : 'password'} value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  required autoComplete="current-password" placeholder={t('changepw.currentPh')}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-500 mb-2">{t('changepw.new')}</label>
                <div className="relative">
                  <input
                    type={show ? 'text' : 'password'} value={next}
                    onChange={(e) => setNext(e.target.value)}
                    required autoComplete="new-password" placeholder={t('changepw.newPh')}
                    className={inputClass}
                  />
                  <button type="button" tabIndex={-1}
                    onClick={() => setShow(!show)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-500 mb-2">{t('changepw.confirm')}</label>
                <input
                  type={show ? 'text' : 'password'} value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required autoComplete="new-password" placeholder={t('changepw.confirmPh')}
                  className={inputClass}
                />
              </div>

              <button type="submit" disabled={loading}
                className="btn-grad w-full py-4 rounded-xl font-semibold text-base disabled:opacity-50 active:scale-[0.98] transition-transform">
                {loading ? t('changepw.updating') : t('changepw.update')}
              </button>
            </form>
          )}
        </div>
      </div>

      {!required && <MobileNav />}
    </div>
  );
}

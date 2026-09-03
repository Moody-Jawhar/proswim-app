import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, MessageCircle, CheckCircle2 } from 'lucide-react';
import { MobileHeader } from '../components/MobileHeader';
import { sendVerificationCode, verifyCode, getPendingToken, setStoredToken, clearPendingToken } from '../api/pswmApi';
import { t } from '../i18n';

export function VerifyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const mustChangePassword = Boolean((location.state as { mustChangePassword?: boolean } | null)?.mustChangePassword);

  const [step, setStep] = useState<'send' | 'enter'>('send');
  const [phone, setPhone] = useState('');
  const [expiresIn, setExpiresIn] = useState(10);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [done, setDone] = useState(false);
  const autoSent = useRef(false);

  const handleSend = async () => {
    setError('');
    setInfo('');
    setSending(true);
    try {
      const res = await sendVerificationCode();
      if (res.sent) {
        setPhone(res.phone);
        setExpiresIn(res.expiresInMinutes || 10);
        setCode('');
        setStep('enter');
      } else {
        setError(res.message || t('verify.sendFail'));
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('verify.sendFail'));
    } finally {
      setSending(false);
    }
  };

  // Auto-send the code once when the screen opens, so no button tap is needed.
  useEffect(() => {
    if (autoSent.current) return;
    autoSent.current = true;
    handleSend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVerify = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError('');
    setVerifying(true);
    try {
      const res = await verifyCode(code.trim());
      if (res.verified) {
        // Verified: promote the pending token to the real session token and
        // mark the device logged in, then continue.
        const pending = getPendingToken();
        if (pending) setStoredToken(pending);
        clearPendingToken();
        localStorage.setItem('isAuthenticated', 'true');
        setDone(true);
        setTimeout(() => {
          if (mustChangePassword) navigate('/change-password', { replace: true, state: { required: true } });
          else navigate('/dashboard', { replace: true });
        }, 1200);
      } else {
        setError(res.message || t('verify.incorrect'));
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : t('verify.failed');
      // These outcomes invalidate the code, user must request a new one.
      if (/new code|new one/i.test(msg)) {
        setStep('send');
        setInfo(msg);
      } else {
        setError(msg);
      }
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent">
      <MobileHeader title={t('verify.title')} />

      <div className="px-4 pt-6 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'rgba(37,211,102,0.15)' }}>
              <ShieldCheck className="size-5" style={{ color: '#1DA851' }} />
            </div>
            <div>
              <p className="text-base font-bold text-slate-900">{t('verify.heading')}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {t('verify.oneTime')}
              </p>
            </div>
          </div>

          {done ? (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl text-sm">
              <CheckCircle2 className="size-4 shrink-0" />
              {t('verify.done')}
            </div>
          ) : step === 'send' ? (
            <div className="space-y-4">
              {info && (
                <div className="bg-amber-50 border border-amber-100 text-amber-700 px-4 py-3 rounded-xl text-sm">
                  {info}
                </div>
              )}
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}
              <button onClick={handleSend} disabled={sending}
                className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl font-semibold text-base text-white disabled:opacity-50 active:scale-[0.98] transition-transform"
                style={{ backgroundColor: '#25D366' }}>
                <MessageCircle className="size-5" />
                {sending ? t('verify.sending') : t('verify.send')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-600">
                {t('verify.sentTo', { phone: phone ?? '', m: expiresIn })}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <input
                type="text" inputMode="numeric" autoComplete="one-time-code"
                maxLength={6} value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="••••••"
                className="w-full px-4 py-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-300 focus:border-[#1e5c97] focus:ring-2 focus:ring-[#1e5c97]/10 outline-none transition-all text-center text-2xl font-bold tracking-[0.5em]"
              />

              <button type="submit" disabled={verifying || code.length !== 6}
                className="btn-grad w-full py-4 rounded-xl font-semibold text-base disabled:opacity-50 active:scale-[0.98] transition-transform">
                {verifying ? t('verify.verifying') : t('verify.verify')}
              </button>

              <button type="button" onClick={handleSend} disabled={sending}
                className="w-full py-2 text-sm font-semibold text-[#1e5c97] disabled:opacity-50">
                {sending ? t('verify.resending') : t('verify.resend')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

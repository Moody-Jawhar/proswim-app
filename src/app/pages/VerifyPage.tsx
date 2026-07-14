import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, MessageCircle, CheckCircle2 } from 'lucide-react';
import { MobileHeader } from '../components/MobileHeader';
import { sendVerificationCode, verifyCode } from '../api/pswmApi';

export function VerifyPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<'send' | 'enter'>('send');
  const [phone, setPhone] = useState('');
  const [expiresIn, setExpiresIn] = useState(10);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [done, setDone] = useState(false);

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
        setError(res.message || 'Could not send the WhatsApp code.');
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not send the WhatsApp code.');
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError('');
    setVerifying(true);
    try {
      const res = await verifyCode(code.trim());
      if (res.verified) {
        setDone(true);
        setTimeout(() => navigate('/dashboard', { replace: true }), 1200);
      } else {
        setError(res.message || 'Incorrect code.');
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Verification failed.';
      // These outcomes invalidate the code — user must request a new one.
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
    <div className="min-h-screen bg-[#F5F7FA]">
      <MobileHeader title="Verify Account" />

      <div className="px-4 pt-6 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'rgba(37,211,102,0.15)' }}>
              <ShieldCheck className="size-5" style={{ color: '#1DA851' }} />
            </div>
            <div>
              <p className="text-base font-bold text-slate-900">Verify your account</p>
              <p className="text-xs text-slate-400 mt-0.5">
                One-time check — we'll send a 6-digit code to your WhatsApp.
              </p>
            </div>
          </div>

          {done ? (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl text-sm">
              <CheckCircle2 className="size-4 shrink-0" />
              Verified! Taking you to your dashboard…
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
                {sending ? 'Sending…' : 'Send code to WhatsApp'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-600">
                Code sent by WhatsApp to <span className="font-semibold text-slate-900">{phone}</span>.
                It expires in {expiresIn} minutes.
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
                className="w-full px-4 py-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-300 focus:border-[#0B4F8C] focus:ring-2 focus:ring-[#0B4F8C]/10 outline-none transition-all text-center text-2xl font-bold tracking-[0.5em]"
              />

              <button type="submit" disabled={verifying || code.length !== 6}
                className="w-full py-4 bg-[#0B4F8C] text-white rounded-xl font-semibold text-base disabled:opacity-50 active:scale-[0.98] transition-transform">
                {verifying ? 'Verifying…' : 'Verify'}
              </button>

              <button type="button" onClick={handleSend} disabled={sending}
                className="w-full py-2 text-sm font-semibold text-[#0B4F8C] disabled:opacity-50">
                {sending ? 'Resending…' : "Didn't get it? Resend code"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

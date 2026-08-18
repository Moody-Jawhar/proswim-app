import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, HeartPulse, PhoneCall, Lock, ShieldAlert, CheckCircle,
  Clock, Save, Mail, Phone,
} from 'lucide-react';
import { MobileHeader } from '../components/MobileHeader';
import { MobileNav } from '../components/MobileNav';
import { t } from '../i18n';
import {
  getProfile, updatePersonalInfo, getContactChangeRequests, submitContactChangeRequest,
  type ProfileDto, type ContactChangeRequestDto,
} from '../api/pswmApi';

const inputClass =
  'w-full px-4 py-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-[#1e5c97] focus:ring-2 focus:ring-[#1e5c97]/10 outline-none transition-all text-base';

const STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  Pending: { bg: 'rgba(245,158,11,0.14)', fg: '#B45309' },
  Approved: { bg: 'rgba(16,185,129,0.14)', fg: '#047857' },
  Rejected: { bg: 'rgba(239,68,68,0.12)', fg: '#B91C1C' },
  Cancelled: { bg: 'rgba(100,116,139,0.12)', fg: '#475569' },
};

// The parent-editable "Personal Information" screen. Address, emergency
// contact and medical info save directly; the main phone number and email
// only change through a staff-approved request (security rule).
export function PersonalInfoPage() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileDto | null>(null);
  const [requests, setRequests] = useState<ContactChangeRequestDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Editable fields
  const [form, setForm] = useState({
    studentAddressCity: '', studentAddressRegion: '', studentAddressStreet: '',
    studentAddressBuilding: '', studentAddressFloor: '',
    studentEmergencyContactName: '', studentEmergencyContactPhoneCode: '',
    studentEmergencyContactPhone: '', studentEmergencyContactRelation: '',
    studentAllergies: '', studentMedicalNotes: '',
  });

  // Phone/email change-request editors
  const [editingField, setEditingField] = useState<'Phone' | 'Email' | null>(null);
  const [reqValue, setReqValue] = useState('');
  const [reqCode, setReqCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('isAuthenticated') !== 'true') {
      navigate('/signin');
      return;
    }
    Promise.all([getProfile(), getContactChangeRequests()])
      .then(([p, reqs]) => {
        setProfile(p);
        setRequests(reqs);
        setForm({
          studentAddressCity: p.studentAddressCity ?? '',
          studentAddressRegion: p.studentAddressRegion ?? '',
          studentAddressStreet: p.studentAddressStreet ?? '',
          studentAddressBuilding: p.studentAddressBuilding ?? '',
          studentAddressFloor: p.studentAddressFloor ?? '',
          studentEmergencyContactName: p.studentEmergencyContactName ?? '',
          studentEmergencyContactPhoneCode: p.studentEmergencyContactPhoneCode ?? '',
          studentEmergencyContactPhone: p.studentEmergencyContactPhone ?? '',
          studentEmergencyContactRelation: p.studentEmergencyContactRelation ?? '',
          studentAllergies: p.studentAllergies ?? '',
          studentMedicalNotes: p.studentMedicalNotes ?? '',
        });
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : t('personal.loadError')))
      .finally(() => setLoading(false));
  }, [navigate]);

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSave() {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await updatePersonalInfo({
        studentAddressCity: form.studentAddressCity || null,
        studentAddressRegion: form.studentAddressRegion || null,
        studentAddressStreet: form.studentAddressStreet || null,
        studentAddressBuilding: form.studentAddressBuilding || null,
        studentAddressFloor: form.studentAddressFloor || null,
        studentEmergencyContactName: form.studentEmergencyContactName || null,
        studentEmergencyContactPhoneCode: form.studentEmergencyContactPhoneCode || null,
        studentEmergencyContactPhone: form.studentEmergencyContactPhone || null,
        studentEmergencyContactRelation: form.studentEmergencyContactRelation || null,
        studentAllergies: form.studentAllergies || null,
        studentMedicalNotes: form.studentMedicalNotes || null,
      });
      setSuccess(t('personal.saved'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('personal.saveFail'));
    } finally {
      setSaving(false);
    }
  }

  const pendingFor = (field: 'Phone' | 'Email') =>
    requests.find((r) => r.fieldType === field && r.status === 'Pending');

  function openEditor(field: 'Phone' | 'Email') {
    setEditingField(field);
    setReqValue('');
    setReqCode(field === 'Phone' ? (profile?.studentPhoneNumberCode1 ?? '') : '');
    setError('');
    setSuccess('');
  }

  async function handleSubmitRequest() {
    if (!editingField) return;
    const value = reqValue.trim();
    if (!value) { setError(t('personal.enterNew')); return; }
    if (editingField === 'Email' && !/^\S+@\S+\.\S+$/.test(value)) {
      setError(t('personal.validEmail'));
      return;
    }
    if (editingField === 'Phone' && !/^[0-9 ]{6,}$/.test(value)) {
      setError(t('personal.validPhone'));
      return;
    }
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const res = await submitContactChangeRequest(editingField, value, reqCode.trim() || undefined);
      setSuccess(res.message);
      setEditingField(null);
      setRequests(await getContactChangeRequests());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('personal.submitFail'));
    } finally {
      setSubmitting(false);
    }
  }

  const currentPhone = profile?.studentPhoneNumber1
    ? `${profile.studentPhoneNumberCode1 ? profile.studentPhoneNumberCode1 + ' ' : ''}${profile.studentPhoneNumber1}`
    : t('common.notSet');
  const currentEmail = profile?.studentEmail || t('common.notSet');
  const history = requests.filter((r) => r.status !== 'Pending').slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent pb-nav">
        <MobileHeader title={t('personal.title')} showBack />
        <div className="px-4 pt-10 text-center text-sm" style={{ color: '#64748B' }}>{t('common.loading')}</div>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pb-nav">
      <MobileHeader title={t('personal.title')} showBack />

      <div className="px-4 pt-4 pb-5">
        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-xl bg-red-50 p-3" style={{ border: '1px solid #FECACA' }}>
            <ShieldAlert className="size-5 text-red-600" style={{ flexShrink: 0 }} />
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}
        {success && (
          <div className="mb-4 flex items-start gap-2 rounded-xl bg-green-50 p-3" style={{ border: '1px solid #BBF7D0' }}>
            <CheckCircle className="size-5 text-green-600" style={{ flexShrink: 0 }} />
            <div className="text-sm text-green-700">{success}</div>
          </div>
        )}

        {/* ── Address ── */}
        <SectionCard icon={<MapPin className="size-4" style={{ color: '#F59E0B' }} />} iconBg="rgba(245,158,11,0.16)" title={t('common.address')}>
          <Field label={t('personal.city')}><input className={inputClass} value={form.studentAddressCity} onChange={set('studentAddressCity')} /></Field>
          <Field label={t('personal.region')}><input className={inputClass} value={form.studentAddressRegion} onChange={set('studentAddressRegion')} /></Field>
          <Field label={t('personal.street')}><input className={inputClass} value={form.studentAddressStreet} onChange={set('studentAddressStreet')} /></Field>
          <div className="flex gap-3">
            <div style={{ flex: 2 }}><Field label={t('personal.building')}><input className={inputClass} value={form.studentAddressBuilding} onChange={set('studentAddressBuilding')} /></Field></div>
            <div style={{ flex: 1 }}><Field label={t('personal.floor')}><input className={inputClass} value={form.studentAddressFloor} onChange={set('studentAddressFloor')} /></Field></div>
          </div>
        </SectionCard>

        {/* ── Emergency contact ── */}
        <SectionCard icon={<PhoneCall className="size-4" style={{ color: '#EF4444' }} />} iconBg="rgba(239,68,68,0.14)" title={t('personal.emergency')}>
          <Field label={t('personal.fullName')}><input className={inputClass} value={form.studentEmergencyContactName} onChange={set('studentEmergencyContactName')} placeholder={t('personal.whoCall')} /></Field>
          <Field label={t('personal.relation')}><input className={inputClass} value={form.studentEmergencyContactRelation} onChange={set('studentEmergencyContactRelation')} placeholder={t('personal.relationPh')} /></Field>
          <div className="flex gap-3">
            <div style={{ flex: 1 }}><Field label={t('personal.code')}><input className={inputClass} value={form.studentEmergencyContactPhoneCode} onChange={set('studentEmergencyContactPhoneCode')} placeholder="+961" /></Field></div>
            <div style={{ flex: 2.5 }}><Field label={t('personal.phoneNumber')}><input className={inputClass} inputMode="tel" value={form.studentEmergencyContactPhone} onChange={set('studentEmergencyContactPhone')} /></Field></div>
          </div>
        </SectionCard>

        {/* ── Medical ── */}
        <SectionCard icon={<HeartPulse className="size-4" style={{ color: '#EC4899' }} />} iconBg="rgba(236,72,153,0.16)" title={t('personal.medical')}>
          <p className="text-xs mb-3" style={{ color: '#64748B' }}>
            Coaches and staff see this so they can keep your swimmer safe. Please keep it up to date.
          </p>
          <Field label={t('personal.allergies')}>
            <textarea className={inputClass} rows={2} value={form.studentAllergies} onChange={set('studentAllergies')} placeholder={t('personal.allergiesPh')} />
          </Field>
          <Field label={t('personal.medNotes')}>
            <textarea className={inputClass} rows={3} value={form.studentMedicalNotes} onChange={set('studentMedicalNotes')} placeholder={t('personal.medNotesPh')} />
          </Field>
        </SectionCard>

        {/* Save (address + emergency + medical) */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl active:scale-[0.98] transition-transform mb-4"
          style={{ background: '#1e5c97', opacity: saving ? 0.7 : 1 }}
        >
          <Save className="size-4" style={{ color: 'white' }} />
          <span className="text-sm font-bold" style={{ color: 'white' }}>{saving ? t('personal.saving') : t('personal.save')}</span>
        </button>

        {/* ── Phone & Email (approval required) ── */}
        <SectionCard icon={<Lock className="size-4" style={{ color: '#1A6FBF' }} />} iconBg="rgba(91,173,255,0.18)" title={t('personal.phoneEmail')}>
          <p className="text-xs mb-3" style={{ color: '#64748B' }}>
            For your security, changes to your main phone number or email must be approved by ProSwim before they take effect.
          </p>

          <ContactRow
            icon={<Phone className="size-4" style={{ color: '#10B981' }} />}
            label={t('personal.mainPhone')}
            value={currentPhone}
            pending={pendingFor('Phone')}
            onEdit={() => openEditor('Phone')}
            disabled={editingField !== null || submitting}
          />
          <ContactRow
            icon={<Mail className="size-4" style={{ color: '#3B82F6' }} />}
            label={t('common.email')}
            value={currentEmail}
            pending={pendingFor('Email')}
            onEdit={() => openEditor('Email')}
            disabled={editingField !== null || submitting}
          />

          {editingField && (
            <div className="rounded-xl p-4 mt-3" style={{ background: 'rgba(30,92,151,0.06)', border: '1px solid rgba(30,92,151,0.18)' }}>
              <p className="text-sm font-semibold text-slate-900 mb-3">
                {editingField === 'Phone' ? t('personal.requestPhone') : t('personal.requestEmail')}
              </p>
              {editingField === 'Phone' ? (
                <div className="flex gap-3">
                  <div style={{ flex: 1 }}>
                    <input className={inputClass} value={reqCode} onChange={(e) => setReqCode(e.target.value)} placeholder="+961" />
                  </div>
                  <div style={{ flex: 2.5 }}>
                    <input className={inputClass} inputMode="tel" value={reqValue} onChange={(e) => setReqValue(e.target.value)} placeholder={t('personal.newPhonePh')} />
                  </div>
                </div>
              ) : (
                <input className={inputClass} inputMode="email" value={reqValue} onChange={(e) => setReqValue(e.target.value)} placeholder="new@email.com" />
              )}
              <div className="flex gap-3 mt-3">
                <button
                  onClick={handleSubmitRequest}
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl text-sm font-bold active:scale-[0.98] transition-transform"
                  style={{ background: '#1e5c97', color: 'white', opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting ? t('personal.sending') : t('personal.submit')}
                </button>
                <button
                  onClick={() => setEditingField(null)}
                  disabled={submitting}
                  className="py-3 px-4 rounded-xl text-sm font-semibold bg-white"
                  style={{ border: '1px solid #E2E8F0', color: '#475569' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </SectionCard>

        {/* ── Request history ── */}
        {history.length > 0 && (
          <SectionCard icon={<Clock className="size-4" style={{ color: '#8B5CF6' }} />} iconBg="rgba(139,92,246,0.16)" title={t('personal.pastRequests')}>
            {history.map((r) => {
              const c = STATUS_COLORS[r.status ?? ''] ?? STATUS_COLORS.Cancelled;
              const value = r.fieldType === 'Phone'
                ? [r.newPhoneCode, r.newValue].filter(Boolean).join(' ')
                : r.newValue;
              return (
                <div key={r.requestId} className="flex items-start gap-3">
                  <div className="flex-1" style={{ minWidth: 0 }}>
                    <p className="text-sm text-slate-900 break-words">
                      {r.fieldType === 'Phone' ? 'Phone' : 'Email'} → {value}
                    </p>
                    {r.reviewNote && <p className="text-xs mt-1" style={{ color: '#64748B' }}>“{r.reviewNote}”</p>}
                  </div>
                  <span className="text-xs font-bold rounded-full px-2 py-1" style={{ background: c.bg, color: c.fg, flexShrink: 0 }}>
                    {r.status}
                  </span>
                </div>
              );
            })}
          </SectionCard>
        )}
      </div>

      <MobileNav />
    </div>
  );
}

function SectionCard({ icon, iconBg, title, children }: {
  icon: React.ReactNode; iconBg: string; title: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: iconBg }}>
          {icon}
        </div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
      </div>
      <div>{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <p className="text-xs mb-1" style={{ color: '#64748B' }}>{label}</p>
      {children}
    </div>
  );
}

function ContactRow({ icon, label, value, pending, onEdit, disabled }: {
  icon: React.ReactNode; label: string; value: string;
  pending: import('../api/pswmApi').ContactChangeRequestDto | undefined;
  onEdit: () => void; disabled: boolean;
}) {
  const pendingValue = pending
    ? (pending.fieldType === 'Phone'
        ? [pending.newPhoneCode, pending.newValue].filter(Boolean).join(' ')
        : pending.newValue)
    : null;
  return (
    <div className="flex items-start gap-3 mb-3">
      <div style={{ marginTop: 2, flexShrink: 0 }}>{icon}</div>
      <div className="flex-1" style={{ minWidth: 0 }}>
        <p className="text-xs" style={{ color: '#64748B' }}>{label}</p>
        <p className="text-sm text-slate-900 break-words">{value}</p>
        {pendingValue && (
          <span className="inline-flex items-center gap-1 text-xs font-bold rounded-full px-2 py-1 mt-1"
            style={{ background: STATUS_COLORS.Pending.bg, color: STATUS_COLORS.Pending.fg }}>
            <Clock className="size-3" /> Pending approval: {pendingValue}
          </span>
        )}
      </div>
      {!pending && (
        <button
          onClick={onEdit}
          disabled={disabled}
          className="text-xs font-bold rounded-full px-3 py-1.5"
          style={{ background: 'rgba(30,92,151,0.10)', color: '#1e5c97', flexShrink: 0, opacity: disabled ? 0.5 : 1 }}
        >
          Request change
        </button>
      )}
    </div>
  );
}

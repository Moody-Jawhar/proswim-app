import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User, Mail, Phone, MapPin, Calendar, GraduationCap,
  Flag, Loader2, AlertCircle, Award, Shield, Camera
} from 'lucide-react';
import { MobileHeader } from '../components/MobileHeader';
import { MobileNav } from '../components/MobileNav';
import { PageLoader } from '../components/PageLoader';
import { getStudentById, getGroupAttendanceSummary, getGroupRegistrations, getPrivatePackages, getProfileLevelHistory, uploadMyPhoto, type StudentDto, type AttendanceSummaryDto, type LevelHistoryDto } from '../api/pswmApi';
import { PageHero } from '../components/PageHero';
import { t } from '../i18n';

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  'Competitive Team': { bg: 'rgba(249,115,22,0.15)',  color: '#9A3412' },
  Gifted:             { bg: 'rgba(236,72,153,0.15)',  color: '#9D174D' },
  'Group Training':   { bg: 'rgba(91,173,255,0.18)',  color: '#1A6FBF' },
  'Private Training': { bg: 'rgba(139,92,246,0.18)',  color: '#6D28D9' },
  School:             { bg: 'rgba(52,211,153,0.18)',  color: '#065F46' },
  AquaBaby:           { bg: 'rgba(56,189,248,0.18)', color: '#0369A1' },
  AquaGym:            { bg: 'rgba(251,191,36,0.20)', color: '#92600A' },
  Others:             { bg: 'rgba(148,163,184,0.18)', color: '#475569' },
};

/** Downscale to max 1000px and re-encode as JPEG so uploads stay small
 *  (a phone camera shot is 3–10 MB; this brings it to ~100–300 KB). */
async function shrinkImage(file: File): Promise<{ fileName: string; base64: string }> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = () => reject(new Error('Could not read the image.'));
    fr.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error('That file is not a valid image.'));
    i.src = dataUrl;
  });
  const MAX = 1000;
  const scale = Math.min(1, MAX / Math.max(img.width, img.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
  const jpeg = canvas.toDataURL('image/jpeg', 0.85);
  return { fileName: 'photo.jpg', base64: jpeg.split(',')[1] };
}

export function MyProfilePage() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [student, setStudent] = useState<StudentDto | null>(null);
  const [attendance, setAttendance] = useState<AttendanceSummaryDto[]>([]);
  const [levels, setLevels] = useState<LevelHistoryDto[]>([]);
  const [groupCount, setGroupCount] = useState<number | null>(null);
  const [privateCount, setPrivateCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('currentUser');
    if (!userData) { navigate('/signin'); return; }
    const user = JSON.parse(userData);
    if (!user.studentId) { navigate('/dashboard'); return; }
    // The page renders as soon as the student record arrives; the secondary
    // data (attendance, levels, counts) fills in whenever it lands. Gating on
    // everything meant one slow call kept the whole page on its spinner.
    getStudentById(user.studentId)
      .then(setStudent)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load profile'))
      .finally(() => setLoading(false));
    getGroupAttendanceSummary().then(setAttendance).catch(() => {});
    getProfileLevelHistory().then(setLevels).catch(() => {});
    getGroupRegistrations().then((r) => setGroupCount(r.length)).catch(() => {});
    getPrivatePackages().then((p) => setPrivateCount(p.length)).catch(() => {});
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent pb-nav">
        <MobileHeader title="My Profile" />
        <PageLoader label="Loading profile..." />
        <MobileNav />
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-transparent pb-nav">
        <MobileHeader title="My Profile" />
        <div className="flex flex-col items-center justify-center h-64 gap-3 px-6">
          <AlertCircle className="size-10 text-red-400" />
          <p className="text-sm text-red-600 text-center">{error || 'Profile not available'}</p>
        </div>
        <MobileNav />
      </div>
    );
  }

  const fullName = [student.studentFirstName, student.studentMiddleName, student.studentLastName]
    .filter(Boolean).join(' ');
  const initials = [student.studentFirstName, student.studentLastName]
    .filter(Boolean).map(n => n![0]).join('').toUpperCase();
  const dob = student.studentDateOfBirth
    ? new Date(student.studentDateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;
  const age = student.studentDateOfBirth
    ? Math.floor((Date.now() - new Date(student.studentDateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : null;
  const phone1 = student.studentPhoneNumber1
    ? `+${student.studentPhoneNumberCode1 || ''} ${student.studentPhoneNumber1}`.trim() : null;
  const phone2 = student.studentPhoneNumber2
    ? `+${student.studentPhoneNumberCode2 || ''} ${student.studentPhoneNumber2}`.trim() : null;
  const address = [
    student.studentAddressBuilding && `Bldg ${student.studentAddressBuilding}`,
    student.studentAddressFloor && `Floor ${student.studentAddressFloor}`,
    student.studentAddressStreet, student.studentAddressRegion, student.studentAddressCity,
  ].filter(Boolean).join(', ');
  // A swimmer can be enrolled in several programs at once.
  const programs = [
    student.studentGroupSwimmer && 'Group Training', student.studentPrivateSwimmer && 'Private Training',
    student.studentEliteSwimmer && 'Competitive Team', student.studentAquaBabySwimmer && 'AquaBaby',
    student.studentAquaGymSwimmer && 'AquaGym', student.studentSchoolSwimmer && 'School',
    student.studentGiftedSwimmer && 'Gifted', student.studentOthersSwimmer && 'Others',
  ].filter(Boolean) as string[];
  return (
    <div className="min-h-screen bg-transparent pb-nav">
      <MobileHeader title={t('profile.title')} showSignOut />
      <PageHero title={t('profile.title')} subtitle={t('profile.subtitle')} slide={3} tint="linear-gradient(120deg, rgba(36,44,67,0.78), rgba(14,100,144,0.55))" />
      <div className="px-4 pt-3 pb-5 space-y-4">

        {/* Hero card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="relative overflow-hidden px-5 pt-5 pb-12"
            style={{ background: 'linear-gradient(135deg,rgba(91,173,255,0.22) 0%,rgba(176,138,255,0.18) 100%)' }}>
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none" style={{ background: 'rgba(91,173,255,0.10)' }} />
            <div className="flex items-center gap-3 relative">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = '';
                  if (!file) return;
                  setPhotoError('');
                  setUploading(true);
                  try {
                    const { fileName, base64 } = await shrinkImage(file);
                    const { url } = await uploadMyPhoto(fileName, base64);
                    setStudent((s) => (s ? { ...s, studentPhotoUrl: url } : s));
                  } catch (err) {
                    setPhotoError(err instanceof Error ? err.message : 'Could not upload the photo.');
                  } finally {
                    setUploading(false);
                  }
                }}
              />
              <button
                onClick={() => !uploading && fileRef.current?.click()}
                className="relative rounded-2xl flex items-center justify-center shrink-0 overflow-hidden active:opacity-80 transition-opacity"
                style={{ width: 58, height: 58, background: 'rgba(30,92,151,0.15)', border: '1.5px solid rgba(30,92,151,0.20)', padding: 0 }}
                aria-label="Change profile photo"
              >
                {uploading ? (
                  <Loader2 className="animate-spin" style={{ width: 24, height: 24, color: '#1e5c97' }} />
                ) : student.studentPhotoUrl ? (
                  <img src={student.studentPhotoUrl} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-display text-[#1e5c97] font-bold" style={{ fontSize: 21 }}>{initials}</span>
                )}
              </button>
              {/* Camera badge — signals the avatar is tappable */}
              <div
                className="absolute rounded-full flex items-center justify-center pointer-events-none"
                style={{
                  left: 42, top: 40, width: 20, height: 20,
                  background: '#1e5c97', border: '1.5px solid #ffffff',
                }}
              >
                <Camera style={{ width: 11, height: 11, color: '#ffffff' }} />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900 leading-snug">{fullName}</p>
                {age !== null && <p className="text-slate-500 text-xs mt-0.5">Age {age} • {student.studentGender || '—'}</p>}
                {student.studentActive && (
                  <span className="mt-1.5 inline-block px-3 py-0.5 text-xs font-bold rounded-full text-white"
                    style={{ background: '#22C55E' }}>
                    Active
                  </span>
                )}
              </div>
            </div>
            {photoError && (
              <p className="text-xs mt-2 relative" style={{ color: '#DC2626' }}>{photoError}</p>
            )}
          </div>

          <div className="grid grid-cols-3 divide-x divide-slate-100 -mt-5 bg-white mx-3 rounded-xl shadow-sm border border-slate-100 relative z-10">
            <StatChip label="Since" value={student.studentStartingDate
              ? new Date(student.studentStartingDate).getFullYear().toString() : '—'}
              color="#3B82F6" />
            <StatChip label="Group Classes" value={groupCount != null ? groupCount.toString() : '—'} color="#10B981" />
            <StatChip label="Private Packages" value={privateCount != null ? privateCount.toString() : '—'} color="#8B5CF6" />
          </div>
          <div className="h-4" />
        </div>

        {/* Programs Enrolled In */}
        {programs.length > 0 && (
          <Section title={t('profile.programs')} icon={<Award className="size-4" style={{ color: '#F59E0B' }} />} iconBg="rgba(251,191,36,0.18)">
            <div className="flex flex-wrap gap-2">
              {programs.map(type => {
                const c = TYPE_COLORS[type] ?? { bg: 'rgba(91,173,255,0.15)', color: '#1A6FBF' };
                return (
                  <span key={type} className="px-3 py-1 rounded-full text-sm font-semibold"
                    style={{ background: c.bg, color: c.color }}>
                    {type}
                  </span>
                );
              })}
            </div>
          </Section>
        )}

        {/* Contact */}
        <Section title={t('profile.contact')} icon={<Phone className="size-4" style={{ color: '#3B82F6' }} />} iconBg="rgba(91,173,255,0.18)">
          {student.studentEmail && (
            <InfoRow icon={<Mail className="size-4" style={{ color: '#3B82F6' }} />} label="Email" value={student.studentEmail} />
          )}
          {phone1 && <InfoRow icon={<Phone className="size-4" style={{ color: '#10B981' }} />} label="Phone 1" value={phone1} />}
          {phone2 && <InfoRow icon={<Phone className="size-4" style={{ color: '#10B981' }} />} label="Phone 2" value={phone2} />}
          {address && <InfoRow icon={<MapPin className="size-4" style={{ color: '#F59E0B' }} />} label="Address" value={address} />}
        </Section>

        {/* Personal */}
        <Section title={t('profile.personal')} icon={<User className="size-4" style={{ color: '#8B5CF6' }} />} iconBg="rgba(139,92,246,0.18)">
          {dob && <InfoRow icon={<Calendar className="size-4" style={{ color: '#8B5CF6' }} />} label="Date of Birth" value={dob} />}
          {student.studentSchool && (
            <InfoRow icon={<GraduationCap className="size-4" style={{ color: '#F59E0B' }} />} label="School" value={student.studentSchool} />
          )}
          {student.coachFullName && (
            <InfoRow icon={<User className="size-4" style={{ color: '#10B981' }} />} label="Coach" value={student.coachFullName} />
          )}
          {student.studentNationality1 && (
            <InfoRow icon={<Flag className="size-4" style={{ color: '#EF4444' }} />} label="Nationality"
              value={[student.studentNationality1, student.studentNationality2].filter(Boolean).join(' / ')} />
          )}
        </Section>

        {/* Family */}
        {(student.studentMomOccupation || student.studentDadOccupation) && (
          <Section title={t('profile.family')} icon={<Shield className="size-4" style={{ color: '#EC4899' }} />} iconBg="rgba(236,72,153,0.18)">
            {student.studentMomOccupation && (
              <InfoRow icon={<User className="size-4" style={{ color: '#EC4899' }} />} label="Mom's Occupation" value={student.studentMomOccupation} />
            )}
            {student.studentDadOccupation && (
              <InfoRow icon={<User className="size-4" style={{ color: '#EC4899' }} />} label="Dad's Occupation" value={student.studentDadOccupation} />
            )}
          </Section>
        )}

        {/* Attendance by Class */}
        {attendance.length > 0 && (
          <Section title="Attendance by Class" icon={<Calendar className="size-4" style={{ color: '#10B981' }} />} iconBg="rgba(52,211,153,0.18)">
            <div className="space-y-4">
              {attendance.map((a, i) => {
                const pct = a.totalSessions > 0 ? Math.round((a.attendedSessions / a.totalSessions) * 100) : 0;
                const barColors = ['#3B82F6','#10B981','#8B5CF6','#F59E0B','#EF4444','#EC4899','#0EA5E9'];
                const barColor = barColors[i % barColors.length];
                return (
                  <div key={a.registrationId}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm text-slate-900">{a.className || a.semesterName}</span>
                      <span className="text-xs font-semibold" style={{ color: barColor }}>{a.attendedSessions}/{a.totalSessions}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: barColor }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* Progress & Achievements */}
        {(levels.length > 0 || student.studentLatestLevelName || student.studentEliteSwimmer) && (
          <Section title={t('profile.progress')} icon={<Award className="size-4" style={{ color: '#8B5CF6' }} />} iconBg="rgba(139,92,246,0.16)">
            {student.studentLatestLevelName && (
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold rounded-full px-3 py-1"
                  style={{ background: 'rgba(139,92,246,0.12)', color: '#6D28D9' }}>
                  Current level: {student.studentLatestLevelName}
                </span>
              </div>
            )}
            {levels.map((lv) => (
              <div key={lv.levelHistoryId} className="flex items-start gap-3">
                <div className="mt-1.5 shrink-0 rounded-full" style={{ width: 8, height: 8, background: '#8B5CF6' }} />
                <div className="flex-1" style={{ minWidth: 0 }}>
                  <p className="text-sm font-semibold text-slate-900">{lv.levelName || 'Level'}</p>
                  <p className="text-xs" style={{ color: '#64748B' }}>
                    {lv.levelDateFrom
                      ? new Date(lv.levelDateFrom).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
                      : '—'}
                    {' – '}
                    {!lv.levelDateTo || new Date(lv.levelDateTo).getFullYear() > 2090
                      ? 'present'
                      : new Date(lv.levelDateTo).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                  </p>
                  {lv.levelRemarks && <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{lv.levelRemarks}</p>}
                </div>
              </div>
            ))}
            {student.studentEliteSwimmer && (
              <p className="text-xs" style={{ color: '#64748B' }}>
                Competition results, medals and personal bests live in the <b>Competitive Portfolio</b> below.
              </p>
            )}
          </Section>
        )}

        {/* Change password */}
        <Link to="/change-password"
          className="flex items-center justify-center gap-2 bg-white rounded-2xl border border-slate-100 shadow-sm py-4 active:bg-slate-50 transition-colors">
          <span className="text-sm font-semibold text-[#1e5c97]">Change Password</span>
        </Link>

        {/* Competitive Team Portfolio */}
        {student.studentEliteSwimmer === true && (
          <Link to="/profile/portfolio"
            className="flex items-center justify-center gap-2 rounded-2xl py-4 active:scale-[0.98] transition-transform"
            style={{ background: 'linear-gradient(90deg, #B45309, #F59E0B)' }}>
            <Award className="size-4 text-white" />
            <span className="text-sm font-bold text-white">Competitive Portfolio</span>
          </Link>
        )}

        {/* Edit personal information (in-app; phone/email go through approval) */}
        <Link to="/profile/personal"
          className="flex items-center justify-center gap-2 rounded-2xl py-4 active:scale-[0.98] transition-transform"
          style={{ background: '#1e5c97' }}>
          <span className="text-sm font-bold text-white">Edit Personal Information</span>
        </Link>

        {/* Contact to edit */}
        <button
          onClick={() => {
            const name = [student.studentFirstName, student.studentLastName].filter(Boolean).join(' ');
            const text = `Hello ProSwim, I am ${name || 'a ProSwim student'}. I would like to update my profile information.`;
            window.open(`https://wa.me/96178949498?text=${encodeURIComponent(text)}`);
          }}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl active:scale-[0.98] transition-transform"
          style={{ backgroundColor: '#25D366' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span className="text-sm font-bold text-white">Contact Us to Edit Profile</span>
        </button>

      </div>
      <MobileNav />
    </div>
  );
}

function Section({ title, icon, iconBg, children }: { title: string; icon: React.ReactNode; iconBg: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: iconBg }}>
          {icon}
        </div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-400 mb-0.5">{label}</p>
        <p className="text-sm text-slate-900 break-words">{value}</p>
      </div>
    </div>
  );
}

function StatChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col items-center py-3 px-2">
      <p className="num-stat text-lg font-bold" style={{ color }}>{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

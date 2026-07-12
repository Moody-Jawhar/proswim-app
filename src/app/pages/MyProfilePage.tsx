import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User, Mail, Phone, MapPin, Calendar, GraduationCap,
  Flag, Loader2, AlertCircle, Award, Shield
} from 'lucide-react';
import { MobileHeader } from '../components/MobileHeader';
import { MobileNav } from '../components/MobileNav';
import { getStudentById, getGroupAttendanceSummary, type StudentDto, type AttendanceSummaryDto } from '../api/pswmApi';

export function MyProfilePage() {
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentDto | null>(null);
  const [attendance, setAttendance] = useState<AttendanceSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('currentUser');
    if (!userData) { navigate('/signin'); return; }

    const user = JSON.parse(userData);
    if (!user.studentId) { navigate('/dashboard'); return; }

    (async () => {
      try {
        const [studentData, attendanceData] = await Promise.allSettled([
          getStudentById(user.studentId),
          getGroupAttendanceSummary(),
        ]);
        if (studentData.status === 'fulfilled') setStudent(studentData.value);
        else throw new Error('Failed to load profile');
        if (attendanceData.status === 'fulfilled') setAttendance(attendanceData.value);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] pb-20">
        <MobileHeader title="My Profile" showBack />
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <Loader2 className="size-8 text-[#0B4F8C] animate-spin" />
          <p className="text-sm text-slate-500">Loading profile...</p>
        </div>
        <MobileNav />
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] pb-20">
        <MobileHeader title="My Profile" showBack />
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
    .filter(Boolean).map(n => n![0]).join('');

  const dob = student.studentDateOfBirth
    ? new Date(student.studentDateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  const age = student.studentDateOfBirth
    ? Math.floor((Date.now() - new Date(student.studentDateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : null;

  const phone1 = student.studentPhoneNumber1
    ? `+${student.studentPhoneNumberCode1 || ''} ${student.studentPhoneNumber1}`.trim()
    : null;

  const phone2 = student.studentPhoneNumber2
    ? `+${student.studentPhoneNumberCode2 || ''} ${student.studentPhoneNumber2}`.trim()
    : null;

  const address = [
    student.studentAddressBuilding && `Bldg ${student.studentAddressBuilding}`,
    student.studentAddressFloor && `Floor ${student.studentAddressFloor}`,
    student.studentAddressStreet,
    student.studentAddressRegion,
    student.studentAddressCity,
  ].filter(Boolean).join(', ');

  const swimmerTypes = [
    student.studentEliteSwimmer && 'Elite',
    student.studentGiftedSwimmer && 'Gifted',
    student.studentGroupSwimmer && 'Group',
    student.studentPrivateSwimmer && 'Private',
    student.studentSchoolSwimmer && 'School',
    student.studentAquaBabySwimmer && 'Aqua Baby',
    student.studentAquaGymSwimmer && 'Aqua Gym',
    student.studentOthersSwimmer && 'Others',
  ].filter(Boolean) as string[];

  const totalSessions = attendance.reduce((s, a) => s + a.totalSessions, 0);
  const attendedSessions = attendance.reduce((s, a) => s + a.attendedSessions, 0);
  const attendancePct = totalSessions > 0 ? Math.round((attendedSessions / totalSessions) * 100) : null;

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-20">
      <MobileHeader title="My Profile" showBack showSignOut />

      <div className="px-4 py-5 space-y-4">

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#EEF5FF] to-[#D4E8FF] px-5 pt-5 pb-12">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#0B4F8C]/5 rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-1/2 w-24 h-24 bg-[#0B4F8C]/3 rounded-full pointer-events-none" />
            <div className="flex items-center gap-3 relative">
              <div className="w-11 h-11 rounded-2xl bg-[#0B4F8C]/15 backdrop-blur flex items-center justify-center shrink-0 border border-[#0B4F8C]/20">
                <span className="text-[#0B4F8C] text-sm font-bold">{initials}</span>
              </div>
              <div>
                <p className="text-lg font-bold text-black leading-snug">{fullName}</p>
                {age && <p className="text-black/50 text-xs mt-0.5">Age {age} • {student.studentGender || '—'}</p>}
                {student.studentActive && (
                  <span className="mt-1.5 inline-block px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-semibold rounded-full border border-emerald-200">
                    Active
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-slate-100 -mt-5 bg-white mx-3 rounded-xl shadow-sm border border-slate-100 relative z-10">
            <StatChip label="Since" value={student.studentStartingDate
              ? new Date(student.studentStartingDate).getFullYear().toString()
              : '—'} />
            <StatChip label="Attendance" value={attendancePct != null ? `${attendancePct}%` : '—'} />
            <StatChip label="Classes" value={attendance.length > 0 ? attendance.length.toString() : '—'} />
          </div>

          <div className="h-4" />
        </div>

        {swimmerTypes.length > 0 && (
          <Section title="Swimmer Type" icon={<Award className="size-4 text-[#0B4F8C]" />}>
            <div className="flex flex-wrap gap-2">
              {swimmerTypes.map(type => (
                <span key={type} className="px-3 py-1 bg-[#0B4F8C]/10 text-[#0B4F8C] rounded-full text-sm font-medium">
                  {type}
                </span>
              ))}
            </div>
          </Section>
        )}

        <Section title="Contact" icon={<Phone className="size-4 text-[#0B4F8C]" />}>
          {student.studentEmail ? (
            <InfoRow icon={<Mail className="size-4 text-slate-400" />} label="Email" value={student.studentEmail} />
          ) : null}
          {phone1 && <InfoRow icon={<Phone className="size-4 text-slate-400" />} label="Phone 1" value={phone1} />}
          {phone2 && <InfoRow icon={<Phone className="size-4 text-slate-400" />} label="Phone 2" value={phone2} />}
          {address && <InfoRow icon={<MapPin className="size-4 text-slate-400" />} label="Address" value={address} />}
        </Section>

        <Section title="Personal" icon={<User className="size-4 text-[#0B4F8C]" />}>
          {dob && <InfoRow icon={<Calendar className="size-4 text-slate-400" />} label="Date of Birth" value={dob} />}
          {student.studentSchool && (
            <InfoRow icon={<GraduationCap className="size-4 text-slate-400" />} label="School" value={student.studentSchool} />
          )}
          {student.studentNationality1 && (
            <InfoRow icon={<Flag className="size-4 text-slate-400" />} label="Nationality" value={
              [student.studentNationality1, student.studentNationality2].filter(Boolean).join(' / ')
            } />
          )}
        </Section>

        {(student.studentMomOccupation || student.studentDadOccupation) && (
          <Section title="Family" icon={<Shield className="size-4 text-[#0B4F8C]" />}>
            {student.studentMomOccupation && (
              <InfoRow icon={<User className="size-4 text-slate-400" />} label="Mom's Occupation" value={student.studentMomOccupation} />
            )}
            {student.studentDadOccupation && (
              <InfoRow icon={<User className="size-4 text-slate-400" />} label="Dad's Occupation" value={student.studentDadOccupation} />
            )}
          </Section>
        )}

        {attendance.length > 0 && (
          <Section title="Attendance by Class" icon={<Calendar className="size-4 text-[#0B4F8C]" />}>
            <div className="space-y-4">
              {attendance.map(a => {
                const pct = a.totalSessions > 0
                  ? Math.round((a.attendedSessions / a.totalSessions) * 100)
                  : 0;
                return (
                  <div key={a.registrationId}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm text-slate-900">{a.className || a.semesterName}</span>
                      <span className="text-xs text-slate-400">{a.attendedSessions}/{a.totalSessions}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0B4F8C] rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* Go to Dashboard */}
        <Link
          to="/dashboard"
          className="flex items-center justify-center gap-2 bg-white rounded-2xl border border-slate-100 shadow-sm py-4 active:bg-slate-50 transition-colors"
        >
          <span className="text-sm font-semibold text-[#0B4F8C]">Go to Dashboard</span>
        </Link>

        {/* Contact to edit profile */}
        <button
          onClick={() => window.open('https://wa.me/96170916503?text=Hello%20ProSwim%2C%20I%20would%20like%20to%20update%20my%20profile%20information.')}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl active:scale-[0.98] transition-transform"
          style={{ backgroundColor: '#25D366' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span className="text-sm font-bold" style={{ color: '#ffffff' }}>Contact Us to Edit Profile</span>
        </button>

      </div>
      <MobileNav />
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-[#EBF3FC] flex items-center justify-center">
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

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center py-3 px-2">
      <p className="text-lg font-bold text-[#0B4F8C]">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

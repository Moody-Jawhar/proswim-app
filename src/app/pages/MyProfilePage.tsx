import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

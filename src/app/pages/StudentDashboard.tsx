import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MobileHeader } from '../components/MobileHeader';
import { MobileNav } from '../components/MobileNav';
import {
  Calendar, Clock, MapPin, Award, Users, ChevronRight,
  Target, AlertCircle, Loader2, BookOpen, Waves, Newspaper
} from 'lucide-react';
import { Progress } from '../components/Progress';
import { SwimTimes } from '../components/SwimTimes';
import {
  getStoredToken,
  getProfile,
  getGroupRegistrations,
  getGroupAttendanceSummary,
  getPrivatePackages,
  type ProfileDto,
  type RegistrationDto,
  type AttendanceSummaryDto,
  type PrivatePackageDto,
} from '../api/pswmApi';

interface MockCourse {
  id: string;
  name: string;
  level: string;
  schedule: string;
  location: string;
  instructor: string;
  nextClass: string;
  progress: number;
  skills: string[];
  completedSkills: string[];
}

const MOCK_COURSES: Record<string, MockCourse[]> = {
  'sanadalaghbar@gmail.com': [
    {
      id: '1',
      name: 'Fundamentals - Dolphin',
      level: 'Beginner 3',
      schedule: 'Tue & Thu, 3:30 PM',
      location: 'Achrafieh Pool',
      instructor: 'Coach Lara',
      nextClass: '2025-01-07',
      progress: 45,
      skills: ['Front crawl 15m', 'Backstroke 15m', 'Treading water 30 sec', 'Underwater swimming 5m', 'Streamline position', 'Flip turn basics'],
      completedSkills: ['Front crawl 15m', 'Backstroke 15m', 'Treading water 30 sec'],
    },
    {
      id: '2',
      name: 'Active Start - Seal',
      level: 'Beginner 1',
      schedule: 'Saturday, 10:00 AM',
      location: 'Achrafieh Pool',
      instructor: 'Coach Rami',
      nextClass: '2025-01-04',
      progress: 70,
      skills: ['Water confidence', 'Floating on back', 'Kicking with kickboard', 'Blowing bubbles', 'Underwater exploration', 'Safe pool entry'],
      completedSkills: ['Water confidence', 'Floating on back', 'Kicking with kickboard', 'Blowing bubbles', 'Safe pool entry'],
    },
  ],
};

const SLIDE = (n: number) => `https://www.proswim-lb.com/Gallery/_Website/Main/Slide${n}.jpg`;

const QUICK_TILES = [
  { icon: BookOpen, label: 'GROUP REGISTRATIONS', href: '/registrations', slide: 1 },
  { icon: Waves,    label: 'PRIVATE PACKAGES',    href: '/private',       slide: 2 },
] as const;

interface ApiCourse {
  id: number;
  names: string[];
  semester: string;
  location: string;
  attendancePercent: number | null;
  totalSessions: number;
  attendedSessions: number;
  stopped: boolean;
}

interface StudentDashboardProps {
  userName: string;
  userEmail: string;
}

export function StudentDashboard({ userName, userEmail }: StudentDashboardProps) {
  const isRealAuth = !!getStoredToken();

  const [profile, setProfile] = useState<ProfileDto | null>(null);
  const [apiCourses, setApiCourses] = useState<ApiCourse[]>([]);
  const [privatePackages, setPrivatePackages] = useState<PrivatePackageDto[]>([]);
  const [apiLoading, setApiLoading] = useState(isRealAuth);
  const [apiError, setApiError] = useState('');

  const mockCourses = MOCK_COURSES[userEmail] || [];

  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'courses' | 'times' | 'payments'>('courses');

  useEffect(() => {
    if (!isRealAuth) return;

    (async () => {
      try {
        setApiLoading(true);
        setApiError('');

        const [profileResult, registrationsResult, attendanceSummaryResult, packagesResult] =
          await Promise.allSettled([
            getProfile(),
            getGroupRegistrations(),
            getGroupAttendanceSummary(),
            getPrivatePackages(),
          ]);

        const profileData = profileResult.status === 'fulfilled' ? profileResult.value : null;
        const registrations = registrationsResult.status === 'fulfilled' ? registrationsResult.value : [];
        const attendanceSummary = attendanceSummaryResult.status === 'fulfilled' ? attendanceSummaryResult.value : [];
        const packages = packagesResult.status === 'fulfilled' ? packagesResult.value : [];

        setProfile(profileData);
        setPrivatePackages(packages);

        const courses: ApiCourse[] = registrations.map((reg: RegistrationDto) => {
          const summary = attendanceSummary.find(
            (a: AttendanceSummaryDto) => a.registrationId === reg.registrationId
          );
          const names = [reg.className1, reg.className2, reg.className3].filter(Boolean) as string[];
          const attendancePercent = summary && summary.totalSessions > 0
            ? Math.round((summary.attendedSessions / summary.totalSessions) * 100)
            : null;

          return {
            id: reg.registrationId,
            names: names.length > 0 ? names : [reg.semesterName || 'Class'],
            semester: reg.semesterName || '',
            location: reg.locationNickName || '',
            attendancePercent,
            totalSessions: summary?.totalSessions ?? 0,
            attendedSessions: summary?.attendedSessions ?? 0,
            stopped: reg.registrationStudentStopped ?? false,
          };
        });

        setApiCourses(courses);
      } catch {
        // individual endpoint errors handled above via allSettled
      } finally {
        setApiLoading(false);
      }
    })();
  }, [isRealAuth]);

  const firstName = (isRealAuth && profile
    ? profile.studentFirstName
    : userName.split(' ')[0]) || userName.split(' ')[0];

  const currentLevel = isRealAuth && profile
    ? profile.studentLatestLevelName
    : null;


  if (apiLoading) {
    return (
      <div className="min-h-screen bg-transparent pb-20">
        <MobileHeader title="My Dashboard" showSignOut showBell />
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <Loader2 className="size-8 text-[#1e5c97] animate-spin" />
          <p className="text-sm text-slate-500">Loading your data...</p>
        </div>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pb-20">
      <MobileHeader title="My Dashboard" showSignOut showBell />

      {/* Welcome card */}
      <div className="px-4 pt-4 pb-0">
        <div className="rounded-3xl px-6 py-6 relative overflow-hidden" style={{ minHeight: 140 }}>
          <img src={SLIDE(3)} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,rgba(6,30,60,0.88) 0%,rgba(30,92,151,0.72) 100%)' }} />
          <p className="text-xs font-bold tracking-widest uppercase relative" style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.15em' }}>Welcome back</p>
          <p className="text-3xl font-black mt-1 relative" style={{ color: '#ffffff', letterSpacing: '-0.01em' }}>Hi, {firstName}! 👋</p>
          {currentLevel && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full relative" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <Award className="size-3.5" style={{ color: '#7DD3FC' }} />
              <span className="text-xs font-bold tracking-wide" style={{ color: '#7DD3FC' }}>{currentLevel}</span>
            </div>
          )}
          {isRealAuth && profile?.locationNickName && (
            <p className="text-xs mt-2 relative flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
              <MapPin className="size-3.5" />
              {profile.locationNickName}
            </p>
          )}
          {!isRealAuth && (
            <p className="text-sm mt-2 relative" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Track your progress and view upcoming classes
            </p>
          )}
        </div>
      </div>

      <div className="px-4 mt-4 space-y-4">

        {apiError && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-2xl p-4">
            <AlertCircle className="size-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{apiError}</p>
          </div>
        )}

        {/* Quick Access grid */}
        <div>
          <div className="grid grid-cols-2 gap-3 mx-12">
            {QUICK_TILES.map(({ icon: Icon, label, href, slide }) => (
              <Link
                key={label}
                to={href}
                className="rounded-2xl active:scale-95 transition-transform relative overflow-hidden"
                style={{ height: 90 }}
              >
                <img src={SLIDE(slide)} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,35,70,0.70)' }} />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <Icon size={24} color="rgba(255,255,255,0.92)" strokeWidth={1.8} />
                  <span className="text-[10px] font-black tracking-widest" style={{ color: '#ffffff', letterSpacing: '0.10em' }}>{label}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* News — full-width card */}
          {isRealAuth && (
            <Link
              to="/news"
              className="flex items-center gap-4 rounded-2xl px-5 py-4 active:scale-[0.98] transition-transform mt-2 bg-white border border-slate-100 shadow-sm"
            >
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'rgba(30,92,151,0.12)' }}>
                <Newspaper className="size-5 text-[#1e5c97]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black tracking-wide uppercase text-slate-800">News</p>
                <p className="text-xs mt-0.5 text-slate-400">What's happening at ProSwim</p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-slate-300" />
            </Link>
          )}

          {/* Skills Checklist — full-width card */}
          {isRealAuth && (
            <Link
              to="/checklist"
              className="flex items-center gap-4 rounded-2xl px-5 py-4 active:scale-[0.98] transition-transform mt-2 bg-white border border-slate-100 shadow-sm"
            >
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'rgba(52,211,153,0.18)' }}>
                <Target className="size-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black tracking-wide uppercase text-slate-800">Skills Checklist</p>
                <p className="text-xs mt-0.5 text-slate-400">Track your skill progress</p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-slate-300" />
            </Link>
          )}
        </div>

        {/* Segmented tabs */}
        <div className="bg-white rounded-2xl p-1 flex gap-1 border border-slate-100 shadow-sm">
          <TabButton active={activeTab === 'courses'} onClick={() => setActiveTab('courses')}>
            {isRealAuth ? 'Group Registrations' : 'My Courses'}
          </TabButton>
          {isRealAuth && privatePackages.length > 0 && (
            <TabButton active={activeTab === 'payments'} onClick={() => setActiveTab('payments')}>
              Private Packages
            </TabButton>
          )}
          {!isRealAuth && (
            <TabButton active={activeTab === 'times'} onClick={() => setActiveTab('times')}>
              Swim Times
            </TabButton>
          )}
        </div>

        {activeTab === 'courses' && (
          <>
            {isRealAuth ? (
              <div className="space-y-3">
                {apiCourses.length === 0 && !apiError && (
                  <div className="text-center py-10 text-slate-400 text-sm">
                    No registrations found.
                  </div>
                )}
                {apiCourses.map((course) => (
                  <ApiCourseCard
                    key={course.id}
                    course={course}
                    isExpanded={expandedCourse === String(course.id)}
                    onToggle={() =>
                      setExpandedCourse(expandedCourse === String(course.id) ? null : String(course.id))
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {mockCourses.map((course) => (
                  <MockCourseCard
                    key={course.id}
                    course={course}
                    isExpanded={expandedCourse === course.id}
                    onToggle={() =>
                      setExpandedCourse(expandedCourse === course.id ? null : course.id)
                    }
                  />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'payments' && isRealAuth && (
          <div className="space-y-3">
            {privatePackages.map((pkg) => (
              <PrivatePackageCard key={pkg.packageId} pkg={pkg} />
            ))}
          </div>
        )}

        {activeTab === 'times' && !isRealAuth && (
          <div>
            <p className="text-sm font-bold mb-4 text-[#1e5c97] flex items-center gap-2">
              <Target className="size-5 text-[#1e5c97]" />
              Swim Times & PBs
            </p>
            <SwimTimes studentEmail={userEmail} />
          </div>
        )}

        {activeTab === 'courses' && !isRealAuth && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
            <p className="text-sm font-bold mb-2 text-blue-900">Progress Tips</p>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex gap-2"><span>•</span><span>Practice regularly to improve faster</span></li>
              <li className="flex gap-2"><span>•</span><span>Focus on technique over speed</span></li>
              <li className="flex gap-2"><span>•</span><span>Ask your coach for feedback</span></li>
            </ul>
          </div>
        )}
      </div>

      <MobileNav />
    </div>
  );
}

interface ApiCourseCardProps {
  course: ApiCourse;
  isExpanded: boolean;
  onToggle: () => void;
}

function ApiCourseCard({ course, isExpanded, onToggle }: ApiCourseCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-5 text-left active:bg-blue-50 transition-colors"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-[#1e5c97] mb-1.5">
              {course.names.join(' / ')}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-block px-2 py-0.5 bg-blue-50 text-[#1e5c97] rounded-full text-xs font-medium">
                {course.semester}
              </span>
              {course.stopped && (
                <span className="inline-block px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-xs font-medium">
                  Stopped
                </span>
              )}
            </div>
          </div>
          <ChevronRight
            className={`size-5 text-slate-300 transition-transform shrink-0 ml-2 ${isExpanded ? 'rotate-90' : ''}`}
          />
        </div>

        {course.location && (
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
            <MapPin className="size-4 text-[#1e5c97] shrink-0" />
            <span>{course.location}</span>
          </div>
        )}

        {course.attendancePercent != null && (
          <div className="mt-1">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs text-slate-400">Attendance</span>
              <span className="num-stat text-xs font-bold text-[#1e5c97]">
                {course.attendancePercent}%
              </span>
            </div>
            <Progress value={course.attendancePercent} className="h-1.5" />
          </div>
        )}
      </button>

      {isExpanded && (
        <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Sessions attended</span>
            <span className="text-slate-900 font-semibold">{course.attendedSessions} / {course.totalSessions}</span>
          </div>
          {course.location && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Location</span>
              <span className="text-slate-900 font-semibold">{course.location}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PrivatePackageCard({ pkg }: { pkg: PrivatePackageDto }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-base font-semibold text-[#1e5c97]">{pkg.packageName}</p>
          {pkg.coachFullName && (
            <p className="text-sm text-slate-400 mt-0.5">Coach: {pkg.coachFullName}</p>
          )}
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
          pkg.packageStatus === 'Active'
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-slate-100 text-slate-600'
        }`}>
          {pkg.packageStatus}
        </span>
      </div>

      {pkg.locationNickName && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <MapPin className="size-4 text-[#1e5c97] shrink-0" />
          <span>{pkg.locationNickName}</span>
        </div>
      )}

      <div className="flex justify-between text-sm pt-1 border-t border-slate-100">
        <span className="text-slate-400">Net to pay</span>
        <span className="text-slate-900 font-bold">
          {pkg.packageNetToPay} {pkg.packageCurrency}
        </span>
      </div>
    </div>
  );
}

interface MockCourseCardProps {
  course: MockCourse;
  isExpanded: boolean;
  onToggle: () => void;
}

function MockCourseCard({ course, isExpanded, onToggle }: MockCourseCardProps) {
  const nextClassDate = new Date(course.nextClass);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-5 text-left active:bg-blue-50 transition-colors"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-[#1e5c97] mb-1.5">{course.name}</p>
            <span className="inline-block px-2 py-0.5 bg-blue-50 text-[#1e5c97] rounded-full text-xs font-medium">
              {course.level}
            </span>
          </div>
          <ChevronRight
            className={`size-5 text-slate-300 transition-transform shrink-0 ml-2 ${isExpanded ? 'rotate-90' : ''}`}
          />
        </div>

        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Clock className="size-4 text-[#1e5c97] shrink-0" />
            <span>{course.schedule}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Calendar className="size-4 text-[#1e5c97] shrink-0" />
            <span>
              Next:{' '}
              {nextClassDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-slate-400">Progress</span>
            <span className="text-xs font-bold text-[#1e5c97]">{course.progress}%</span>
          </div>
          <Progress value={course.progress} className="h-1.5" />
        </div>
      </button>

      {isExpanded && (
        <div className="px-5 pb-5 border-t border-slate-100 pt-4">
          <div className="mb-4 space-y-1.5">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <MapPin className="size-4 text-[#1e5c97] shrink-0" />
              <span>{course.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Users className="size-4 text-[#1e5c97] shrink-0" />
              <span>{course.instructor}</span>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 mb-3">Skills Progress</p>
            <div className="space-y-2">
              {course.skills.map((skill, index) => {
                const done = course.completedSkills.includes(skill);
                return (
                  <div
                    key={index}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl text-sm ${
                      done
                        ? 'bg-blue-50'
                        : 'bg-slate-50'
                    }`}
                  >
                    <span className={`text-sm font-bold shrink-0 ${done ? 'text-[#1e5c97]' : 'text-slate-300'}`}>
                      {done ? '✓' : '○'}
                    </span>
                    <span className={done ? 'text-[#1e5c97] font-medium' : 'text-slate-400'}>
                      {skill}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function TabButton({ active, onClick, children }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${
        active
          ? 'text-white shadow-sm'
          : 'text-slate-400'
      }`}
      style={active ? { background: 'linear-gradient(135deg,rgba(91,173,255,0.55) 0%,rgba(59,130,246,0.55) 100%)' } : undefined}
    >
      {children}
    </button>
  );
}

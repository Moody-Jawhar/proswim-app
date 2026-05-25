import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MobileHeader } from '../components/MobileHeader';
import { MobileNav } from '../components/MobileNav';
import {
  Calendar, Clock, MapPin, Award, TrendingUp, Users, ChevronRight,
  Target, AlertCircle, Loader2, BookOpen, Info, User
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

const QUICK_TILES = [
  { icon: BookOpen, label: 'Programs',  href: '/programs',  bg: 'bg-sky-100 dark:bg-sky-900/30',      color: 'text-sky-600 dark:text-sky-400'   },
  { icon: MapPin,   label: 'Locations', href: '/locations', bg: 'bg-emerald-100 dark:bg-emerald-900/30', color: 'text-emerald-600 dark:text-emerald-400' },
  { icon: User,     label: 'Profile',   href: '/profile',   bg: 'bg-violet-100 dark:bg-violet-900/30', color: 'text-violet-600 dark:text-violet-400' },
  { icon: Award,    label: 'Progress',  href: '/profile',   bg: 'bg-amber-100 dark:bg-amber-900/30',   color: 'text-amber-500 dark:text-amber-400'  },
  { icon: Calendar, label: 'Schedule',  href: '/programs',  bg: 'bg-blue-100 dark:bg-blue-900/30',     color: 'text-[#0B4F8C] dark:text-blue-400'  },
  { icon: Info,     label: 'About',     href: '/about',     bg: 'bg-rose-100 dark:bg-rose-900/30',     color: 'text-rose-500 dark:text-rose-400'    },
];

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

  const activeCourses = apiCourses.filter((c) => !c.stopped).length;
  const avgAttendance = apiCourses.length > 0
    ? Math.round(
        apiCourses
          .filter((c) => c.attendancePercent != null)
          .reduce((s, c) => s + (c.attendancePercent ?? 0), 0) /
          Math.max(1, apiCourses.filter((c) => c.attendancePercent != null).length)
      )
    : 0;

  const overallProgress = mockCourses.length > 0
    ? Math.round(mockCourses.reduce((s, c) => s + c.progress, 0) / mockCourses.length)
    : 0;

  if (apiLoading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] dark:bg-[#0D1B2A] pb-20">
        <MobileHeader title="My Dashboard" showSignOut={true} />
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <Loader2 className="size-8 text-[#0B4F8C] animate-spin" />
          <p className="text-sm text-slate-500">Loading your data...</p>
        </div>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-[#0D1B2A] pb-20">
      <MobileHeader title="My Dashboard" showSignOut={true} />

      {/* Welcome card */}
      <div className="px-4 pt-4 pb-0">
        <div className="bg-[#0B4F8C] rounded-2xl px-5 py-5 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />
          <div className="absolute -bottom-6 -left-4 w-24 h-24 bg-white/5 rounded-full pointer-events-none" />
          <p className="text-xs font-medium relative" style={{ color: "rgba(255,255,255,0.6)" }}>Welcome back</p>
          <p className="text-2xl font-bold mt-0.5 relative" style={{ color: "#ffffff" }}>Hi, {firstName}! 👋</p>
          {currentLevel && (
            <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 rounded-full relative">
              <Award className="size-3.5" style={{ color: "rgba(255,255,255,0.85)" }} />
              <span className="text-xs font-semibold" style={{ color: "#ffffff" }}>{currentLevel}</span>
            </div>
          )}
          {isRealAuth && profile?.locationNickName && (
            <p className="text-xs mt-2 relative flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>
              <MapPin className="size-3.5" />
              {profile.locationNickName}
            </p>
          )}
          {!isRealAuth && (
            <p className="text-sm mt-1.5 relative" style={{ color: "rgba(255,255,255,0.7)" }}>
              Track your progress and view upcoming classes
            </p>
          )}
        </div>
      </div>

      <div className="px-4 mt-4 space-y-4">

        {/* Floating stat card */}
        <div className="bg-white dark:bg-[#162032] rounded-2xl shadow-sm border border-slate-100 dark:border-[#1E2F45] overflow-hidden">
          {isRealAuth ? (
            <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-[#1E2F45]">
              <FloatStat
                icon={<Award className="size-4 text-[#0B4F8C] dark:text-blue-400" />}
                bg="bg-blue-50 dark:bg-blue-900/20"
                value={`${avgAttendance}%`}
                label="Attendance"
              />
              <FloatStat
                icon={<Calendar className="size-4 text-sky-500" />}
                bg="bg-sky-50 dark:bg-sky-900/20"
                value={activeCourses.toString()}
                label="Active"
              />
              <FloatStat
                icon={<TrendingUp className="size-4 text-violet-500" />}
                bg="bg-violet-50 dark:bg-violet-900/20"
                value={privatePackages.length.toString()}
                label="Private"
              />
            </div>
          ) : (
            <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-[#1E2F45]">
              <FloatStat
                icon={<Award className="size-4 text-[#0B4F8C] dark:text-blue-400" />}
                bg="bg-blue-50 dark:bg-blue-900/20"
                value={`${overallProgress}%`}
                label="Progress"
              />
              <FloatStat
                icon={<Calendar className="size-4 text-sky-500" />}
                bg="bg-sky-50 dark:bg-sky-900/20"
                value={mockCourses.length.toString()}
                label="Courses"
              />
              <FloatStat
                icon={<TrendingUp className="size-4 text-violet-500" />}
                bg="bg-violet-50 dark:bg-violet-900/20"
                value={mockCourses.reduce((s, c) => s + c.completedSkills.length, 0).toString()}
                label="Skills"
              />
            </div>
          )}
        </div>

        {apiError && (
          <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
            <AlertCircle className="size-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-400">{apiError}</p>
          </div>
        )}

        {/* Quick Access grid */}
        <div>
          <p className="text-base font-semibold text-slate-900 dark:text-white mb-3">Quick Access</p>
          <div className="grid grid-cols-3 gap-3">
            {QUICK_TILES.map(({ icon: Icon, label, href, bg, color }) => (
              <Link
                key={label}
                to={href}
                className="bg-white dark:bg-[#162032] rounded-2xl py-4 px-2 flex flex-col items-center gap-2 border border-slate-100 dark:border-[#1E2F45] shadow-sm active:scale-95 transition-transform"
              >
                <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center`}>
                  <Icon className={`size-5 ${color}`} />
                </div>
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 text-center leading-tight">{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Segmented tabs */}
        <div className="bg-white dark:bg-[#162032] rounded-2xl p-1 flex gap-1 border border-slate-100 dark:border-[#1E2F45] shadow-sm">
          <TabButton active={activeTab === 'courses'} onClick={() => setActiveTab('courses')}>
            {isRealAuth ? 'Registrations' : 'My Courses'}
          </TabButton>
          {isRealAuth && privatePackages.length > 0 && (
            <TabButton active={activeTab === 'payments'} onClick={() => setActiveTab('payments')}>
              Private
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
            <p className="text-sm font-bold mb-4 text-[#0B4F8C] dark:text-white flex items-center gap-2">
              <Target className="size-5 text-[#0B4F8C]" />
              Swim Times & PBs
            </p>
            <SwimTimes studentEmail={userEmail} />
          </div>
        )}

        {activeTab === 'courses' && !isRealAuth && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-5">
            <p className="text-sm font-bold mb-2 text-blue-900 dark:text-blue-300">Progress Tips</p>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
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
    <div className="bg-white dark:bg-[#162032] rounded-2xl border border-slate-100 dark:border-[#1E2F45] shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-5 text-left active:bg-blue-50 dark:active:bg-[#1E2F45] transition-colors"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-[#0B4F8C] dark:text-white mb-1.5">
              {course.names.join(' / ')}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-block px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-[#0B4F8C] dark:text-blue-400 rounded-full text-xs font-medium">
                {course.semester}
              </span>
              {course.stopped && (
                <span className="inline-block px-2 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full text-xs font-medium">
                  Stopped
                </span>
              )}
            </div>
          </div>
          <ChevronRight
            className={`size-5 text-slate-300 dark:text-slate-500 transition-transform shrink-0 ml-2 ${isExpanded ? 'rotate-90' : ''}`}
          />
        </div>

        {course.location && (
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-3">
            <MapPin className="size-4 text-[#0B4F8C] dark:text-blue-400 shrink-0" />
            <span>{course.location}</span>
          </div>
        )}

        {course.attendancePercent != null && (
          <div className="mt-1">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs text-slate-400 dark:text-slate-500">Attendance</span>
              <span className="text-xs font-bold text-[#0B4F8C] dark:text-blue-400">
                {course.attendancePercent}%
              </span>
            </div>
            <Progress value={course.attendancePercent} className="h-1.5" />
          </div>
        )}
      </button>

      {isExpanded && (
        <div className="px-5 pb-5 border-t border-slate-100 dark:border-[#1E2F45] pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400 dark:text-slate-500">Sessions attended</span>
            <span className="text-slate-900 dark:text-white font-semibold">{course.attendedSessions} / {course.totalSessions}</span>
          </div>
          {course.location && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 dark:text-slate-500">Location</span>
              <span className="text-slate-900 dark:text-white font-semibold">{course.location}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PrivatePackageCard({ pkg }: { pkg: PrivatePackageDto }) {
  const progress = pkg.packageNumberOfSessions > 0
    ? Math.round((pkg.sessionsAttended / pkg.packageNumberOfSessions) * 100)
    : 0;

  return (
    <div className="bg-white dark:bg-[#162032] rounded-2xl border border-slate-100 dark:border-[#1E2F45] shadow-sm p-5 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-base font-semibold text-[#0B4F8C] dark:text-white">{pkg.packageName}</p>
          {pkg.coachFullName && (
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">Coach: {pkg.coachFullName}</p>
          )}
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
          pkg.packageStatus === 'Active'
            ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
            : 'bg-slate-100 dark:bg-[#0D2847] text-slate-600 dark:text-slate-400'
        }`}>
          {pkg.packageStatus}
        </span>
      </div>

      {pkg.locationNickName && (
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <MapPin className="size-4 text-[#0B4F8C] dark:text-blue-400 shrink-0" />
          <span>{pkg.locationNickName}</span>
        </div>
      )}

      <div>
        <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mb-1.5">
          <span>Sessions: {pkg.sessionsAttended} / {pkg.packageNumberOfSessions}</span>
          <span>{pkg.sessionsRemaining} remaining</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      <div className="flex justify-between text-sm pt-1 border-t border-slate-100 dark:border-[#1E2F45]">
        <span className="text-slate-400 dark:text-slate-500">Net to pay</span>
        <span className="text-slate-900 dark:text-white font-bold">
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
    <div className="bg-white dark:bg-[#162032] rounded-2xl border border-slate-100 dark:border-[#1E2F45] shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-5 text-left active:bg-blue-50 dark:active:bg-[#1E2F45] transition-colors"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-[#0B4F8C] dark:text-white mb-1.5">{course.name}</p>
            <span className="inline-block px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-[#0B4F8C] dark:text-blue-400 rounded-full text-xs font-medium">
              {course.level}
            </span>
          </div>
          <ChevronRight
            className={`size-5 text-slate-300 dark:text-slate-500 transition-transform shrink-0 ml-2 ${isExpanded ? 'rotate-90' : ''}`}
          />
        </div>

        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Clock className="size-4 text-[#0B4F8C] dark:text-blue-400 shrink-0" />
            <span>{course.schedule}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Calendar className="size-4 text-[#0B4F8C] dark:text-blue-400 shrink-0" />
            <span>
              Next:{' '}
              {nextClassDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-slate-400 dark:text-slate-500">Progress</span>
            <span className="text-xs font-bold text-[#0B4F8C] dark:text-blue-400">{course.progress}%</span>
          </div>
          <Progress value={course.progress} className="h-1.5" />
        </div>
      </button>

      {isExpanded && (
        <div className="px-5 pb-5 border-t border-slate-100 dark:border-[#1E2F45] pt-4">
          <div className="mb-4 space-y-1.5">
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <MapPin className="size-4 text-[#0B4F8C] dark:text-blue-400 shrink-0" />
              <span>{course.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Users className="size-4 text-[#0B4F8C] dark:text-blue-400 shrink-0" />
              <span>{course.instructor}</span>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">Skills Progress</p>
            <div className="space-y-2">
              {course.skills.map((skill, index) => {
                const done = course.completedSkills.includes(skill);
                return (
                  <div
                    key={index}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl text-sm ${
                      done
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : 'bg-slate-50 dark:bg-[#1E2F45]/30'
                    }`}
                  >
                    <span className={`text-sm font-bold shrink-0 ${done ? 'text-[#0B4F8C] dark:text-blue-400' : 'text-slate-300 dark:text-slate-600'}`}>
                      {done ? '✓' : '○'}
                    </span>
                    <span className={done ? 'text-[#0B4F8C] dark:text-blue-300 font-medium' : 'text-slate-400 dark:text-slate-500'}>
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

interface FloatStatProps {
  icon: React.ReactNode;
  bg: string;
  value: string;
  label: string;
}

function FloatStat({ icon, bg, value, label }: FloatStatProps) {
  return (
    <div className="flex flex-col items-center py-4 px-2 gap-2">
      <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
        {icon}
      </div>
      <p className="text-lg font-extrabold text-[#0B4F8C] dark:text-white leading-none">{value}</p>
      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{label}</p>
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
          ? 'bg-[#0B4F8C] text-white shadow-sm'
          : 'text-slate-400 dark:text-slate-500'
      }`}
    >
      {children}
    </button>
  );
}

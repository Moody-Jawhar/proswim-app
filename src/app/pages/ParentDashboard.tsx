import { MobileHeader } from '../components/MobileHeader';
import { MobileNav } from '../components/MobileNav';
import { Calendar, Clock, MapPin, Award, TrendingUp, DollarSign, ChevronRight, User, CreditCard, AlertCircle } from 'lucide-react';
import { Progress } from '../components/Progress';
import { useState } from 'react';

interface Child {
  id: string;
  name: string;
  age: number;
  courses: Course[];
}

interface Course {
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

interface Payment {
  monthlyFee: number;
  dueDate: string;
  lastPayment: string;
  isPaid: boolean;
}

interface ParentDashboardProps {
  userName: string;
}

export function ParentDashboard({ userName }: ParentDashboardProps) {
  const [expandedChild, setExpandedChild] = useState<string | null>(null);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  // Mock data for parent's children
  const children: Child[] = [
    {
      id: '1',
      name: 'Layla Khalil',
      age: 8,
      courses: [
        {
          id: '1',
          name: 'Fundamentals - Dolphin',
          level: 'Beginner 3',
          schedule: 'Tue & Thu, 3:30 PM',
          location: 'Beirut Center',
          instructor: 'Coach Sarah',
          nextClass: '2025-01-07',
          progress: 65,
          skills: [
            'Front crawl 15m',
            'Backstroke 15m',
            'Treading water 30 sec',
            'Underwater swimming 5m',
            'Streamline position',
            'Flip turn basics'
          ],
          completedSkills: [
            'Front crawl 15m',
            'Backstroke 15m',
            'Treading water 30 sec',
            'Underwater swimming 5m'
          ]
        }
      ]
    },
    {
      id: '2',
      name: 'Omar Khalil',
      age: 5,
      courses: [
        {
          id: '2',
          name: 'Active Start - Seal',
          level: 'Beginner 1',
          schedule: 'Saturday, 10:00 AM',
          location: 'Beirut Center',
          instructor: 'Coach Rami',
          nextClass: '2025-01-04',
          progress: 80,
          skills: [
            'Water confidence',
            'Floating on back',
            'Kicking with kickboard',
            'Blowing bubbles',
            'Underwater exploration',
            'Safe pool entry'
          ],
          completedSkills: [
            'Water confidence',
            'Floating on back',
            'Kicking with kickboard',
            'Blowing bubbles',
            'Safe pool entry'
          ]
        }
      ]
    }
  ];

  const payment: Payment = {
    monthlyFee: 320,
    dueDate: '2025-01-15',
    lastPayment: '2024-12-10',
    isPaid: false
  };

  const firstName = userName.split(' ')[0];
  const totalCourses = children.reduce((sum, child) => sum + child.courses.length, 0);
  const averageProgress = children.reduce((sum, child) => 
    sum + child.courses.reduce((cSum, course) => cSum + course.progress, 0) / child.courses.length, 0
  ) / children.length;

  return (
    <div className="min-h-screen bg-white pb-20">
      <MobileHeader title="Parent Dashboard" showSignOut={true} />
      
      <div className="px-4 py-6 space-y-6">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-[#0B4F8C] to-[#1a6bb8] rounded-2xl p-6 text-white shadow-xl">
          <h1 className="text-2xl mb-2">Hi {firstName}! 👋</h1>
          <p className="text-blue-100">
            Monitor your children's progress and manage payments
          </p>
        </div>

        {/* Payment Card */}
        <div className={`rounded-2xl p-5 shadow-lg border-2 ${
          payment.isPaid 
            ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300' 
            : 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300'
        }`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${
                payment.isPaid ? 'bg-blue-200' : 'bg-orange-200'
              }`}>
                <CreditCard className={`size-6 ${
                  payment.isPaid ? 'text-blue-700' : 'text-orange-700'
                }`} />
              </div>
              <div>
                <h3 className="text-lg text-gray-900">Monthly Payment</h3>
                <p className="text-sm text-gray-600">
                  {payment.isPaid ? 'Paid' : 'Payment Due'}
                </p>
              </div>
            </div>
            {!payment.isPaid && (
              <AlertCircle className="size-6 text-orange-600" />
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Monthly Fee:</span>
              <span className="text-2xl text-gray-900">${payment.monthlyFee}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-700">Due Date:</span>
              <span className="text-gray-900">
                {new Date(payment.dueDate).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-700">Last Payment:</span>
              <span className="text-gray-900">
                {new Date(payment.lastPayment).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>

          {!payment.isPaid && (
            <button className="w-full mt-4 px-4 py-3 bg-[#0B4F8C] text-white rounded-xl active:scale-95 transition-transform shadow-lg">
              Pay Now
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            icon={<User className="size-6 text-blue-600" />}
            value={children.length.toString()}
            label="Children"
          />
          <StatCard
            icon={<Award className="size-6 text-blue-500" />}
            value={`${Math.round(averageProgress)}%`}
            label="Avg Progress"
          />
          <StatCard
            icon={<Calendar className="size-6 text-blue-700" />}
            value={totalCourses.toString()}
            label="Courses"
          />
        </div>

        {/* Children */}
        <div>
          <h2 className="text-2xl mb-4 text-gray-900">My Children</h2>
          <div className="space-y-4">
            {children.map((child) => (
              <ChildCard 
                key={child.id}
                child={child}
                isExpanded={expandedChild === child.id}
                onToggle={() => setExpandedChild(expandedChild === child.id ? null : child.id)}
                expandedCourse={expandedCourse}
                onCourseToggle={setExpandedCourse}
              />
            ))}
          </div>
        </div>

        {/* Parent Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
          <h3 className="text-lg mb-3 text-blue-900">Parent Tips</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex gap-2">
              <span>•</span>
              <span>Encourage consistent practice at home</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Arrive 10 minutes early for classes</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Contact coaches with any concerns</span>
            </li>
          </ul>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
      <div className="mb-2">{icon}</div>
      <div className="text-2xl mb-1 text-gray-900">{value}</div>
      <div className="text-xs text-gray-600">{label}</div>
    </div>
  );
}

interface ChildCardProps {
  child: Child;
  isExpanded: boolean;
  onToggle: () => void;
  expandedCourse: string | null;
  onCourseToggle: (courseId: string | null) => void;
}

function ChildCard({ child, isExpanded, onToggle, expandedCourse, onCourseToggle }: ChildCardProps) {
  const avgProgress = child.courses.reduce((sum, c) => sum + c.progress, 0) / child.courses.length;
  
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <button 
        onClick={onToggle}
        className="w-full p-5 text-left active:bg-gray-50 transition-colors"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg text-gray-900 mb-1">{child.name}</h3>
            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs">
              {child.age} years old
            </span>
          </div>
          <ChevronRight className={`size-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Overall Progress</span>
              <span className="text-sm text-[#0B4F8C]">{Math.round(avgProgress)}%</span>
            </div>
            <Progress value={avgProgress} className="h-2" />
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-3">
          <h4 className="text-sm text-gray-900 mb-2">Enrolled Courses</h4>
          {child.courses.map((course) => (
            <CourseCard 
              key={course.id}
              course={course}
              isExpanded={expandedCourse === course.id}
              onToggle={() => onCourseToggle(expandedCourse === course.id ? null : course.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface CourseCardProps {
  course: Course;
  isExpanded: boolean;
  onToggle: () => void;
}

function CourseCard({ course, isExpanded, onToggle }: CourseCardProps) {
  const nextClassDate = new Date(course.nextClass);
  
  return (
    <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
      <button 
        onClick={onToggle}
        className="w-full p-4 text-left active:bg-gray-100 transition-colors"
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h5 className="text-sm text-gray-900 mb-1">{course.name}</h5>
            <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
              {course.level}
            </span>
          </div>
          <ChevronRight className={`size-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="size-3 text-[#0B4F8C]" />
            <span>{course.schedule}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="size-3 text-[#0B4F8C]" />
            <span>Next: {nextClassDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        </div>

        <div className="mt-3">
          <Progress value={course.progress} className="h-1.5" />
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-200 pt-3">
          <div className="mb-3">
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-1.5">
              <MapPin className="size-3 text-[#0B4F8C]" />
              <span>{course.location}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <User className="size-3 text-[#0B4F8C]" />
              <span>{course.instructor}</span>
            </div>
          </div>

          <div>
            <h6 className="text-xs text-gray-900 mb-2">Skills Progress</h6>
            <div className="space-y-1.5">
              {course.skills.map((skill, index) => {
                const isCompleted = course.completedSkills.includes(skill);
                return (
                  <div
                    key={index}
                    className={`flex items-center gap-2 p-1.5 rounded text-xs ${
                      isCompleted ? 'bg-blue-50' : 'bg-white'
                    }`}
                  >
                    <span className={`text-sm ${isCompleted ? 'text-blue-700' : 'text-gray-400'}`}>
                      {isCompleted ? '✓' : '○'}
                    </span>
                    <span className={isCompleted ? 'text-blue-800' : 'text-gray-600'}>
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
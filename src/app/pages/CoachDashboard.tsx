import { MobileHeader } from '../components/MobileHeader';
import { MobileNav } from '../components/MobileNav';
import { Calendar, Clock, MapPin, Users, ChevronRight, TrendingUp, Award, CheckCircle2 } from 'lucide-react';
import { Progress } from '../components/Progress';
import { useState } from 'react';

interface Student {
  id: string;
  name: string;
  age: number;
  level: string;
  course: string;
  progress: number;
  attendance: number;
  skills: string[];
  completedSkills: string[];
  parentName: string;
  parentEmail: string;
  nextClass: string;
}

interface CoachDashboardProps {
  userName: string;
}

export function CoachDashboard({ userName }: CoachDashboardProps) {
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<Record<string, string[]>>({});

  // Mock data for coach's students
  const students: Student[] = [
    {
      id: '1',
      name: 'Layla Khalil',
      age: 8,
      level: 'Beginner 3',
      course: 'Fundamentals - Dolphin',
      progress: 65,
      attendance: 90,
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
      ],
      parentName: 'Rania Khalil',
      parentEmail: 'parent@example.com',
      nextClass: '2025-01-07'
    },
    {
      id: '2',
      name: 'Sanad Alaghbar',
      age: 10,
      level: 'Beginner 3',
      course: 'Fundamentals - Dolphin',
      progress: 45,
      attendance: 85,
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
        'Treading water 30 sec'
      ],
      parentName: 'Ahmad Alaghbar',
      parentEmail: 'sanadalaghbar@gmail.com',
      nextClass: '2025-01-07'
    },
    {
      id: '3',
      name: 'Maya Hassan',
      age: 9,
      level: 'Beginner 3',
      course: 'Fundamentals - Dolphin',
      progress: 75,
      attendance: 95,
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
        'Underwater swimming 5m',
        'Streamline position'
      ],
      parentName: 'Fatima Hassan',
      parentEmail: 'fhassan@example.com',
      nextClass: '2025-01-07'
    },
    {
      id: '4',
      name: 'Ziad Mansour',
      age: 7,
      level: 'Beginner 2',
      course: 'Active Start - Turtle',
      progress: 55,
      attendance: 80,
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
        'Kicking with kickboard'
      ],
      parentName: 'Karim Mansour',
      parentEmail: 'kmansour@example.com',
      nextClass: '2025-01-07'
    }
  ];

  const firstName = userName.split(' ')[1] || userName.split(' ')[0]; // Get "Sarah" from "Coach Sarah"
  const avgProgress = students.reduce((sum, s) => sum + s.progress, 0) / students.length;
  const avgAttendance = students.reduce((sum, s) => sum + s.attendance, 0) / students.length;

  const toggleSkill = (studentId: string, skill: string) => {
    setSelectedSkills(prev => {
      const current = prev[studentId] || [];
      const isSelected = current.includes(skill);
      
      return {
        ...prev,
        [studentId]: isSelected 
          ? current.filter(s => s !== skill)
          : [...current, skill]
      };
    });
  };

  const handleSaveProgress = (studentId: string) => {
    // In a real app, this would save to the backend
    alert(`Progress saved for student ${studentId}!`);
    setSelectedSkills(prev => ({ ...prev, [studentId]: [] }));
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <MobileHeader title="Coach Dashboard" showSignOut={true} />
      
      <div className="px-4 py-6 space-y-6">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-[#1e5c97] to-[#1a6bb8] rounded-2xl p-6 text-white shadow-xl">
          <h1 className="text-2xl mb-2">Hi Coach {firstName}! 👋</h1>
          <p className="text-blue-100">
            Track your students' progress and manage sessions
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            icon={<Users className="size-6 text-blue-600" />}
            value={students.length.toString()}
            label="Students"
          />
          <StatCard
            icon={<TrendingUp className="size-6 text-blue-500" />}
            value={`${Math.round(avgProgress)}%`}
            label="Avg Progress"
          />
          <StatCard
            icon={<CheckCircle2 className="size-6 text-blue-700" />}
            value={`${Math.round(avgAttendance)}%`}
            label="Attendance"
          />
        </div>

        {/* My Students */}
        <div>
          <h2 className="text-2xl mb-4 text-gray-900">My Students</h2>
          <div className="space-y-4">
            {students.map((student) => (
              <StudentCard 
                key={student.id}
                student={student}
                isExpanded={expandedStudent === student.id}
                onToggle={() => setExpandedStudent(expandedStudent === student.id ? null : student.id)}
                selectedSkills={selectedSkills[student.id] || []}
                onToggleSkill={toggleSkill}
                onSaveProgress={handleSaveProgress}
              />
            ))}
          </div>
        </div>

        {/* Coach Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
          <h3 className="text-lg mb-3 text-blue-900">Coaching Tips</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex gap-2">
              <span>•</span>
              <span>Update progress after each session</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Communicate with parents regularly</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Focus on technique before speed</span>
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

interface StudentCardProps {
  student: Student;
  isExpanded: boolean;
  onToggle: () => void;
  selectedSkills: string[];
  onToggleSkill: (studentId: string, skill: string) => void;
  onSaveProgress: (studentId: string) => void;
}

function StudentCard({ student, isExpanded, onToggle, selectedSkills, onToggleSkill, onSaveProgress }: StudentCardProps) {
  const nextClassDate = new Date(student.nextClass);
  const hasChanges = selectedSkills.length > 0;
  
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <button 
        onClick={onToggle}
        className="w-full p-5 text-left active:bg-gray-50 transition-colors"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg text-gray-900 mb-1">{student.name}</h3>
            <div className="flex gap-2">
              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs">
                {student.level}
              </span>
              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs">
                {student.age} yrs
              </span>
            </div>
          </div>
          <ChevronRight className={`size-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Award className="size-4 text-[#1e5c97]" />
            <span>{student.course}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="size-4 text-[#1e5c97]" />
            <span>Next: {nextClassDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Progress</span>
            <span className="text-sm text-[#1e5c97]">{student.progress}%</span>
          </div>
          <Progress value={student.progress} className="h-2" />
        </div>
      </button>

      {isExpanded && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4">
          {/* Student Info */}
          <div className="mb-4 p-3 bg-gray-50 rounded-xl">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Attendance:</span>
                <span className="ml-2 text-gray-900">{student.attendance}%</span>
              </div>
              <div>
                <span className="text-gray-600">Progress:</span>
                <span className="ml-2 text-gray-900">{student.progress}%</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Parent:</span>
                <span className="ml-2 text-gray-900">{student.parentName}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Email:</span>
                <span className="ml-2 text-blue-700 text-xs">{student.parentEmail}</span>
              </div>
            </div>
          </div>

          {/* Skills Tracking */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm text-gray-900">Track Skills Progress</h4>
              {hasChanges && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSaveProgress(student.id);
                  }}
                  className="px-3 py-1.5 bg-[#1e5c97] text-white rounded-lg text-xs active:scale-95 transition-transform"
                >
                  Save Changes
                </button>
              )}
            </div>
            <div className="space-y-2">
              {student.skills.map((skill, index) => {
                const isCompleted = student.completedSkills.includes(skill);
                const isNewlySelected = selectedSkills.includes(skill);
                const willBeCompleted = isCompleted || isNewlySelected;
                
                return (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isCompleted) {
                        onToggleSkill(student.id, skill);
                      }
                    }}
                    disabled={isCompleted}
                    className={`w-full flex items-center gap-2 p-2 rounded-lg text-sm transition-all ${
                      isCompleted 
                        ? 'bg-blue-50 cursor-default' 
                        : isNewlySelected
                        ? 'bg-blue-100 active:scale-95'
                        : 'bg-gray-50 active:scale-95'
                    }`}
                  >
                    <span className={`text-base ${
                      willBeCompleted ? 'text-blue-700' : 'text-gray-400'
                    }`}>
                      {willBeCompleted ? '✓' : '○'}
                    </span>
                    <span className={`flex-1 text-left ${
                      willBeCompleted ? 'text-blue-800' : 'text-gray-600'
                    }`}>
                      {skill}
                    </span>
                    {isNewlySelected && (
                      <span className="text-xs text-blue-700 bg-blue-200 px-2 py-0.5 rounded">
                        New
                      </span>
                    )}
                    {isCompleted && (
                      <span className="text-xs text-blue-700">
                        Completed
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
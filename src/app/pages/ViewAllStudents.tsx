import { MobileHeader } from '../components/MobileHeader';
import { MobileNav } from '../components/MobileNav';
import { Search,  Download, Mail, Phone, Calendar, Trophy, User } from 'lucide-react';
import { useState } from 'react';

interface Student {
  id: string;
  name: string;
  age: number;
  level: string;
  coach: string;
  progress: number;
  attendance: number;
  status: 'active' | 'inactive';
  email: string;
  phone: string;
  parentName: string;
  enrollmentDate: string;
  nextClass: string;
  achievements: number;
}

export function ViewAllStudents() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Mock data - replace with real database data
  const allStudents: Student[] = [
    {
      id: '1',
      name: 'Sanad Alaghbar',
      age: 8,
      level: 'Intermediate 2',
      coach: 'Rania Khalil',
      progress: 85,
      attendance: 92,
      status: 'active',
      email: 'parent1@example.com',
      phone: '+961 70 123 456',
      parentName: 'Ahmad Alaghbar',
      enrollmentDate: '2024-09-01',
      nextClass: '2025-01-05',
      achievements: 12
    },
    {
      id: '2',
      name: 'Maya Hassan',
      age: 6,
      level: 'Beginner 3',
      coach: 'Layla Saab',
      progress: 72,
      attendance: 88,
      status: 'active',
      email: 'parent2@example.com',
      phone: '+961 71 234 567',
      parentName: 'Nadia Hassan',
      enrollmentDate: '2024-10-15',
      nextClass: '2025-01-05',
      achievements: 8
    },
    {
      id: '3',
      name: 'Karim Fares',
      age: 10,
      level: 'Advanced 1',
      coach: 'Omar Habib',
      progress: 91,
      attendance: 95,
      status: 'active',
      email: 'parent3@example.com',
      phone: '+961 76 345 678',
      parentName: 'Samira Fares',
      enrollmentDate: '2024-06-01',
      nextClass: '2025-01-04',
      achievements: 18
    },
    {
      id: '4',
      name: 'Lina Abdel',
      age: 7,
      level: 'Intermediate 1',
      coach: 'Rania Khalil',
      progress: 78,
      attendance: 85,
      status: 'active',
      email: 'parent4@example.com',
      phone: '+961 3 456 789',
      parentName: 'Fadi Abdel',
      enrollmentDate: '2024-08-20',
      nextClass: '2025-01-05',
      achievements: 10
    },
    {
      id: '5',
      name: 'Ziad Makhlouf',
      age: 12,
      level: 'Competitive Team',
      coach: 'Omar Habib',
      progress: 95,
      attendance: 98,
      status: 'active',
      email: 'parent5@example.com',
      phone: '+961 70 567 890',
      parentName: 'Hala Makhlouf',
      enrollmentDate: '2023-01-15',
      nextClass: '2025-01-03',
      achievements: 25
    },
    {
      id: '6',
      name: 'Tala Khoury',
      age: 5,
      level: 'Beginner 1',
      coach: 'Layla Saab',
      progress: 65,
      attendance: 80,
      status: 'active',
      email: 'parent6@example.com',
      phone: '+961 71 678 901',
      parentName: 'Marwan Khoury',
      enrollmentDate: '2024-11-01',
      nextClass: '2025-01-06',
      achievements: 5
    },
    {
      id: '7',
      name: 'Rami Nassar',
      age: 9,
      level: 'Intermediate 3',
      coach: 'Rania Khalil',
      progress: 82,
      attendance: 90,
      status: 'active',
      email: 'parent7@example.com',
      phone: '+961 76 789 012',
      parentName: 'Dina Nassar',
      enrollmentDate: '2024-07-10',
      nextClass: '2025-01-05',
      achievements: 14
    },
    {
      id: '8',
      name: 'Jana Sabbagh',
      age: 11,
      level: 'Advanced 2',
      coach: 'Omar Habib',
      progress: 88,
      attendance: 93,
      status: 'active',
      email: 'parent8@example.com',
      phone: '+961 3 890 123',
      parentName: 'Rami Sabbagh',
      enrollmentDate: '2024-03-01',
      nextClass: '2025-01-04',
      achievements: 20
    },
    {
      id: '9',
      name: 'Nour Hamdan',
      age: 4,
      level: 'Aqua Baby',
      coach: 'Layla Saab',
      progress: 45,
      attendance: 75,
      status: 'active',
      email: 'parent9@example.com',
      phone: '+961 70 901 234',
      parentName: 'Sarah Hamdan',
      enrollmentDate: '2024-12-01',
      nextClass: '2025-01-06',
      achievements: 3
    },
    {
      id: '10',
      name: 'Ali Wehbe',
      age: 8,
      level: 'Beginner 2',
      coach: 'Rania Khalil',
      progress: 55,
      attendance: 70,
      status: 'inactive',
      email: 'parent10@example.com',
      phone: '+961 71 012 345',
      parentName: 'Leila Wehbe',
      enrollmentDate: '2024-09-15',
      nextClass: 'N/A',
      achievements: 6
    }
  ];

  // Filter students
  const filteredStudents = allStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.parentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = filterLevel === 'all' || student.level === filterLevel;
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
    
    return matchesSearch && matchesLevel && matchesStatus;
  });

  const levels = ['Aqua Baby', 'Beginner 1', 'Beginner 2', 'Beginner 3', 
                  'Intermediate 1', 'Intermediate 2', 'Intermediate 3',
                  'Advanced 1', 'Advanced 2', 'Competitive Team'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <MobileHeader title="All Students" showBack={true} showSignOut={true} />
      
      <div className="px-4 py-6 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <SummaryCard 
            value={allStudents.filter(s => s.status === 'active').length.toString()} 
            label="Active" 
            color="blue" 
          />
          <SummaryCard 
            value={allStudents.filter(s => s.status === 'inactive').length.toString()} 
            label="Inactive" 
            color="orange" 
          />
          <SummaryCard 
            value={allStudents.length.toString()} 
            label="Total" 
            color="green" 
          />
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by student or parent name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm"
          >
            <option value="all">All Levels</option>
            {levels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm whitespace-nowrap">
            <Download className="size-4" />
            Export
          </button>
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600">
          Showing {filteredStudents.length} of {allStudents.length} students
        </div>

        {/* Student List */}
        <div className="space-y-3">
          {filteredStudents.map(student => (
            <StudentCard key={student.id} student={student} />
          ))}
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <User className="size-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No students found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>

      <MobileNav />
    </div>
  );
}

interface SummaryCardProps {
  value: string;
  label: string;
  color: 'blue' | 'green' | 'orange';
}

function SummaryCard({ value, label, color }: SummaryCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    green: 'bg-green-50 text-green-700 border-green-100',
    orange: 'bg-orange-50 text-orange-700 border-orange-100'
  };

  return (
    <div className={`${colorClasses[color]} rounded-xl p-3 text-center border`}>
      <div className="text-2xl mb-1">{value}</div>
      <div className="text-xs">{label}</div>
    </div>
  );
}

interface StudentCardProps {
  student: Student;
}

function StudentCard({ student }: StudentCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
      <div 
        className="p-4 cursor-pointer active:bg-gray-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base text-gray-900">{student.name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded ${
                student.status === 'active' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {student.status}
              </span>
            </div>
            <p className="text-sm text-gray-600">Age {student.age} • {student.level}</p>
            <p className="text-xs text-gray-500 mt-1">Coach: {student.coach}</p>
          </div>
          {student.achievements > 15 && (
            <Trophy className="size-5 text-yellow-500" />
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-gray-500 mb-1">Progress</div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all"
                style={{ width: `${student.progress}%` }}
              />
            </div>
            <div className="text-xs text-gray-600 mt-1">{student.progress}%</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Attendance</div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-600 transition-all"
                style={{ width: `${student.attendance}%` }}
              />
            </div>
            <div className="text-xs text-gray-600 mt-1">{student.attendance}%</div>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <InfoItem 
              icon={<User className="size-4 text-blue-600" />}
              label="Parent"
              value={student.parentName}
            />
            <InfoItem 
              icon={<Calendar className="size-4 text-blue-600" />}
              label="Enrolled"
              value={new Date(student.enrollmentDate).toLocaleDateString()}
            />
            <InfoItem 
              icon={<Trophy className="size-4 text-yellow-600" />}
              label="Achievements"
              value={student.achievements.toString()}
            />
            <InfoItem 
              icon={<Calendar className="size-4 text-green-600" />}
              label="Next Class"
              value={student.nextClass}
            />
          </div>
          
          <div className="pt-2 space-y-2">
            <a 
              href={`mailto:${student.email}`}
              className="flex items-center gap-2 text-sm text-blue-600"
            >
              <Mail className="size-4" />
              {student.email}
            </a>
            <a 
              href={`tel:${student.phone}`}
              className="flex items-center gap-2 text-sm text-blue-600"
            >
              <Phone className="size-4" />
              {student.phone}
            </a>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm active:scale-95 transition-transform">
              View Profile
            </button>
            <button className="px-3 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm active:scale-95 transition-transform">
              Edit Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div>
      <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
        {icon}
        {label}
      </div>
      <div className="text-sm text-gray-900">{value}</div>
    </div>
  );
}
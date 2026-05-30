import { MobileHeader } from '../components/MobileHeader';
import { MobileNav } from '../components/MobileNav';
import { Search, Download, Mail, Phone, Users, Calendar, Award, Star, Clock } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Coach {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  totalStudents: number;
  activeClasses: number;
  rating: number;
  status: 'active' | 'on-leave';
  email: string;
  phone: string;
  certifications: string[];
  schedule: string;
  achievements: number;
  joinDate: string;
}

export function ViewAllCoaches() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const navigate = useNavigate();

  // Mock data - replace with real database data
  const allCoaches: Coach[] = [
    {
      id: '1',
      name: 'Rania Khalil',
      specialty: 'Beginner & Intermediate',
      experience: 8,
      totalStudents: 24,
      activeClasses: 6,
      rating: 4.9,
      status: 'active',
      email: 'rania.khalil@proswim.lb',
      phone: '+961 70 111 222',
      certifications: ['WSI Certified', 'Child Safety', 'First Aid'],
      schedule: 'Mon-Wed-Fri: 3-7 PM',
      achievements: 15,
      joinDate: '2017-03-15'
    },
    {
      id: '2',
      name: 'Omar Habib',
      specialty: 'Advanced & Competitive',
      experience: 12,
      totalStudents: 18,
      activeClasses: 5,
      rating: 4.95,
      status: 'active',
      email: 'omar.habib@proswim.lb',
      phone: '+961 71 222 333',
      certifications: ['WSI Certified', 'ASCA Level 3', 'Sports Psychology'],
      schedule: 'Mon-Thu-Sat: 4-8 PM',
      achievements: 22,
      joinDate: '2013-06-01'
    },
    {
      id: '3',
      name: 'Layla Saab',
      specialty: 'Aqua Baby & Beginners',
      experience: 6,
      totalStudents: 28,
      activeClasses: 7,
      rating: 4.85,
      status: 'active',
      email: 'layla.saab@proswim.lb',
      phone: '+961 76 333 444',
      certifications: ['WSI Certified', 'Infant Swimming', 'Child Development'],
      schedule: 'Tue-Thu-Sat: 2-6 PM',
      achievements: 12,
      joinDate: '2019-01-20'
    },
    {
      id: '4',
      name: 'Karim Mehdi',
      specialty: 'Intermediate & Advanced',
      experience: 10,
      totalStudents: 20,
      activeClasses: 5,
      rating: 4.88,
      status: 'active',
      email: 'karim.mehdi@proswim.lb',
      phone: '+961 3 444 555',
      certifications: ['WSI Certified', 'Competitive Training', 'Nutrition'],
      schedule: 'Mon-Wed-Fri: 4-8 PM',
      achievements: 18,
      joinDate: '2015-09-10'
    },
    {
      id: '5',
      name: 'Nour Haddad',
      specialty: 'Aqua-Mermaid & Beginners',
      experience: 5,
      totalStudents: 22,
      activeClasses: 6,
      rating: 4.92,
      status: 'active',
      email: 'nour.haddad@proswim.lb',
      phone: '+961 70 555 666',
      certifications: ['WSI Certified', 'Aqua-Mermaid Specialist', 'Child Safety'],
      schedule: 'Tue-Wed-Sat: 3-7 PM',
      achievements: 10,
      joinDate: '2020-02-15'
    },
    {
      id: '6',
      name: 'Fadi Younes',
      specialty: 'One-on-One Sessions',
      experience: 9,
      totalStudents: 15,
      activeClasses: 8,
      rating: 4.96,
      status: 'active',
      email: 'fadi.younes@proswim.lb',
      phone: '+961 71 666 777',
      certifications: ['WSI Certified', 'Special Needs', 'Adaptive Swimming'],
      schedule: 'Mon-Fri: 2-8 PM',
      achievements: 20,
      joinDate: '2016-11-01'
    },
    {
      id: '7',
      name: 'Maya Aoun',
      specialty: 'Beginner & Intermediate',
      experience: 4,
      totalStudents: 19,
      activeClasses: 5,
      rating: 4.80,
      status: 'active',
      email: 'maya.aoun@proswim.lb',
      phone: '+961 76 777 888',
      certifications: ['WSI Certified', 'Child Safety', 'First Aid'],
      schedule: 'Mon-Thu-Sat: 3-7 PM',
      achievements: 8,
      joinDate: '2021-05-10'
    },
    {
      id: '8',
      name: 'Ziad Chamoun',
      specialty: 'Competitive Team',
      experience: 15,
      totalStudents: 12,
      activeClasses: 4,
      rating: 4.98,
      status: 'on-leave',
      email: 'ziad.chamoun@proswim.lb',
      phone: '+961 3 888 999',
      certifications: ['WSI Certified', 'ASCA Level 4', 'Olympic Coach'],
      schedule: 'Currently on leave',
      achievements: 28,
      joinDate: '2010-01-15'
    }
  ];

  // Filter coaches
  const filteredCoaches = allCoaches.filter(coach => {
    const matchesSearch = coach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         coach.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || coach.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const totalStudents = allCoaches.reduce((sum, coach) => sum + coach.totalStudents, 0);
  const avgRating = (allCoaches.reduce((sum, coach) => sum + coach.rating, 0) / allCoaches.length).toFixed(2);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <MobileHeader title="All Coaches" showBack={true} showSignOut={true} />
      
      <div className="px-4 py-6 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <SummaryCard 
            value={allCoaches.filter(c => c.status === 'active').length.toString()} 
            label="Active" 
            color="blue" 
          />
          <SummaryCard 
            value={totalStudents.toString()} 
            label="Students" 
            color="green" 
          />
          <SummaryCard 
            value={avgRating} 
            label="Avg Rating" 
            color="yellow" 
          />
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="on-leave">On Leave</option>
          </select>

          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm whitespace-nowrap">
            <Download className="size-4" />
            Export
          </button>
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600">
          Showing {filteredCoaches.length} of {allCoaches.length} coaches
        </div>

        {/* Coach List */}
        <div className="space-y-3">
          {filteredCoaches.map(coach => (
            <CoachCard key={coach.id} coach={coach} navigate={navigate} />
          ))}
        </div>

        {filteredCoaches.length === 0 && (
          <div className="text-center py-12">
            <Users className="size-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No coaches found</p>
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
  color: 'blue' | 'green' | 'yellow';
}

function SummaryCard({ value, label, color }: SummaryCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    green: 'bg-green-50 text-green-700 border-green-100',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-100'
  };

  return (
    <div className={`${colorClasses[color]} rounded-xl p-3 text-center border`}>
      <div className="text-2xl mb-1">{value}</div>
      <div className="text-xs">{label}</div>
    </div>
  );
}

interface CoachCardProps {
  coach: Coach;
  navigate: (path: string) => void;
}

function CoachCard({ coach, navigate }: CoachCardProps) {
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
              <h3 className="text-base text-gray-900">{coach.name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded ${
                coach.status === 'active' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-orange-100 text-orange-700'
              }`}>
                {coach.status === 'active' ? 'Active' : 'On Leave'}
              </span>
            </div>
            <p className="text-sm text-gray-600">{coach.specialty}</p>
            <p className="text-xs text-gray-500 mt-1">{coach.experience} years experience</p>
          </div>
          <div className="flex items-center gap-1">
            <Star className="size-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm text-gray-900">{coach.rating}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <StatBox 
            icon={<Users className="size-4 text-blue-600" />}
            value={coach.totalStudents.toString()}
            label="Students"
          />
          <StatBox 
            icon={<Calendar className="size-4 text-green-600" />}
            value={coach.activeClasses.toString()}
            label="Classes"
          />
          <StatBox 
            icon={<Award className="size-4 text-yellow-600" />}
            value={coach.achievements.toString()}
            label="Awards"
          />
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 space-y-3">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Clock className="size-4 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <div className="text-xs text-gray-500">Schedule</div>
                <div className="text-sm text-gray-900">{coach.schedule}</div>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Award className="size-4 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <div className="text-xs text-gray-500">Certifications</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {coach.certifications.map((cert, index) => (
                    <span 
                      key={index}
                      className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-2 space-y-2">
            <a 
              href={`mailto:${coach.email}`}
              className="flex items-center gap-2 text-sm text-blue-600"
            >
              <Mail className="size-4" />
              {coach.email}
            </a>
            <a 
              href={`tel:${coach.phone}`}
              className="flex items-center gap-2 text-sm text-blue-600"
            >
              <Phone className="size-4" />
              {coach.phone}
            </a>
          </div>

          <div className="flex items-center justify-between pt-2 text-xs text-gray-500">
            <span>Joined {new Date(coach.joinDate).toLocaleDateString()}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button 
              className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm active:scale-95 transition-transform"
              onClick={() => navigate(`/coach/${coach.id}`)}
            >
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

interface StatBoxProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

function StatBox({ icon, label, value }: StatBoxProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-2 text-center">
      <div className="flex justify-center mb-1">{icon}</div>
      <div className="text-base text-gray-900 mb-0.5">{value}</div>
      <div className="text-xs text-gray-600">{label}</div>
    </div>
  );
}
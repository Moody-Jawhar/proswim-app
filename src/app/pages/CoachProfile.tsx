import { MobileHeader } from '../components/MobileHeader';
import { MobileNav } from '../components/MobileNav';
import { useParams, useNavigate } from 'react-router-dom';
import { Mail, Phone, Award, Star, Users, Calendar, Trophy, Clock, CheckCircle } from 'lucide-react';
import { useState } from 'react';
const mohamadSakrPhoto = "https://www.proswim-lb.com/Gallery/_Website/Logo/ProSwimLogo.png";
const proswimLogo = "https://www.proswim-lb.com/Gallery/_Website/Logo/ProSwimLogo.png";

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
  bio: string;
  photo?: string;
  students: Array<{ id: string; name: string; level: string; progress: number }>;
}

export function CoachProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'schedule'>('overview');

  // Mock data - in real app, fetch by ID from database
  const coaches: Record<string, Coach> = {
    '1': {
      id: '1',
      name: 'Mohamad Sakr',
      specialty: 'Beginner & Intermediate',
      experience: 8,
      totalStudents: 24,
      activeClasses: 6,
      rating: 4.9,
      status: 'active',
      email: 'mohamad.sakr@proswim.lb',
      phone: '+961 70 111 222',
      certifications: ['WSI Certified', 'Child Safety', 'First Aid', 'CPR Certified'],
      schedule: 'Mon-Wed-Fri: 3-7 PM',
      achievements: 15,
      joinDate: '2017-03-15',
      bio: 'Passionate swimming coach with 8 years of experience specializing in teaching children and teenagers. Dedicated to creating a safe, fun, and educational environment where students can develop their swimming skills and build confidence in the water.',
      photo: mohamadSakrPhoto,
      students: [
        { id: '1', name: 'Sanad Alaghbar', level: 'Intermediate 2', progress: 85 },
        { id: '2', name: 'Lina Abdel', level: 'Intermediate 1', progress: 78 },
        { id: '3', name: 'Rami Nassar', level: 'Intermediate 3', progress: 82 },
        { id: '4', name: 'Ali Wehbe', level: 'Beginner 2', progress: 55 }
      ]
    },
    '2': {
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
      certifications: ['WSI Certified', 'ASCA Level 3', 'Sports Psychology', 'Nutrition Specialist'],
      schedule: 'Mon-Thu-Sat: 4-8 PM',
      achievements: 22,
      joinDate: '2013-06-01',
      bio: 'Elite swimming coach focused on competitive training and advanced techniques. Experienced in preparing swimmers for national and international competitions with a track record of producing champion athletes.',
      students: [
        { id: '5', name: 'Ziad Makhlouf', level: 'Competitive Team', progress: 95 },
        { id: '6', name: 'Jana Sabbagh', level: 'Advanced 2', progress: 88 },
        { id: '7', name: 'Karim Fares', level: 'Advanced 1', progress: 91 }
      ]
    }
  };

  const coach = coaches[id || '1'] || coaches['1'];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <MobileHeader title="Coach Profile" showBack={true} showSignOut={true} />
      
      <div className="px-4 py-6 space-y-6">
        {/* Profile Header with Photo */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* ProSwim Logo Watermark */}
          <div className="relative bg-gradient-to-br from-[#0B4F8C] to-[#1a6bb8] p-6 pb-20">
            <img 
              src={proswimLogo} 
              alt="ProSwim"
              className="absolute top-4 right-4 h-12 w-auto opacity-20"
            />
          </div>
          
          {/* Photo with removed background effect */}
          <div className="relative -mt-16 flex flex-col items-center px-6 pb-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white">
                {coach.photo ? (
                  <img 
                    src={coach.photo} 
                    alt={coach.name}
                    className="w-full h-full object-cover"
                    style={{
                      mixBlendMode: 'multiply',
                      backgroundColor: 'white'
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl">
                    {coach.name.charAt(0)}
                  </div>
                )}
              </div>
              {coach.status === 'active' && (
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
              )}
            </div>
            
            <h2 className="text-2xl mt-4 text-gray-900 text-center">{coach.name}</h2>
            <p className="text-base text-gray-600 text-center mt-1">{coach.specialty}</p>
            <div className="flex items-center gap-2 mt-2">
              <Star className="size-5 text-yellow-500 fill-yellow-500" />
              <span className="text-lg text-gray-900">{coach.rating}</span>
              <span className="text-sm text-gray-500">({coach.totalStudents} students)</span>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 w-full mt-6">
              <StatBox 
                icon={<Users className="size-5 text-blue-600" />}
                value={coach.totalStudents.toString()}
                label="Students"
              />
              <StatBox 
                icon={<Calendar className="size-5 text-green-600" />}
                value={coach.activeClasses.toString()}
                label="Classes"
              />
              <StatBox 
                icon={<Trophy className="size-5 text-yellow-600" />}
                value={coach.achievements.toString()}
                label="Awards"
              />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <TabButton 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </TabButton>
          <TabButton 
            active={activeTab === 'students'} 
            onClick={() => setActiveTab('students')}
          >
            Students
          </TabButton>
          <TabButton 
            active={activeTab === 'schedule'} 
            onClick={() => setActiveTab('schedule')}
          >
            Schedule
          </TabButton>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Bio */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
              <h3 className="text-lg mb-3 text-gray-900 flex items-center gap-2">
                <Award className="size-5 text-blue-600" />
                About
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {coach.bio}
              </p>
            </div>

            {/* Experience & Info */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
              <h3 className="text-lg mb-4 text-gray-900">Professional Details</h3>
              <div className="space-y-3">
                <InfoRow 
                  icon={<Clock className="size-4 text-blue-600" />}
                  label="Experience"
                  value={`${coach.experience} years`}
                />
                <InfoRow 
                  icon={<Calendar className="size-4 text-blue-600" />}
                  label="Joined ProSwim"
                  value={new Date(coach.joinDate).toLocaleDateString()}
                />
                <InfoRow 
                  icon={<CheckCircle className="size-4 text-green-600" />}
                  label="Status"
                  value={coach.status === 'active' ? 'Active' : 'On Leave'}
                />
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
              <h3 className="text-lg mb-4 text-gray-900 flex items-center gap-2">
                <Award className="size-5 text-blue-600" />
                Certifications
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {coach.certifications.map((cert, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm"
                  >
                    <CheckCircle className="size-4" />
                    {cert}
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
              <h3 className="text-lg mb-4 text-gray-900">Contact Information</h3>
              <div className="space-y-3">
                <a 
                  href={`mailto:${coach.email}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl active:bg-gray-100 transition-colors"
                >
                  <Mail className="size-5 text-blue-600" />
                  <span className="text-sm text-gray-900">{coach.email}</span>
                </a>
                <a 
                  href={`tel:${coach.phone}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl active:bg-gray-100 transition-colors"
                >
                  <Phone className="size-5 text-blue-600" />
                  <span className="text-sm text-gray-900">{coach.phone}</span>
                </a>
              </div>
            </div>
          </>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg text-gray-900">Current Students</h3>
              <span className="text-sm text-gray-500">{coach.students.length} students</span>
            </div>
            <div className="space-y-3">
              {coach.students.map(student => (
                <div 
                  key={student.id}
                  className="p-4 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-base text-gray-900">{student.name}</h4>
                      <p className="text-sm text-gray-600">{student.level}</p>
                    </div>
                    <span className="text-sm text-blue-600">{student.progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all"
                      style={{ width: `${student.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
            <h3 className="text-lg mb-4 text-gray-900 flex items-center gap-2">
              <Clock className="size-5 text-blue-600" />
              Weekly Schedule
            </h3>
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 rounded-xl">
                <p className="text-base text-gray-900 mb-1">{coach.schedule}</p>
                <p className="text-sm text-gray-600">Regular coaching hours</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-700">
                  <strong className="text-gray-900">Note:</strong> Schedule may vary during holidays and special events. Contact for private session bookings.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ProSwim Branding Footer */}
        <div className="flex items-center justify-center gap-2 py-4 opacity-50">
          <img 
            src={proswimLogo} 
            alt="ProSwim"
            className="h-8 w-auto"
          />
          <span className="text-sm text-gray-500">ProSwim-LB</span>
        </div>
      </div>

      <MobileNav />
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
      className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-all ${
        active 
          ? 'bg-[#0B4F8C] text-white' 
          : 'bg-gray-100 text-gray-600 active:scale-95'
      }`}
    >
      {children}
    </button>
  );
}

interface StatBoxProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

function StatBox({ icon, value, label }: StatBoxProps) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 text-center">
      <div className="flex justify-center mb-2">{icon}</div>
      <div className="text-lg text-gray-900 mb-1">{value}</div>
      <div className="text-xs text-gray-600">{label}</div>
    </div>
  );
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <div className="flex-1">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm text-gray-900">{value}</p>
      </div>
    </div>
  );
}
import { MobileHeader } from '../components/MobileHeader';
import { MobileNav } from '../components/MobileNav';
import { Users, DollarSign, Calendar, TrendingUp, Award, UserCheck, UserPlus, Settings, BarChart3 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AdminDashboardProps {
  userName: string;
}

interface OverviewStats {
  totalStudents: number;
  totalCoaches: number;
  totalParents: number;
  activeClasses: number;
  monthlyRevenue: number;
  pendingPayments: number;
  averageProgress: number;
  averageAttendance: number;
}

interface RecentActivity {
  id: string;
  type: 'enrollment' | 'payment' | 'progress' | 'attendance';
  message: string;
  timestamp: string;
}

export function AdminDashboard({ userName }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'coaches' | 'payments'>('overview');

  const stats: OverviewStats = {
    totalStudents: 156,
    totalCoaches: 12,
    totalParents: 98,
    activeClasses: 24,
    monthlyRevenue: 52800,
    pendingPayments: 8400,
    averageProgress: 68,
    averageAttendance: 87
  };

  const recentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'enrollment',
      message: 'New student enrolled: Maya Hassan',
      timestamp: '2025-01-01T10:30:00'
    },
    {
      id: '2',
      type: 'payment',
      message: 'Payment received from Rania Khalil ($320)',
      timestamp: '2025-01-01T09:15:00'
    },
    {
      id: '3',
      type: 'progress',
      message: 'Sanad Alaghbar completed new skill',
      timestamp: '2025-01-01T08:45:00'
    },
    {
      id: '4',
      type: 'attendance',
      message: 'High attendance this week: 92%',
      timestamp: '2024-12-31T16:00:00'
    }
  ];

  const firstName = userName.split(' ')[0];
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white pb-20">
      <MobileHeader title="Admin Dashboard" showSignOut={true} />
      
      <div className="px-4 py-6 space-y-6">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-[#1e5c97] to-[#1a6bb8] rounded-2xl p-6 text-white shadow-xl">
          <h1 className="text-2xl mb-2">Hi {firstName}! 👋</h1>
          <p className="text-blue-100">
            Manage ProSwim operations and monitor performance
          </p>
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
            active={activeTab === 'coaches'} 
            onClick={() => setActiveTab('coaches')}
          >
            Coaches
          </TabButton>
          <TabButton 
            active={activeTab === 'payments'} 
            onClick={() => setActiveTab('payments')}
          >
            Payments
          </TabButton>
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                icon={<Users className="size-6 text-blue-600" />}
                value={stats.totalStudents.toString()}
                label="Total Students"
                trend="+12%"
              />
              <MetricCard
                icon={<UserCheck className="size-6 text-blue-500" />}
                value={stats.totalCoaches.toString()}
                label="Active Coaches"
              />
              <MetricCard
                icon={<DollarSign className="size-6 text-green-600" />}
                value={`$${(stats.monthlyRevenue / 1000).toFixed(1)}k`}
                label="Monthly Revenue"
                trend="+8%"
              />
              <MetricCard
                icon={<Calendar className="size-6 text-blue-700" />}
                value={stats.activeClasses.toString()}
                label="Active Classes"
              />
            </div>

            {/* Performance Stats */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
              <h3 className="text-lg mb-4 text-gray-900">Performance Metrics</h3>
              <div className="space-y-4">
                <StatRow
                  label="Average Progress"
                  value={stats.averageProgress}
                  color="blue"
                />
                <StatRow
                  label="Average Attendance"
                  value={stats.averageAttendance}
                  color="blue"
                />
                <StatRow
                  label="Payment Collection"
                  value={Math.round(((stats.monthlyRevenue - stats.pendingPayments) / stats.monthlyRevenue) * 100)}
                  color="green"
                />
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
              <h3 className="text-lg mb-4 text-gray-900">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
              <h3 className="text-lg mb-4 text-gray-900">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <QuickActionButton
                  icon={<UserPlus className="size-5" />}
                  label="Add Student"
                />
                <QuickActionButton
                  icon={<UserCheck className="size-5" />}
                  label="Add Coach"
                />
                <QuickActionButton
                  icon={<Calendar className="size-5" />}
                  label="Schedule Class"
                />
                <QuickActionButton
                  icon={<Settings className="size-5" />}
                  label="Settings"
                />
              </div>
            </div>
          </>
        )}

        {activeTab === 'students' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
            <h3 className="text-lg mb-4 text-gray-900">Student Management</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <MiniStatCard value={stats.totalStudents.toString()} label="Total" />
                <MiniStatCard value="12" label="New" color="green" />
                <MiniStatCard value="4" label="Inactive" color="orange" />
              </div>
              <button 
                onClick={() => navigate('/students')}
                className="w-full px-4 py-3 bg-[#1e5c97] text-white rounded-xl active:scale-95 transition-transform"
              >
                View All Students
              </button>
            </div>
          </div>
        )}

        {activeTab === 'coaches' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
            <h3 className="text-lg mb-4 text-gray-900">Coach Management</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <MiniStatCard value={stats.totalCoaches.toString()} label="Total" />
                <MiniStatCard value="24" label="Classes" />
                <MiniStatCard value="13" label="Avg/Coach" color="blue" />
              </div>
              <button 
                onClick={() => navigate('/coaches')}
                className="w-full px-4 py-3 bg-[#1e5c97] text-white rounded-xl active:scale-95 transition-transform"
              >
                View All Coaches
              </button>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
              <h3 className="text-lg mb-4 text-gray-900">Payment Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                  <span className="text-sm text-gray-700">Collected</span>
                  <span className="text-xl text-green-700">${(stats.monthlyRevenue - stats.pendingPayments).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl">
                  <span className="text-sm text-gray-700">Pending</span>
                  <span className="text-xl text-orange-700">${stats.pendingPayments.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                  <span className="text-sm text-gray-700">Total</span>
                  <span className="text-xl text-blue-700">${stats.monthlyRevenue.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => navigate('/payments')}
              className="w-full px-4 py-3 bg-[#1e5c97] text-white rounded-xl active:scale-95 transition-transform"
            >
              View Payment Details
            </button>
          </div>
        )}
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
          ? 'bg-[#1e5c97] text-white' 
          : 'bg-gray-100 text-gray-600 active:scale-95'
      }`}
    >
      {children}
    </button>
  );
}

interface MetricCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  trend?: string;
}

function MetricCard({ icon, value, label, trend }: MetricCardProps) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
      <div className="flex items-start justify-between mb-2">
        <div>{icon}</div>
        {trend && (
          <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
            {trend}
          </span>
        )}
      </div>
      <div className="text-2xl mb-1 text-gray-900">{value}</div>
      <div className="text-xs text-gray-600">{label}</div>
    </div>
  );
}

interface MiniStatCardProps {
  value: string;
  label: string;
  color?: 'blue' | 'green' | 'orange';
}

function MiniStatCard({ value, label, color = 'blue' }: MiniStatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    orange: 'bg-orange-50 text-orange-700'
  };

  return (
    <div className={`${colorClasses[color]} rounded-xl p-3 text-center`}>
      <div className="text-xl mb-1">{value}</div>
      <div className="text-xs">{label}</div>
    </div>
  );
}

interface StatRowProps {
  label: string;
  value: number;
  color: 'blue' | 'green';
}

function StatRow({ label, value, color }: StatRowProps) {
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600'
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-700">{label}</span>
        <span className="text-sm text-gray-900">{value}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colorClasses[color]} transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

interface ActivityItemProps {
  activity: RecentActivity;
}

function ActivityItem({ activity }: ActivityItemProps) {
  const iconMap = {
    enrollment: <UserPlus className="size-4 text-blue-600" />,
    payment: <DollarSign className="size-4 text-green-600" />,
    progress: <TrendingUp className="size-4 text-blue-600" />,
    attendance: <BarChart3 className="size-4 text-blue-600" />
  };

  const timeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000 / 60);
    
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
      <div className="mt-0.5">{iconMap[activity.type]}</div>
      <div className="flex-1">
        <p className="text-sm text-gray-900">{activity.message}</p>
        <p className="text-xs text-gray-500 mt-1">{timeAgo(activity.timestamp)}</p>
      </div>
    </div>
  );
}

interface QuickActionButtonProps {
  icon: React.ReactNode;
  label: string;
}

function QuickActionButton({ icon, label }: QuickActionButtonProps) {
  return (
    <button className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl active:scale-95 transition-transform">
      <div className="text-[#1e5c97]">{icon}</div>
      <span className="text-xs text-gray-700">{label}</span>
    </button>
  );
}
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ParentDashboard } from './ParentDashboard';
import { CoachDashboard } from './CoachDashboard';
import { AdminDashboard } from './AdminDashboard';
import { StudentDashboard } from './StudentDashboard';

interface User {
  name: string;
  email: string;
  role: string;
}

export function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }

    const userData = localStorage.getItem('currentUser');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

  if (!user) return null;

  // Route to appropriate dashboard based on role
  switch (user.role) {
    case 'parent':
      return <ParentDashboard userName={user.name} />;
    case 'coach':
      return <CoachDashboard userName={user.name} />;
    case 'admin':
      return <AdminDashboard userName={user.name} />;
    case 'student':
      return <StudentDashboard userName={user.name} userEmail={user.email} />;
    default:
      return <StudentDashboard userName={user.name} userEmail={user.email} />;
  }
}

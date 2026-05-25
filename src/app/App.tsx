import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { SignInPage } from './pages/SignInPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProgramsPage } from './pages/ProgramsPage';
import { AboutPage } from './pages/AboutPage';
import { ViewAllStudents } from './pages/ViewAllStudents';
import { ViewAllCoaches } from './pages/ViewAllCoaches';
import { ViewAllPayments } from './pages/ViewAllPayments';
import { CoachProfile } from './pages/CoachProfile';
import { StudentProfile } from './pages/StudentProfile';
import { MyProfilePage } from './pages/MyProfilePage';
import { ThemeProvider } from './contexts/ThemeContext';

// ProSwim Mobile App - Main Entry Point
export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/programs" element={<ProgramsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/students" element={<ViewAllStudents />} />
          <Route path="/coaches" element={<ViewAllCoaches />} />
          <Route path="/payments" element={<ViewAllPayments />} />
          <Route path="/coach/:id" element={<CoachProfile />} />
          <Route path="/student/:id" element={<StudentProfile />} />
          <Route path="/profile" element={<MyProfilePage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

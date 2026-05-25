import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LandingPage } from "./app/pages/LandingPage";
import { SignInPage } from "./app/pages/SignInPage";
import { DashboardPage } from "./app/pages/DashboardPage";
import { ProgramsPage } from "./app/pages/ProgramsPage";
import { AboutPage } from "./app/pages/AboutPage";
import { ViewAllStudents } from "./app/pages/ViewAllStudents";
import { ViewAllCoaches } from "./app/pages/ViewAllCoaches";
import { ViewAllLocations } from "./app/pages/ViewAllLocations";
import { ViewAllPayments } from "./app/pages/ViewAllPayments";
import { CoachProfile } from "./app/pages/CoachProfile";
import { StudentProfile } from "./app/pages/StudentProfile";
import { MyProfilePage } from "./app/pages/MyProfilePage";
import { ThemeProvider } from "./app/contexts/ThemeContext";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter basename="/Mobilev1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/programs" element={<ProgramsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/students" element={<ViewAllStudents />} />
          <Route path="/coaches" element={<ViewAllCoaches />} />

          {/* make these lowercase */}
          <Route path="/locations" element={<ViewAllLocations />} />
          <Route path="/payments" element={<ViewAllPayments />} />

          <Route path="/coach/:id" element={<CoachProfile />} />
          <Route path="/student/:id" element={<StudentProfile />} />
          <Route path="/profile" element={<MyProfilePage />} />

          {/* optional: redirect old uppercase URLs */}
          <Route path="/Locations" element={<Navigate to="/locations" replace />} />
          <Route path="/Payments" element={<Navigate to="/payments" replace />} />

          {/* fallback so it never goes blank */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

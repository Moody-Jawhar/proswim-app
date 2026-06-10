import { BrowserRouter, HashRouter, Routes, Route, Navigate } from "react-router-dom";

const isCapacitor = import.meta.env.VITE_BUILD_TARGET === "capacitor";
const Router = isCapacitor ? HashRouter : BrowserRouter;
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
import { SchedulePage } from "./app/pages/SchedulePage";
import { RegistrationsPage } from "./app/pages/RegistrationsPage";
import { RegistrationSessionsPage } from "./app/pages/RegistrationSessionsPage";
import { RegistrationPaymentsPage } from "./app/pages/RegistrationPaymentsPage";
import { PrivatePackagesPage } from "./app/pages/PrivatePackagesPage";
import { PrivateSessionsPage } from "./app/pages/PrivateSessionsPage";
import { PrivatePaymentsPage } from "./app/pages/PrivatePaymentsPage";
import { PaymentsHistoryPage } from "./app/pages/PaymentsHistoryPage";
import { SkillsChecklistPage } from "./app/pages/SkillsChecklistPage";

export default function App() {
  return (
    <Router {...(!isCapacitor && { basename: "/Mobilev1" })}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/programs" element={<ProgramsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/students" element={<ViewAllStudents />} />
        <Route path="/coaches" element={<ViewAllCoaches />} />
        <Route path="/locations" element={<ViewAllLocations />} />
        <Route path="/payments" element={<ViewAllPayments />} />
        <Route path="/coach/:id" element={<CoachProfile />} />
        <Route path="/student/:id" element={<StudentProfile />} />
        <Route path="/profile" element={<MyProfilePage />} />
        <Route path="/schedule" element={<SchedulePage />} />

        {/* Student section pages */}
        <Route path="/registrations" element={<RegistrationsPage />} />
        <Route path="/registrations/:semesterId/sessions" element={<RegistrationSessionsPage />} />
        <Route path="/registrations/:semesterId/payments" element={<RegistrationPaymentsPage />} />
        <Route path="/private" element={<PrivatePackagesPage />} />
        <Route path="/private/:packageId/sessions" element={<PrivateSessionsPage />} />
        <Route path="/private/:packageId/payments" element={<PrivatePaymentsPage />} />
        <Route path="/payment-history" element={<PaymentsHistoryPage />} />
        <Route path="/checklist" element={<SkillsChecklistPage />} />

        <Route path="/Locations" element={<Navigate to="/locations" replace />} />
        <Route path="/Payments" element={<Navigate to="/payments" replace />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </Router>
  );
}

import { BrowserRouter, HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";

const isCapacitor = import.meta.env.VITE_BUILD_TARGET === "capacitor";
const Router = isCapacitor ? HashRouter : BrowserRouter;

// Android hardware/gesture back: go back one page instead of exiting the app.
function AndroidBackHandler() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const sub = CapacitorApp.addListener("backButton", () => {
      if (location.pathname === "/") {
        CapacitorApp.exitApp();
      } else {
        navigate(-1);
      }
    });
    return () => { sub.then(s => s.remove()); };
  }, [location.pathname, navigate]);

  return null;
}
import { LandingPage } from "./app/pages/LandingPage";
import { SignInPage } from "./app/pages/SignInPage";
import { ChangePasswordPage } from "./app/pages/ChangePasswordPage";
import { VerifyPage } from "./app/pages/VerifyPage";
import { DashboardPage } from "./app/pages/DashboardPage";
import { SwimLevelsPage } from "./app/pages/SwimLevelsPage";
import { AboutPage } from "./app/pages/AboutPage";
import { ViewAllStudents } from "./app/pages/ViewAllStudents";
import { ViewAllCoaches } from "./app/pages/ViewAllCoaches";
import { ViewAllLocations } from "./app/pages/ViewAllLocations";
import { ViewAllPayments } from "./app/pages/ViewAllPayments";
import { CoachProfile } from "./app/pages/CoachProfile";
import { StudentProfile } from "./app/pages/StudentProfile";
import { MyProfilePage } from "./app/pages/MyProfilePage";
import { PersonalInfoPage } from "./app/pages/PersonalInfoPage";
import { PortfolioPage } from "./app/pages/PortfolioPage";
import { SchedulePage } from "./app/pages/SchedulePage";
import { RegistrationsPage } from "./app/pages/RegistrationsPage";
import { RegistrationSessionsPage } from "./app/pages/RegistrationSessionsPage";
import { RegistrationPaymentsPage } from "./app/pages/RegistrationPaymentsPage";
import { PrivatePackagesPage } from "./app/pages/PrivatePackagesPage";
import { PrivateSessionsPage } from "./app/pages/PrivateSessionsPage";
import { PrivatePaymentsPage } from "./app/pages/PrivatePaymentsPage";
import { PaymentsHistoryPage } from "./app/pages/PaymentsHistoryPage";
import { SkillsChecklistPage } from "./app/pages/SkillsChecklistPage";
import { NotificationsPage } from "./app/pages/NotificationsPage";
import { NewsPage } from "./app/pages/NewsPage";
import { LocationDetailPage } from "./app/pages/LocationDetailPage";
import { PageTransition } from "./app/components/PageTransition";
import { SplashBubbles } from "./app/components/SplashBubbles";

export default function App() {
  return (
    <Router {...(!isCapacitor && { basename: "/Mobilev1" })}>
      <AndroidBackHandler />
      <SplashBubbles />
      <PageTransition>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/programs" element={<Navigate to="/levels" replace />} />
        <Route path="/levels" element={<SwimLevelsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/students" element={<ViewAllStudents />} />
        <Route path="/coaches" element={<ViewAllCoaches />} />
        <Route path="/locations" element={<ViewAllLocations />} />
        <Route path="/locations/:id" element={<LocationDetailPage />} />
        <Route path="/payments" element={<ViewAllPayments />} />
        <Route path="/coach/:id" element={<CoachProfile />} />
        <Route path="/student/:id" element={<StudentProfile />} />
        <Route path="/profile" element={<MyProfilePage />} />
        <Route path="/profile/personal" element={<PersonalInfoPage />} />
        <Route path="/profile/portfolio" element={<PortfolioPage />} />
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
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/news" element={<NewsPage />} />

        <Route path="/Locations" element={<Navigate to="/locations" replace />} />
        <Route path="/Payments" element={<Navigate to="/payments" replace />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
      </PageTransition>
    </Router>
  );
}

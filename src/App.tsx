import { Route, Routes } from "react-router-dom"

import { AuthLayout } from "@/components/layout/auth-layout"
import { PublicLayout } from "@/components/layout/public-layout"
import LandingPage from "@/pages/landing"
import PricingPage from "@/pages/pricing"
import HowItWorksPage from "@/pages/how-it-works"
import AboutPage from "@/pages/about"
import ContactPage from "@/pages/contact"
import PrivacyPage from "@/pages/privacy"
import TermsPage from "@/pages/terms"
import LoginPage from "@/pages/auth/login"
import SignupPage from "@/pages/auth/signup"
import ForgotPasswordPage from "@/pages/auth/forgot-password"
import AppPlaceholder from "@/pages/app-placeholder"
import EmployerLayout from "@/components/employer/employer-layout"
import EmployerDashboard from "@/pages/employer/dashboard"
import EmployerCompanyProfile from "@/pages/employer/company-profile"
import EmployerJobs from "@/pages/employer/jobs"
import PostJobWizard from "@/pages/employer/post-job"
import EmployerCandidates from "@/pages/employer/candidates"
import CandidateDetail from "@/pages/employer/candidate-detail"
import EmployerAnalytics from "@/pages/employer/analytics"
import EmployerTeam from "@/pages/employer/team"
import EmployerMessages from "@/pages/employer/messages"
import EmployerSettings from "@/pages/employer/settings"
import NotFoundPage from "@/pages/not-found"

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="pricing" element={<PricingPage />} />
        <Route path="how-it-works" element={<HowItWorksPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="terms" element={<TermsPage />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* employer app */}
      <Route path="employer" element={<EmployerLayout />}>
        <Route index element={<EmployerDashboard />} />
        <Route path="company" element={<EmployerCompanyProfile />} />
        <Route path="jobs" element={<EmployerJobs />} />
        <Route path="jobs/new" element={<PostJobWizard />} />
        <Route path="candidates" element={<EmployerCandidates />} />
        <Route path="candidates/:id" element={<CandidateDetail />} />
        <Route path="analytics" element={<EmployerAnalytics />} />
        <Route path="team" element={<EmployerTeam />} />
        <Route path="messages" element={<EmployerMessages />} />
        <Route path="settings" element={<EmployerSettings />} />
      </Route>

      {/* app shells — real dashboards land in later phases */}
      <Route path="app/*" element={<AppPlaceholder />} />
      <Route path="mentor/*" element={<AppPlaceholder />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

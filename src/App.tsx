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
import AuthCallbackPage from "@/pages/auth/callback"
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
import SeekerLayout from "@/components/seeker/seeker-layout"
import SeekerDashboard from "@/pages/seeker/dashboard"
import SeekerJobs from "@/pages/seeker/jobs"
import SeekerApply from "@/pages/seeker/apply"
import SeekerProfile from "@/pages/seeker/profile"
import SeekerAiHub from "@/pages/seeker/ai-hub"
import SeekerInterviewPrep from "@/pages/seeker/interview-prep"
import SeekerSalaryOracle from "@/pages/seeker/salary-oracle"
import SeekerCompatibility from "@/pages/seeker/compatibility"
import SeekerCareerPath from "@/pages/seeker/career-path"
import SeekerSkills from "@/pages/seeker/skills"
import SeekerMentorship from "@/pages/seeker/mentorship"
import SeekerMentorDetail from "@/pages/seeker/mentor-detail"
import SeekerCommunity from "@/pages/seeker/community"
import SeekerMessages from "@/pages/seeker/messages"
import SeekerResumes from "@/pages/seeker/resumes"
import SeekerBilling from "@/pages/seeker/billing"
import SeekerRefer from "@/pages/seeker/refer"
import SeekerSettings from "@/pages/seeker/settings"
import MentorLayout from "@/components/mentor/mentor-layout"
import MentorDashboard from "@/pages/mentor/dashboard"
import MentorPlans from "@/pages/mentor/plans"
import MentorMentees from "@/pages/mentor/mentees"
import MentorReviews from "@/pages/mentor/reviews"
import MentorSessions from "@/pages/mentor/sessions"
import MentorAvailability from "@/pages/mentor/availability"
import MentorMessages from "@/pages/mentor/messages"
import MentorResources from "@/pages/mentor/resources"
import MentorInsights from "@/pages/mentor/insights"
import MentorEarnings from "@/pages/mentor/earnings"
import MentorProfile from "@/pages/mentor/profile"
import MentorSettings from "@/pages/mentor/settings"
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
      <Route path="auth/callback" element={<AuthCallbackPage />} />

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

      {/* job seeker app */}
      <Route path="app" element={<SeekerLayout />}>
        <Route index element={<SeekerDashboard />} />
        <Route path="ai" element={<SeekerAiHub />} />
        <Route path="ai/interview-prep" element={<SeekerInterviewPrep />} />
        <Route path="ai/salary-oracle" element={<SeekerSalaryOracle />} />
        <Route path="ai/compatibility" element={<SeekerCompatibility />} />
        <Route path="ai/career-path" element={<SeekerCareerPath />} />
        <Route path="skills" element={<SeekerSkills />} />
        <Route path="jobs" element={<SeekerJobs />} />
        <Route path="apply/:id" element={<SeekerApply />} />
        <Route path="profile" element={<SeekerProfile />} />
        <Route path="mentorship" element={<SeekerMentorship />} />
        <Route path="mentorship/:id" element={<SeekerMentorDetail />} />
        <Route path="community" element={<SeekerCommunity />} />
        <Route path="messages" element={<SeekerMessages />} />
        <Route path="resumes" element={<SeekerResumes />} />
        <Route path="billing" element={<SeekerBilling />} />
        <Route path="refer" element={<SeekerRefer />} />
        <Route path="settings" element={<SeekerSettings />} />
      </Route>

      {/* mentor app */}
      <Route path="mentor" element={<MentorLayout />}>
        <Route index element={<MentorDashboard />} />
        <Route path="plans" element={<MentorPlans />} />
        <Route path="mentees" element={<MentorMentees />} />
        <Route path="reviews" element={<MentorReviews />} />
        <Route path="sessions" element={<MentorSessions />} />
        <Route path="availability" element={<MentorAvailability />} />
        <Route path="messages" element={<MentorMessages />} />
        <Route path="resources" element={<MentorResources />} />
        <Route path="insights" element={<MentorInsights />} />
        <Route path="earnings" element={<MentorEarnings />} />
        <Route path="profile" element={<MentorProfile />} />
        <Route path="settings" element={<MentorSettings />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

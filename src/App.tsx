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

      {/* app shells — real dashboards land in later phases */}
      <Route path="app/*" element={<AppPlaceholder />} />
      <Route path="employer/*" element={<AppPlaceholder />} />
      <Route path="mentor/*" element={<AppPlaceholder />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

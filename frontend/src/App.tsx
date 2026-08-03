import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppShell from '@/components/AppShell';
import AuthGate from '@/components/AuthGate';
import InstallPrompt from '@/components/InstallPrompt';
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import AuthCallback from '@/pages/AuthCallback';
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';
import NotFound from '@/pages/NotFound';
import Features from '@/pages/Features';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Roadmap from '@/pages/Roadmap';
import Changelog from '@/pages/Changelog';
import Docs from '@/pages/Docs';
import Help from '@/pages/Help';
import Faq from '@/pages/Faq';
import ApiPage from '@/pages/ApiPage';
import Blog from '@/pages/Blog';
import UseCases from '@/pages/UseCases';
import Pricing from '@/pages/Pricing';
import Dashboard from '@/pages/Dashboard';
import Generate from '@/pages/Generate';
import BrandBrain from '@/pages/BrandBrain';
import Prompts from '@/pages/Prompts';
import ImageAnalysis from '@/pages/ImageAnalysis';
import Document from '@/pages/Document';
import Repurpose from '@/pages/Repurpose';
import Calendar from '@/pages/Calendar';
import Campaigns from '@/pages/Campaigns';
import BrandHealth from '@/pages/BrandHealth';
import Memory from '@/pages/Memory';
import ApiKeys from '@/pages/ApiKeys';
import History from '@/pages/History';
import Schedule from '@/pages/Schedule';
import Analytics from '@/pages/Analytics';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';

/**
 * Routing layout:
 *
 *   /                          Landing          (public)
 *   /features                  Features         (public)
 *   /pricing                   Pricing          (public — no login required)
 *   /about                     About            (public)
 *   /contact                   Contact          (public)
 *   /roadmap                   Roadmap          (public)
 *   /changelog                 Changelog        (public)
 *   /docs                      Docs             (public)
 *   /help                      Help Center      (public)
 *   /faq                       FAQ              (public)
 *   /api                       API (Coming Soon)(public)
 *   /blog                      Blog (Coming Soon)(public)
 *   /use-cases                 Use Cases        (public)
 *   /use-cases/:slug           Use Case detail  (public)
 *   /privacy                   Privacy          (public)
 *   /terms                     Terms            (public)
 *   /login                     Login            (public)
 *   /signup                    Signup           (public)
 *   /dashboard, /generate...   App pages        (protected by AuthGate → AppShell)
 *   /settings                  Settings         (protected)
 *   *                          NotFound         (public)
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/features" element={<Features />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/changelog" element={<Changelog />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/help" element={<Help />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/api" element={<ApiPage />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/use-cases" element={<UseCases />} />
        <Route path="/use-cases/:slug" element={<UseCases />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected routes — wrapped in AuthGate + AppShell */}
        <Route
          element={
            <AuthGate>
              <AppShell />
            </AuthGate>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/generate" element={<Generate />} />
          <Route path="/brand-brain" element={<BrandBrain />} />
          <Route path="/prompts" element={<Prompts />} />
          <Route path="/image-analysis" element={<ImageAnalysis />} />
          <Route path="/document" element={<Document />} />
          <Route path="/repurpose" element={<Repurpose />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/brand-health" element={<BrandHealth />} />
          <Route path="/memory" element={<Memory />} />
          <Route path="/api-keys" element={<ApiKeys />} />
          <Route path="/history" element={<History />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* 404 — keep last */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <InstallPrompt />
    </BrowserRouter>
  );
}


import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppShell from '@/components/AppShell';
import AuthGate from '@/components/AuthGate';
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';
import NotFound from '@/pages/NotFound';
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
import Pricing from '@/pages/Pricing';

/**
 * Routing layout:
 *
 *   /                       Landing    (public)
 *   /login                  Login      (public)
 *   /signup                 Signup     (public)
 *   /privacy                Privacy    (public)
 *   /terms                  Terms      (public)
 *   /dashboard, /generate…  App pages  (protected by AuthGate → AppShell)
 *   *                       NotFound   (public)
 *
 * The Pricing page is intentionally placed under the protected shell so the
 * user's plan/credits state is available for the upgrade CTA. Public visitors
 * can still see pricing via the Landing page CTA → /signup flow.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

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
          <Route path="/pricing" element={<Pricing />} />
        </Route>

        {/* 404 — keep last */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

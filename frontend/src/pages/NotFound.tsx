import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import PublicHeader from '@/components/PublicHeader';

export default function NotFound() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />

      <PublicHeader />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <p className="font-display text-8xl font-bold text-gradient">404</p>
        <h1 className="mt-4 font-display text-3xl font-bold text-text-primary">
          Page not found
        </h1>
        <p className="mt-2 max-w-md text-text-secondary">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <Link
          to="/"
          className="btn-brand mt-8 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
        >
          <Home className="h-4 w-4" />
          Back to home
        </Link>
      </div>
    </div>
  );
}

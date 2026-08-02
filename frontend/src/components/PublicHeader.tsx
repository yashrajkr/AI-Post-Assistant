import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Sparkles, Menu, X, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/lib/auth';

/**
 * PublicHeader — sticky glass navigation bar for public (unauthenticated) pages.
 *
 * Shows the PostReady AI logo, a few anchor links (Features, Pricing, Privacy,
 * Terms), and auth CTAs. When the user is already logged in, the "Start free"
 * button becomes a "Dashboard" link so they can jump straight into the app.
 *
 * Mobile: collapses into a hamburger → slide-down drawer.
 */
const navLinks = [
  { label: 'Features', to: '/#features' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Privacy', to: '/privacy' },
  { label: 'Terms', to: '/terms' },
];

export default function PublicHeader() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the drawer on navigation
  const handleNav = () => setMobileOpen(false);

  return (
    <header className="glass sticky top-0 z-50 border-b border-border">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" onClick={handleNav} className="flex items-center gap-2 font-display text-xl font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-gradient text-white shadow-glow">
            <Sparkles className="h-4 w-4" />
          </span>
          PostReady <span className="text-gradient">AI</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) =>
            link.to.startsWith('/#') ? (
              <a
                key={link.label}
                href={link.to}
                className="rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
              >
                {link.label}
              </a>
            ) : (
              <NavLink
                key={link.label}
                to={link.to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive ? 'text-brand' : 'text-text-secondary hover:text-text-primary'
                  }`
                }
              >
                {link.label}
              </NavLink>
            )
          )}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <Link
              to="/dashboard"
              className="btn-brand inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn-ghost rounded-lg px-4 py-2 text-sm font-medium">
                Login
              </Link>
              <Link to="/signup" className="btn-brand rounded-lg px-4 py-2 text-sm font-semibold">
                Start free
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen((s) => !s)}
          className="btn-ghost rounded-lg p-2 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="border-t border-border bg-surface md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            {navLinks.map((link) =>
              link.to.startsWith('/#') ? (
                <a
                  key={link.label}
                  href={link.to}
                  onClick={handleNav}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
                >
                  {link.label}
                </a>
              ) : (
                <NavLink
                  key={link.label}
                  to={link.to}
                  onClick={handleNav}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive ? 'bg-surface-hover text-brand' : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              )
            )}
            <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
              {user ? (
                <Link
                  to="/dashboard"
                  onClick={handleNav}
                  className="btn-brand inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={handleNav}
                    className="btn-secondary rounded-lg px-4 py-2.5 text-center text-sm font-semibold"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={handleNav}
                    className="btn-brand rounded-lg px-4 py-2.5 text-center text-sm font-semibold"
                  >
                    Start free
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}


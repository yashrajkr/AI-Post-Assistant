import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Menu,
  X,
  LayoutDashboard,
  ChevronDown,
  Home,
  CreditCard,
  History,
  BarChart3,
  Settings,
  User,
  LogOut,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';

/**
 * PublicHeader — sticky glass navigation bar for public pages.
 *
 * Logged-out users see: Home, Features, Pricing, About, Contact, Login, Get Started.
 * Logged-in users see: Dashboard, Generate, History, Analytics, Pricing + avatar
 * dropdown (Profile, Settings, Logout).
 *
 * Features: active page highlighting, smooth scrolling, responsive mobile drawer,
 * keyboard accessibility, hover + dropdown animations.
 */

interface NavLinkDef {
  label: string;
  to: string;
  icon?: typeof LayoutDashboard;
}

const publicNavLinks: NavLinkDef[] = [
  { label: 'Home', to: '/' },
  { label: 'Features', to: '/features' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

const loggedInNavLinks: NavLinkDef[] = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Generate', to: '/generate', icon: Zap },
  { label: 'History', to: '/history', icon: History },
  { label: 'Analytics', to: '/analytics', icon: BarChart3 },
  { label: 'Pricing', to: '/pricing', icon: CreditCard },
];

function useSmoothScroll() {
  const location = useLocation();
  useEffect(() => {
    // Smooth scroll to any anchor (e.g. /#features) after navigation.
    if (location.hash) {
      const id = location.hash.replace('#', '');
      // Wait a tick so the page has rendered the target element.
      const t = setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
      return () => clearTimeout(t);
    }
  }, [location]);
}

export default function PublicHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement | null>(null);

  useSmoothScroll();

  const closeAll = () => {
    setMobileOpen(false);
    setAccountOpen(false);
  };

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
  }, [location.pathname, location.hash]);

  // Close account dropdown on outside click / Escape
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAccountOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const handleLogout = async () => {
    closeAll();
    await logout();
    navigate('/', { replace: true });
  };

  const navLinks = user ? loggedInNavLinks : publicNavLinks;

  const renderLink = (link: (typeof navLinks)[number]) => {
    const isHomeAnchor = link.to === '/';
    if (isHomeAnchor) {
      return (
        <NavLink
          key={link.label}
          to="/"
          end
          onClick={closeAll}
          className={({ isActive }) =>
            `group relative rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive ? 'text-brand' : 'text-text-secondary hover:text-text-primary'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span className="flex items-center gap-1.5">
                <Home className="h-3.5 w-3.5" />
                {link.label}
              </span>
              {isActive && <ActivePill />}
            </>
          )}
        </NavLink>
      );
    }
    return (
      <NavLink
        key={link.label}
        to={link.to}
        onClick={closeAll}
        className={({ isActive }) =>
          `group relative rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            isActive ? 'text-brand' : 'text-text-secondary hover:text-text-primary'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <span className="flex items-center gap-1.5">
              {'icon' in link && link.icon && <link.icon className="h-3.5 w-3.5" />}
              {link.label}
            </span>
            {isActive && <ActivePill />}
          </>
        )}
      </NavLink>
    );
  };

  return (
    <header className="glass sticky top-0 z-50 border-b border-border">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link
          to="/"
          onClick={closeAll}
          className="flex items-center gap-2 font-display text-xl font-bold"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-gradient text-white shadow-glow">
            <Sparkles className="h-4 w-4" />
          </span>
          PostReady <span className="text-gradient">AI</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {navLinks.map((link) => renderLink(link))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <div className="relative" ref={accountRef}>
              <button
                onClick={() => setAccountOpen((s) => !s)}
                aria-expanded={accountOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2 rounded-full border border-border bg-surface-hover/60 py-1.5 pl-1.5 pr-2.5 transition-all hover:border-brand/40 hover:bg-surface-hover"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-gradient text-[10px] font-bold text-white">
                  {initials(user?.name, user?.email)}
                </span>
                <ChevronDown className={`h-3.5 w-3.5 text-text-secondary transition-transform ${accountOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {accountOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    role="menu"
                    className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-border bg-surface shadow-card-hover"
                  >
                    <div className="border-b border-border px-4 py-3">
                      <p className="truncate text-sm font-semibold text-text-primary">
                        {user?.name || user?.email}
                      </p>
                      <p className="truncate text-xs text-text-tertiary">
                        {user?.email} · {user?.credits ?? 0} credits
                      </p>
                    </div>
                    <div className="p-1.5">
                      <AccountItem to="/dashboard" icon={LayoutDashboard} onClick={closeAll}>Dashboard</AccountItem>
                      <AccountItem to="/profile" icon={User} onClick={closeAll}>Profile</AccountItem>
                      <AccountItem to="/settings" icon={Settings} onClick={closeAll}>Settings</AccountItem>
                      <AccountItem to="/pricing" icon={CreditCard} onClick={closeAll}>Pricing</AccountItem>
                      <button
                        onClick={handleLogout}
                        role="menuitem"
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-error transition-colors hover:bg-error/10"
                      >
                        <LogOut className="h-4 w-4" /> Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `btn-ghost rounded-lg px-4 py-2 text-sm font-medium ${isActive ? 'text-brand' : ''}`
                }
              >
                Login
              </NavLink>
              <Link to="/signup" className="btn-brand rounded-lg px-4 py-2 text-sm font-semibold">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen((s) => !s)}
          className="btn-ghost rounded-lg p-2 lg:hidden"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-nav"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-border bg-surface lg:hidden"
          >
            <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3" aria-label="Mobile">
              {navLinks.map((link) =>
                'icon' in link && link.icon ? (
                  <NavLink
                    key={link.label}
                    to={link.to}
                    onClick={closeAll}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-surface-hover text-brand'
                          : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                      }`
                    }
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </NavLink>
                ) : (
                  <NavLink
                    key={link.label}
                    to={link.to}
                    end={link.to === '/'}
                    onClick={closeAll}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-surface-hover text-brand'
                          : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                      }`
                    }
                  >
                    {link.to === '/' && <Home className="h-4 w-4" />}
                    {link.label}
                  </NavLink>
                )
              )}
              <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
                {user ? (
                  <>
                    <NavLink
                      to="/profile"
                      onClick={closeAll}
                      className="btn-secondary flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold"
                    >
                      <User className="h-4 w-4" /> Profile
                    </NavLink>
                    <NavLink
                      to="/settings"
                      onClick={closeAll}
                      className="btn-secondary flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold"
                    >
                      <Settings className="h-4 w-4" /> Settings
                    </NavLink>
                    <button
                      onClick={handleLogout}
                      className="btn-secondary flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-error"
                    >
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </>
                ) : (
                  <>
                    <NavLink
                      to="/login"
                      onClick={closeAll}
                      className={({ isActive }) =>
                        `btn-secondary rounded-lg px-4 py-2.5 text-center text-sm font-semibold ${isActive ? 'text-brand' : ''}`
                      }
                    >
                      Login
                    </NavLink>
                    <Link
                      to="/signup"
                      onClick={closeAll}
                      className="btn-brand rounded-lg px-4 py-2.5 text-center text-sm font-semibold"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function ActivePill() {
  return (
    <motion.span
      layoutId="public-nav-active"
      className="absolute bottom-0.5 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-brand-gradient"
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    />
  );
}

function AccountItem({
  to,
  icon: Icon,
  onClick,
  children,
}: {
  to: string;
  icon: typeof LayoutDashboard;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      role="menuitem"
      className={({ isActive }) =>
        `flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          isActive ? 'bg-surface-hover text-brand' : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
        }`
      }
    >
      <Icon className="h-4 w-4" /> {children}
    </NavLink>
  );
}

/** Returns the user's initials for the avatar (max 2 chars). */
function initials(name?: string, email?: string): string {
  const source = (name || email || '?').trim();
  if (!source) return '?';
  const parts = source.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}


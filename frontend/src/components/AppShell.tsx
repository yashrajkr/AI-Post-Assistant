import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Sparkles,
  Brain,
  Library,
  Image,
  FileText,
  RefreshCw,
  CalendarDays,
  Megaphone,
  HeartPulse,
  MemoryStick,
  KeyRound,
  History,
  CalendarClock,
  BarChart3,
  User,
  CreditCard,
  Zap,
  LogOut,
  Menu,
  X,
  Home,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import Footer from '@/components/Footer';

type NavItem = { label: string; icon: typeof Home; path: string; section: string };

const nav: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', section: 'MAIN' },
  { label: 'Generate', icon: Sparkles, path: '/generate', section: 'MAIN' },
  { label: 'Brand Brain', icon: Brain, path: '/brand-brain', section: 'TOOLS' },
  { label: 'Prompt Library', icon: Library, path: '/prompts', section: 'TOOLS' },
  { label: 'Image Analysis', icon: Image, path: '/image-analysis', section: 'TOOLS' },
  { label: 'Document → Content', icon: FileText, path: '/document', section: 'TOOLS' },
  { label: 'Repurpose', icon: RefreshCw, path: '/repurpose', section: 'TOOLS' },
  { label: 'Content Calendar', icon: CalendarDays, path: '/calendar', section: 'TOOLS' },
  { label: 'Campaign Builder', icon: Megaphone, path: '/campaigns', section: 'TOOLS' },
  { label: 'Brand Health', icon: HeartPulse, path: '/brand-health', section: 'TOOLS' },
  { label: 'AI Memory', icon: MemoryStick, path: '/memory', section: 'TOOLS' },
  { label: 'API Keys', icon: KeyRound, path: '/api-keys', section: 'ACCOUNT' },
  { label: 'History', icon: History, path: '/history', section: 'ACCOUNT' },
  { label: 'Schedule', icon: CalendarClock, path: '/schedule', section: 'ACCOUNT' },
  { label: 'Analytics', icon: BarChart3, path: '/analytics', section: 'ACCOUNT' },
  { label: 'Profile', icon: User, path: '/profile', section: 'ACCOUNT' },
  { label: 'Pricing', icon: CreditCard, path: '/pricing', section: 'ACCOUNT' },
];

const mobileTabs = [
  { label: 'Home', icon: Home, path: '/dashboard' },
  { label: 'Create', icon: Sparkles, path: '/generate' },
  { label: 'Brain', icon: Brain, path: '/brand-brain' },
  { label: 'Repurpose', icon: RefreshCw, path: '/repurpose' },
  { label: 'Stats', icon: BarChart3, path: '/analytics' },
];

/** Returns the user's initials for the avatar (max 2 chars). */
function initials(name?: string, email?: string): string {
  const source = (name || email || '?').trim();
  if (!source) return '?';
  const parts = source.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export default function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentLabel = nav.find((n) => n.path === location.pathname)?.label ?? 'Dashboard';

  const handleLogout = async () => {
    await logout();
    toast({ title: 'Signed out', tone: 'info' });
    navigate('/login', { replace: true });
  };

  // Display name (prefer first/last name, fall back to name, then email)
  const displayName =
    user?.firstName || user?.name || (user?.email ? user.email.split('@')[0] : 'User');
  const planLabel = user?.plan ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1) : 'Free';
  const credits = user?.credits ?? 0;

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Sidebar — desktop */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 flex-col border-r border-border bg-surface md:flex">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex h-16 items-center gap-2.5 px-5 text-left"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-text-primary">PostReady AI</span>
        </button>

        {/* Nav — only this section scrolls. Logo above and user footer below are fixed. */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 sidebar-scroll">
          {(() => {
            let lastSection = '';
            return nav.map((item) => {
              const showSection = item.section !== lastSection;
              lastSection = item.section;
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <div key={item.path}>
                  {showSection && (
                    <div className="mt-4 mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">
                      {item.section}
                    </div>
                  )}
                  <button
                    onClick={() => navigate(item.path)}
                    className={`relative flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-surface-hover text-text-primary'
                        : 'text-text-secondary hover:bg-surface-hover/50 hover:text-text-primary'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="sidebar-active"
                        className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-brand-gradient"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                </div>
              );
            });
          })()}
        </nav>

        {/* User footer */}
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 rounded-lg p-2">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-gradient text-xs font-bold text-white">
              {initials(user?.name, user?.email)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text-primary">{displayName}</p>
              <p className="truncate text-xs text-text-tertiary">
                {planLabel} · {credits} credits
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="btn-ghost rounded-lg p-1.5"
              aria-label="Logout"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              className="fixed left-0 top-0 z-50 h-screen w-64 border-r border-border bg-surface md:hidden"
            >
              <div className="flex h-16 items-center justify-between px-5">
                <button
                  onClick={() => {
                    navigate('/dashboard');
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-2.5"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient text-white">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <span className="font-display text-lg font-bold text-text-primary">PostReady AI</span>
                </button>
                <button onClick={() => setMobileOpen(false)} className="btn-ghost rounded-lg p-1.5">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <nav className="no-scrollbar h-[calc(100%-4rem)] overflow-y-auto px-3 py-2">
                {nav.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setMobileOpen(false);
                      }}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-surface-hover text-text-primary'
                          : 'text-text-secondary hover:bg-surface-hover/50'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </button>
                  );
                })}
                <button
                  onClick={handleLogout}
                  className="mt-4 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-error transition-colors hover:bg-error/10"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  Sign out
                </button>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main area */}
      <div className="flex min-h-screen flex-1 flex-col md:pl-64">
        {/* Topbar */}
        <header className="glass sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="btn-ghost rounded-lg p-2 md:hidden"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="font-display text-base font-semibold text-text-primary sm:text-lg">{currentLabel}</h2>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-1.5 rounded-full bg-surface-hover px-3 py-1.5 text-xs font-medium text-text-secondary sm:flex">
              <Zap className="h-3.5 w-3.5 text-warning" />
              {credits} credits
            </div>
            <button
              className="hidden items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-text-tertiary transition-colors hover:text-text-secondary lg:flex"
              aria-label="Keyboard shortcuts"
            >
              <span>⌘K</span>
            </button>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-gradient text-xs font-bold text-white">
              {initials(user?.name, user?.email)}
            </span>
          </div>
        </header>

        {/* Page content — flex-1 so it fills available height (footer sticks to bottom on short pages) */}
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-24 sm:px-8 sm:py-8 md:pb-8">
          <Outlet />
        </main>

        {/* App footer — hidden on mobile (bottom tab bar replaces it) */}
        <div className="hidden md:block">
          <Footer variant="app" />
        </div>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="glass fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-border md:hidden">
        {mobileTabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center gap-1"
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-brand' : 'text-text-tertiary'}`} />
              <span className={`text-[10px] font-medium ${isActive ? 'text-brand' : 'text-text-tertiary'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

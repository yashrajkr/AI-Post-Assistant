import { Link } from 'react-router-dom';
import { Sparkles, Twitter, Github, Youtube, Linkedin, Mail } from 'lucide-react';

/**
 * Shared footer.
 *
 * - `variant="landing"` → full multi-column footer (brand + product + company + legal + social)
 * - `variant="app"` → compact single-row footer for the authenticated app shell
 *
 * Why two variants? The landing page is wide and benefits from a rich footer
 * with sitemap-style links. The app shell already has a sidebar with all the
 * navigation, so a compact footer is enough — it just shows legal links and
 * a "back to landing" link.
 */
export default function Footer({ variant = 'landing' }: { variant?: 'landing' | 'app' }) {
  if (variant === 'app') {
    return <AppFooter />;
  }
  return <LandingFooter />;
}

// ============================================================================
// Landing footer — rich, multi-column
// ============================================================================

const PRODUCT_LINKS = [
  { label: 'Features', to: '/#features' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Chrome Extension', to: '/terms' },
  { label: 'API Keys', to: '/login' },
  { label: 'Prompt Library', to: '/login' },
];

const COMPANY_LINKS = [
  { label: 'About', to: '/terms' },
  { label: 'Blog', to: '/terms' },
  { label: 'Careers', to: '/terms' },
  { label: 'Contact', to: '/terms' },
  { label: 'Changelog', to: '/terms' },
];

const LEGAL_LINKS = [
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Service', to: '/terms' },
  { label: 'Security', to: '/privacy' },
  { label: 'Cookie Policy', to: '/privacy' },
];

const USE_CASES = [
  { label: 'For Creators', to: '/signup' },
  { label: 'For Coaches', to: '/signup' },
  { label: 'For Small Businesses', to: '/signup' },
  { label: 'For Agencies', to: '/signup' },
  { label: 'For Influencers', to: '/signup' },
];

function LandingFooter() {
  return (
    <footer className="relative z-10 border-t border-border bg-surface/50">
      {/* Main footer grid */}
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand column (spans 2 on lg) */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-gradient text-white">
                <Sparkles className="h-4 w-4" />
              </span>
              PostReady <span className="text-gradient">AI</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-text-secondary">
              The AI Content Operating System for creators, coaches, and small businesses.
              Turn one idea into a ready-to-post content package — in seconds.
            </p>

            {/* Social icons */}
            <div className="mt-6 flex items-center gap-2">
              <SocialLink href="https://twitter.com" label="Twitter / X" icon={Twitter} />
              <SocialLink href="https://github.com" label="GitHub" icon={Github} />
              <SocialLink href="https://youtube.com" label="YouTube" icon={Youtube} />
              <SocialLink href="https://linkedin.com" label="LinkedIn" icon={Linkedin} />
              <SocialLink href="mailto:support@aipostassistant.com" label="Email" icon={Mail} />
            </div>

            {/* Status badge */}
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/5 px-3 py-1 text-xs font-medium text-success">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
              All systems operational
            </div>
          </div>

          {/* Product column */}
          <FooterColumn title="Product" links={PRODUCT_LINKS} />

          {/* Use cases column */}
          <FooterColumn title="Use Cases" links={USE_CASES} />

          {/* Company column */}
          <FooterColumn title="Company" links={COMPANY_LINKS} />
        </div>

        {/* Legal row */}
        <div className="mt-10 grid gap-4 border-t border-border pt-6 sm:grid-cols-2">
          <div className="flex flex-wrap items-center gap-4">
            {LEGAL_LINKS.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                className="text-xs text-text-tertiary transition-colors hover:text-text-primary"
              >
                {l.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2 sm:justify-end">
            <span className="text-xs text-text-tertiary">Powered by</span>
            <span className="text-xs font-medium text-text-secondary">OpenAI GPT-4o · Gemini · Razorpay · Supabase</span>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-5 sm:flex-row">
          <p className="text-xs text-text-tertiary">
            © {new Date().getFullYear()} AI Post Assistant. All rights reserved.
          </p>
          <p className="text-xs text-text-tertiary">
            Built with ❤️ for creators worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; to: string }[] }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">{title}</h4>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              to={l.to}
              className="text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: typeof Twitter;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface-2 text-text-secondary transition-all hover:border-brand hover:text-brand"
    >
      <Icon className="h-4 w-4" />
    </a>
  );
}

// ============================================================================
// App footer — compact, single row
// ============================================================================

function AppFooter() {
  return (
    <footer className="border-t border-border bg-surface/50">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 sm:flex-row sm:px-8">
        <div className="flex items-center gap-2 text-xs text-text-tertiary">
          <Sparkles className="h-3.5 w-3.5 text-brand" />
          <span>PostReady AI · v16.0</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/privacy" className="text-xs text-text-tertiary transition-colors hover:text-text-primary">
            Privacy
          </Link>
          <Link to="/terms" className="text-xs text-text-tertiary transition-colors hover:text-text-primary">
            Terms
          </Link>
          <Link to="/pricing" className="text-xs text-text-tertiary transition-colors hover:text-text-primary">
            Pricing
          </Link>
          <Link to="/" className="text-xs text-text-tertiary transition-colors hover:text-text-primary">
            ← Back to home
          </Link>
        </div>
        <p className="text-xs text-text-tertiary">
          © {new Date().getFullYear()} AI Post Assistant
        </p>
      </div>
    </footer>
  );
}

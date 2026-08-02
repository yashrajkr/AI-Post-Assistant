import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PublicHeader from '@/components/PublicHeader';

export default function Privacy() {
  const lastUpdated = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-bg">
      <PublicHeader />
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-display text-4xl font-bold text-text-primary">Privacy Policy</h1>
        <p className="mt-2 text-text-secondary">Last updated: {lastUpdated}</p>

        <div className="mt-10 space-y-8 text-text-secondary">
          <section>
            <h2 className="font-display text-2xl font-bold text-text-primary">1. Introduction</h2>
            <p className="mt-3 leading-relaxed">
              AI Post Assistant (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is a content creation platform that helps creators, coaches, and small businesses generate social media content using AI. This Privacy Policy explains how we collect, use, store, and protect your data when you use our website, API, Chrome extension, or any related service (collectively, the &ldquo;Service&rdquo;).
            </p>
            <p className="mt-3 leading-relaxed">
              By using the Service, you agree to the practices described in this policy. If you do not agree, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-text-primary">2. Data We Collect</h2>
            <h3 className="mt-4 font-semibold text-text-primary">2.1 Account Information</h3>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li><strong>Name:</strong> Used to personalize your experience and greet you.</li>
              <li><strong>Email address:</strong> Used for login, account recovery, and important service notifications.</li>
              <li><strong>Password:</strong> Stored as a PBKDF2 hash (120,000 iterations, SHA-512). We never see your plain-text password.</li>
            </ul>

            <h3 className="mt-4 font-semibold text-text-primary">2.2 Content You Generate</h3>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li><strong>Text inputs:</strong> The content ideas, captions, and prompts you enter to generate posts.</li>
              <li><strong>Generated outputs:</strong> AI-generated captions, hashtags, titles, CTAs, and other content.</li>
              <li><strong>Images:</strong> If you use the image analysis feature, images are sent to our AI provider for analysis. Images are not permanently stored on our servers unless you explicitly save them to your history.</li>
              <li><strong>Documents:</strong> If you use the document-to-content feature, extracted text is processed by AI but not permanently stored.</li>
            </ul>

            <h3 className="mt-4 font-semibold text-text-primary">2.3 Brand Voice &amp; Preferences</h3>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li><strong>Brand Brain:</strong> Your saved brand name, tagline, niche, audience, preferred tones, CTA style, and banned words.</li>
              <li><strong>AI Memory:</strong> Hashtags, tones, niches, and other patterns AI learns from your usage to personalize future generations.</li>
            </ul>

            <h3 className="mt-4 font-semibold text-text-primary">2.4 Usage Data</h3>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li><strong>API keys:</strong> If you generate API keys for the Chrome extension, we store only the SHA-256 hash (never the raw key).</li>
              <li><strong>Payment records:</strong> Transaction records from Razorpay (amount, plan, status). We do NOT store your card details — Razorpay handles all payment processing.</li>
              <li><strong>Analytics data:</strong> Aggregate usage statistics (number of generations, schedules, platforms used).</li>
            </ul>

            <h3 className="mt-4 font-semibold text-text-primary">2.5 Technical Data</h3>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li><strong>Session cookies:</strong> HMAC-signed HttpOnly cookies for authentication. No tracking cookies.</li>
              <li><strong>IP address:</strong> Used for rate limiting and security. Not stored permanently.</li>
              <li><strong>Browser type:</strong> Collected via standard HTTP headers for compatibility.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-text-primary">3. How We Use Your Data</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li><strong>To provide the Service:</strong> Generate AI content, save your history, personalize outputs using your Brand Brain and AI Memory.</li>
              <li><strong>To authenticate you:</strong> Verify your identity on login, maintain your session, and authorize API requests.</li>
              <li><strong>To process payments:</strong> Manage your subscription, credits, and payment history via Razorpay.</li>
              <li><strong>To improve the Service:</strong> Analyze aggregate usage patterns to identify popular features and areas for improvement.</li>
              <li><strong>To communicate with you:</strong> Send service notifications, security alerts, and important updates.</li>
              <li><strong>To prevent abuse:</strong> Rate limiting, fraud detection, and enforcement of our Terms of Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-text-primary">4. Data Sharing</h2>
            <p className="mt-3 leading-relaxed">We do NOT sell your data. We share data only with the following third-party service providers who help us operate the Service:</p>

            <h3 className="mt-4 font-semibold text-text-primary">4.1 AI Providers</h3>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li><strong>OpenAI</strong> (api.openai.com): Receives your text inputs and images to generate AI content. OpenAI processes data according to their <a href="https://openai.com/privacy" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">Privacy Policy</a>. OpenAI does NOT use your data to train their models when accessed via API.</li>
              <li><strong>Google Gemini</strong> (generativelanguage.googleapis.com): Used as a fallback AI provider. Subject to Google&apos;s <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">Privacy Policy</a>.</li>
            </ul>

            <h3 className="mt-4 font-semibold text-text-primary">4.2 Database Hosting</h3>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li><strong>Supabase</strong> (supabase.com): Hosts our PostgreSQL database. Subject to Supabase&apos;s <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">Privacy Policy</a>.</li>
            </ul>

            <h3 className="mt-4 font-semibold text-text-primary">4.3 Payment Processing</h3>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li><strong>Razorpay</strong> (razorpay.com): Processes all payments. We never see or store your card number, CVV, or other sensitive payment details. Subject to Razorpay&apos;s <a href="https://razorpay.com/privacy/" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">Privacy Policy</a>.</li>
            </ul>

            <h3 className="mt-4 font-semibold text-text-primary">4.4 Hosting</h3>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li><strong>Render</strong> (render.com): Hosts our backend API. Subject to Render&apos;s <a href="https://render.com/privacy" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">Privacy Policy</a>.</li>
              <li><strong>Vercel</strong> (vercel.com): Hosts our frontend. Subject to Vercel&apos;s <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">Privacy Policy</a>.</li>
            </ul>

            <h3 className="mt-4 font-semibold text-text-primary">4.5 Legal Disclosure</h3>
            <p className="mt-2 leading-relaxed">We may disclose your data if required by law, court order, or government request, or if we believe in good faith that disclosure is necessary to protect our rights, your safety, or the safety of others.</p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-text-primary">5. Chrome Extension Data</h2>
            <p className="mt-3 leading-relaxed">Our Chrome extension accesses the following data:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li><strong>Selected text:</strong> When you right-click selected text and choose &ldquo;Generate posts from this text,&rdquo; the selected text is sent to our backend for AI processing.</li>
              <li><strong>Images:</strong> When you right-click an image and choose &ldquo;Analyze image with AI,&rdquo; the image is fetched and sent to our backend for vision AI analysis.</li>
              <li><strong>API key:</strong> Stored in chrome.storage.sync (encrypted by Chrome). Used to authenticate API requests.</li>
            </ul>
            <p className="mt-3 leading-relaxed">The extension does <strong>NOT</strong> access:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>Your browsing history</li>
              <li>Your cookies on other websites</li>
              <li>Your passwords or form data</li>
              <li>Content of pages you visit (unless you explicitly right-click to generate)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-text-primary">6. Data Storage &amp; Security</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li><strong>Database:</strong> Supabase (PostgreSQL) with Row Level Security (RLS) — users can only access their own data.</li>
              <li><strong>Encryption in transit:</strong> All API calls use HTTPS/TLS.</li>
              <li><strong>Password hashing:</strong> PBKDF2 with 120,000 iterations, SHA-512, 64-byte output.</li>
              <li><strong>API key hashing:</strong> SHA-256 — raw keys are never stored.</li>
              <li><strong>Session tokens:</strong> HMAC-signed with a secure secret, stored in HttpOnly cookies.</li>
              <li><strong>Rate limiting:</strong> Prevents brute-force attacks on auth and AI endpoints.</li>
            </ul>
            <p className="mt-3 leading-relaxed">Despite our efforts, no system is 100% secure. If a data breach occurs, we will notify affected users within 72 hours via email.</p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-text-primary">7. Data Retention</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li><strong>Account data:</strong> Retained until you delete your account.</li>
              <li><strong>Generations &amp; history:</strong> Retained until you delete them or close your account.</li>
              <li><strong>AI Memory:</strong> Retained until you clear it from the AI Memory page.</li>
              <li><strong>Payment records:</strong> Retained for 7 years as required by Indian tax law.</li>
              <li><strong>Server logs:</strong> Retained for 30 days for debugging, then automatically deleted.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-text-primary">8. Your Rights</h2>
            <p className="mt-3 leading-relaxed">You have the following rights regarding your data:</p>
            <ul className="mt-2 list-disc space-y-2 pl-6">
              <li><strong>Access:</strong> View all your data via the dashboard pages.</li>
              <li><strong>Correction:</strong> Update your name, email, and brand voice via the Profile page.</li>
              <li><strong>Deletion:</strong> Delete individual generations, schedules, memories, or your entire account.</li>
              <li><strong>Export:</strong> Request a data export (JSON format) by contacting us.</li>
              <li><strong>Revocation:</strong> Revoke API keys at any time from the API Keys page.</li>
              <li><strong>Opt-out:</strong> Disable AI Memory to stop the AI from learning your patterns.</li>
            </ul>
            <p className="mt-3 leading-relaxed">
              To exercise any of these rights, email{' '}
              <a href="mailto:support@aipostassistant.com" className="text-brand hover:underline">
                support@aipostassistant.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-text-primary">9. Children&apos;s Privacy</h2>
            <p className="mt-3 leading-relaxed">The Service is not intended for children under 13. We do not knowingly collect data from children under 13. If you believe a child has provided us with personal data, please contact us and we will delete it immediately.</p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-text-primary">10. International Users</h2>
            <p className="mt-3 leading-relaxed">If you are accessing the Service from outside India, please note that your data will be transferred to and processed in India. By using the Service, you consent to this transfer.</p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-text-primary">11. Cookies</h2>
            <p className="mt-3 leading-relaxed">We use only essential cookies:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li><strong>session:</strong> HttpOnly, SameSite=Lax, Secure (in production). Used for authentication.</li>
            </ul>
            <p className="mt-3 leading-relaxed">We do NOT use tracking cookies, advertising cookies, or third-party analytics cookies.</p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-text-primary">12. Changes to This Policy</h2>
            <p className="mt-3 leading-relaxed">We may update this Privacy Policy from time to time. We will notify you of significant changes via email at least 30 days before they take effect. The &ldquo;Last updated&rdquo; date at the top of this page reflects the most recent revision.</p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-text-primary">13. Contact Us</h2>
            <p className="mt-3 leading-relaxed">If you have questions about this Privacy Policy or your data, please contact:</p>
            <ul className="mt-2 list-none space-y-1 pl-6">
              <li>
                Email:{' '}
                <a href="mailto:support@aipostassistant.com" className="text-brand hover:underline">
                  support@aipostassistant.com
                </a>
              </li>
              <li>Subject: &ldquo;Privacy Policy Question&rdquo;</li>
            </ul>
            <p className="mt-3 leading-relaxed">We will respond within 48 hours.</p>
          </section>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

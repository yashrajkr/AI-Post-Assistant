import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PublicHeader from '@/components/PublicHeader';

export default function Terms() {
  const lastUpdated = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-bg">
      <PublicHeader />
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-display text-4xl font-bold text-text-primary">Terms of Service</h1>
        <p className="mt-2 text-text-secondary">Last updated: {lastUpdated}</p>

        <div className="mt-10 space-y-8 text-text-secondary">
          <section>
            <h2 className="font-display text-2xl font-bold text-text-primary">1. Acceptance of Terms</h2>
            <p className="mt-3 leading-relaxed">
              By accessing or using AI Post Assistant (&ldquo;the Service&rdquo;), you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree to these Terms, please do not use the Service.
            </p>
            <p className="mt-3 leading-relaxed">
              These Terms constitute a legally binding agreement between you and AI Post Assistant (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;).
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-text-primary">2. Description of Service</h2>
            <p className="mt-3 leading-relaxed">
              AI Post Assistant is a content creation platform that uses artificial intelligence to help users generate social media content including captions, hashtags, titles, CTAs, and content calendars. The Service includes:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-6">
              <li>Web application accessible at our domain</li>
              <li>Chrome extension for browser-based content generation</li>
              <li>API access for authenticated users (subject to plan limits)</li>
              <li>Features including Brand Brain, AI Memory, Image Analysis, Repurposer, and more</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-text-primary">3. Account Registration</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>You must provide accurate, current, and complete information during registration.</li>
              <li>You must be at least 13 years old to create an account.</li>
              <li>You are responsible for maintaining the security of your password and for all activities under your account.</li>
              <li>You must immediately notify us of any unauthorized use of your account.</li>
              <li>One person or entity may not maintain multiple free accounts.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-text-primary">4. Acceptable Use</h2>
            <p className="mt-3 leading-relaxed">You agree NOT to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Use the Service for any illegal purpose or in violation of any local, state, national, or international law.</li>
              <li>Generate content that is hateful, defamatory, harassing, obscene, pornographic, or promotes violence.</li>
              <li>Generate content that infringes on the intellectual property rights of others.</li>
              <li>Attempt to reverse engineer, decompile, or otherwise extract source code from the Service.</li>
              <li>Use the Service to spam, scam, or mislead any person.</li>
              <li>Resell or redistribute access to the Service without our written permission.</li>
              <li>Use the API to exceed rate limits or attempt to bypass usage restrictions.</li>
              <li>Upload malicious code, viruses, or any other harmful software.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-text-primary">5. AI-Generated Content</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li><strong>Ownership:</strong> You own the content you generate using the Service, subject to the rights of underlying AI providers.</li>
              <li><strong>Accuracy:</strong> AI-generated content may contain errors, biases, or outdated information. You are responsible for reviewing and verifying all generated content before publishing.</li>
              <li><strong>Liability:</strong> We are not liable for any damages resulting from your use of AI-generated content.</li>
              <li><strong>Prohibited content:</strong> You may not use the Service to generate content that violates OpenAI&apos;s usage policies, Google&apos;s AI principles, or applicable laws.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-text-primary">6. Subscription Plans &amp; Billing</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li><strong>Free plan:</strong> Includes 10 credits on signup and limited monthly credits. No credit card required.</li>
              <li><strong>Paid plans:</strong> Creator, Pro, and Team plans are billed monthly via Razorpay.</li>
              <li><strong>Auto-renewal:</strong> Paid subscriptions auto-renew unless cancelled before the next billing date.</li>
              <li><strong>Cancellation:</strong> You can cancel anytime from your Profile page. You retain access until the end of your billing period.</li>
              <li><strong>Refunds:</strong> Refunds are issued at our discretion within 7 days of payment for unused credits. Contact support for assistance.</li>
              <li><strong>Price changes:</strong> We may change pricing with 30 days notice. Existing subscribers keep their current price until the next renewal.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-text-primary">7. Credits &amp; Usage Limits</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Each AI generation (caption, hashtags, CTA, image analysis, repurpose, etc.) consumes 1 credit.</li>
              <li>Credits do not roll over month-to-month and reset on your billing date.</li>
              <li>Rate limits apply to prevent abuse. Auth endpoints: 10 requests/minute. AI endpoints: 20 requests/minute.</li>
              <li>We may adjust credit costs and rate limits with notice.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-text-primary">8. Intellectual Property</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li><strong>Our rights:</strong> The Service, including its design, code, branding, and documentation, is our intellectual property. You may not copy, modify, or distribute it.</li>
              <li><strong>Your content:</strong> You retain ownership of content you upload and generate. By using the Service, you grant us a limited license to process your content through our AI providers.</li>
              <li><strong>Prompts library:</strong> Public prompts you create may be displayed to other users. Private prompts remain yours alone.</li>
              <li><strong>Trademarks:</strong> &ldquo;AI Post Assistant&rdquo;, &ldquo;PostReady AI&rdquo;, and our logo are our trademarks. Do not use them without permission.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-text-primary">9. Privacy</h2>
            <p className="mt-3 leading-relaxed">
              Our Privacy Policy (available at{' '}
              <Link to="/privacy" className="text-brand hover:underline">/privacy</Link>
              ) describes how we collect, use, and protect your data. By using the Service, you consent to the data practices described in our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-text-primary">10. Service Availability</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>The Service is provided &ldquo;as is&rdquo; without guarantee of availability.</li>
              <li>We may modify, suspend, or discontinue any part of the Service at any time.</li>
              <li>Scheduled maintenance may cause temporary downtime. We will notify users in advance when possible.</li>
              <li>We are not liable for any downtime, data loss, or service interruptions.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-text-primary">11. Disclaimers</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind.</li>
              <li>We do not guarantee that AI-generated content will be accurate, reliable, or fit for any particular purpose.</li>
              <li>We do not endorse any content generated through the Service.</li>
              <li>Use of the Service is at your sole risk.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-text-primary">12. Limitation of Liability</h2>
            <p className="mt-3 leading-relaxed">
              To the maximum extent permitted by law, AI Post Assistant, its officers, directors, employees, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, business, or goodwill, arising out of or in connection with your use of the Service.
            </p>
            <p className="mt-3 leading-relaxed">
              Our total liability for any claim arising from these Terms shall not exceed the amount you paid us in the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-text-primary">13. Indemnification</h2>
            <p className="mt-3 leading-relaxed">
              You agree to indemnify and hold us harmless from any claims, damages, losses, or expenses (including reasonable attorneys&apos; fees) arising from your use of the Service, your violation of these Terms, or your infringement of any third-party rights.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-text-primary">14. Account Termination</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>You may delete your account at any time from the Profile page.</li>
              <li>We may suspend or terminate your account if you violate these Terms.</li>
              <li>Upon termination, your data will be deleted within 30 days, except where retention is required by law.</li>
              <li>Sections that by their nature should survive termination (including intellectual property, indemnification, and limitation of liability) will remain in effect.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-text-primary">15. Governing Law</h2>
            <p className="mt-3 leading-relaxed">
              These Terms are governed by the laws of India. Any disputes arising from these Terms shall be resolved in the courts of Patna, Bihar, India.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-text-primary">16. Changes to Terms</h2>
            <p className="mt-3 leading-relaxed">
              We may update these Terms from time to time. We will notify you of significant changes via email at least 30 days before they take effect. Continued use of the Service after changes take effect constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-text-primary">17. Contact</h2>
            <p className="mt-3 leading-relaxed">
              For questions about these Terms, contact{' '}
              <a href="mailto:support@aipostassistant.com" className="text-brand hover:underline">
                support@aipostassistant.com
              </a>
              .
            </p>
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

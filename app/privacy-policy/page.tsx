import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | WHRD Hub",
  description: "WHRD Hub Privacy Policy - Learn how we protect your data and privacy",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-border shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-primary">Privacy Policy</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div className="text-sm text-muted-foreground">
          <p>Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
        </div>

        <section className="bg-white rounded-2xl border border-border shadow-sm p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-3">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              WHRD Hub ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our platform at whrdhub.vercel.app and use our services.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground mb-3">2. Information We Collect</h2>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="font-semibold text-foreground mb-2">2.1 Information You Provide</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Account registration details (email address, username)</li>
                  <li>Report content (incident descriptions, dates, locations, evidence)</li>
                  <li>Contact information (phone number, preferred communication method)</li>
                  <li>Profile information (display name, anonymity preferences)</li>
                  <li>Screenshots and attachments related to reports</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">2.2 Automatically Collected Information</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>IP address and browser type</li>
                  <li>Page viewing history and timestamps</li>
                  <li>Device type and operating system</li>
                  <li>Geolocation data (if you enable location services)</li>
                  <li>Cookies and session identifiers</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">2.3 Third-Party Information</h3>
                <p>
                  If you authenticate via Google OAuth, we receive your Google account email and basic profile information as provided by Google's authorization process.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground mb-3">3. How We Use Your Information</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>We use collected information for the following purposes:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Processing and responding to TFGBV reports</li>
                <li>Verifying user identity and preventing fraud</li>
                <li>Providing customer support and responding to inquiries</li>
                <li>Sending service notifications and updates</li>
                <li>Fact-checking reports and analyzing patterns</li>
                <li>Connecting reporters with appropriate support services</li>
                <li>Improving platform functionality and user experience</li>
                <li>Complying with legal obligations</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground mb-3">4. Data Security</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>
                We implement industry-standard security measures to protect your personal information:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>End-to-end encryption for data in transit (HTTPS/TLS)</li>
                <li>Encryption at rest for stored data</li>
                <li>Access controls and authentication requirements</li>
                <li>Regular security audits and updates</li>
                <li>Secure password storage using industry-standard hashing</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground mb-3">5. Data Sharing & Disclosure</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                We do not sell, trade, or rent your personal information. We may share data only in these circumstances:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Support Services:</strong> With verified support organizations only when you request services</li>
                <li><strong>Legal Compliance:</strong> When required by law or to prevent harm</li>
                <li><strong>Service Providers:</strong> With trusted third parties who assist platform operations (under confidentiality agreements)</li>
                <li><strong>Aggregated Data:</strong> We may share anonymized statistics for research and advocacy</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground mb-3">6. Anonymous Accounts</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>
                WHRD Hub allows users to submit reports anonymously without creating an account. Anonymous submissions:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Are not linked to personal identification</li>
                <li>Cannot be connected to you without your voluntary disclosure</li>
                <li>Are encrypted and stored securely</li>
                <li>Are treated with the highest confidentiality standards</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground mb-3">7. Your Privacy Rights</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>Depending on your location, you may have the following rights:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
                <li><strong>Portability:</strong> Request your data in a portable format</li>
                <li><strong>Withdrawal:</strong> Withdraw consent for data processing</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, contact us at <a href="mailto:privacy@whrdhub.org" className="text-primary hover:underline">privacy@whrdhub.org</a>
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground mb-3">8. Cookies & Tracking</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>
                We use cookies and similar technologies to enhance user experience:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Session Cookies:</strong> To maintain your login and preferences</li>
                <li><strong>Analytics Cookies:</strong> To understand platform usage (no personal tracking)</li>
                <li><strong>Functional Cookies:</strong> To remember language and accessibility preferences</li>
              </ul>
              <p className="mt-4">
                You can disable cookies in your browser settings, though some features may not function properly.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground mb-3">9. Third-Party Services</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>Our platform uses third-party services:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Supabase:</strong> Database and authentication infrastructure</li>
                <li><strong>Google OAuth:</strong> Optional authentication method</li>
                <li><strong>Vercel:</strong> Platform hosting and deployment</li>
              </ul>
              <p className="mt-4">
                These services have their own privacy policies. We recommend reviewing them.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground mb-3">10. Data Retention</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>
                We retain personal information as long as necessary to provide services:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Active accounts: maintained during account lifetime</li>
                <li>Reports: retained for fact-checking, advocacy, and case tracking</li>
                <li>Deleted accounts: anonymized within 30 days</li>
                <li>Logs: retained for 90 days for security purposes</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground mb-3">11. Children's Privacy</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>
                WHRD Hub is not intended for children under 13. We do not knowingly collect information from children under 13. If we discover such collection, we will delete it immediately. Parents or guardians concerned about data collection should contact us.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground mb-3">12. Policy Changes</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>
                We may update this Privacy Policy periodically. We will notify users of material changes by email or prominent notice on the platform. Continued use of WHRD Hub indicates acceptance of updated policies.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground mb-3">13. Contact Us</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>
                For privacy concerns, data requests, or questions:
              </p>
              <ul className="space-y-1 ml-2">
                <li>Email: <a href="mailto:privacy@whrdhub.org" className="text-primary hover:underline">privacy@whrdhub.org</a></li>
                <li>Website: <a href="https://whrdhub.vercel.app" className="text-primary hover:underline">whrdhub.vercel.app</a></li>
              </ul>
              <p className="mt-4 text-sm">
                Response time: We aim to respond to all privacy inquiries within 14 days.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">
              <strong>Jurisdiction:</strong> This Privacy Policy is governed by applicable laws in Kenya and the African continent. For California residents, additional rights under CCPA apply.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

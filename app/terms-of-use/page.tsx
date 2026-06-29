import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Use | WHRD Hub",
  description: "WHRD Hub Terms of Use - Please read these terms before using our platform",
};

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-border shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-primary">Terms of Use</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div className="text-sm text-muted-foreground">
          <p>Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
        </div>

        <section className="bg-white rounded-2xl border border-border shadow-sm p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using WHRD Hub (the "Platform"), you accept and agree to be bound by these Terms of Use and our Privacy Policy. If you do not agree to these terms, you may not use this Platform. We reserve the right to modify these terms at any time, effective upon notice to you.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground mb-3">2. Platform Purpose</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>
                WHRD Hub is a secure platform for reporting and documenting technology-facilitated gender-based violence (TFGBV) and related human rights violations. The Platform is intended to:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Enable safe, confidential reporting of TFGBV incidents</li>
                <li>Protect the identity and safety of reporters</li>
                <li>Connect reporters with appropriate support services</li>
                <li>Contribute to advocacy and awareness efforts</li>
                <li>Support human rights defenders in their work</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground mb-3">3. User Accounts</h2>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="font-semibold text-foreground mb-2">3.1 Account Creation</h3>
                <p>
                  To create an account, you must be at least 13 years old. You agree to provide accurate, current information and maintain the confidentiality of your account credentials.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">3.2 Account Responsibility</h3>
                <p>
                  You are responsible for all activity on your account. You agree to notify us immediately of unauthorized access or use of your account. We are not liable for unauthorized access resulting from your failure to protect your credentials.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">3.3 Anonymous Access</h3>
                <p>
                  You may submit reports without creating an account. Anonymous submissions provide no account recovery or follow-up capabilities. You will not receive updates on your report unless you create an account and verify your email.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground mb-3">4. Acceptable Use Policy</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>
                You agree not to use WHRD Hub for any unlawful purposes or in any way that violates these Terms. Specifically, you agree not to:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Submit false or misleading reports</li>
                <li>Harass, threaten, or abuse other users or staff</li>
                <li>Attempt to gain unauthorized access to the Platform</li>
                <li>Disclose other users' information or identities</li>
                <li>Use the Platform for commercial purposes or spam</li>
                <li>Transmit malware, viruses, or harmful code</li>
                <li>Violate intellectual property rights</li>
                <li>Violate applicable laws or regulations</li>
                <li>Attempt to interfere with Platform operations</li>
                <li>Engage in doxxing or coordinated harassment</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground mb-3">5. Report Submissions</h2>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="font-semibold text-foreground mb-2">5.1 Report Content</h3>
                <p>
                  By submitting a report, you represent that:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                  <li>You have authority to submit the information</li>
                  <li>The information is accurate to the best of your knowledge</li>
                  <li>The submission does not violate others' rights</li>
                  <li>The information describes genuine TFGBV incidents</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">5.2 Report Processing</h3>
                <p>
                  We process reports confidentially. All reports are:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                  <li>Reviewed for fact-checking by trained staff</li>
                  <li>Classified according to TFGBV standards</li>
                  <li>Matched with appropriate support services</li>
                  <li>Protected with encryption and access controls</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">5.3 False Reports</h3>
                <p>
                  Deliberately submitting false reports is a violation of these Terms and may violate local laws. False reports may result in account suspension and referral to authorities.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground mb-3">6. Platform Content</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>
                All content on WHRD Hub, including design, layout, and functionality, is the intellectual property of WHRD Hub or third-party licensors. You may not:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Copy or reproduce Platform content</li>
                <li>Modify or create derivative works</li>
                <li>Reverse-engineer or attempt to extract code</li>
                <li>Remove copyright or attribution notices</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground mb-3">7. User-Generated Content</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>
                By submitting content (reports, descriptions, attachments), you grant WHRD Hub a non-exclusive, royalty-free license to:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Process and store your reports securely</li>
                <li>Share reports with support services (with your consent)</li>
                <li>Use aggregated, anonymized data for advocacy and research</li>
                <li>Improve Platform functionality and services</li>
              </ul>
              <p className="mt-4">
                You retain all ownership rights to your reports. WHRD Hub does not use reports for commercial purposes without your explicit consent.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground mb-3">8. Limitation of Liability</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>
                TO THE FULLEST EXTENT PERMITTED BY LAW:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>WHRD Hub is provided "AS IS" without warranties of any kind</li>
                <li>We do not guarantee Platform availability or uninterrupted service</li>
                <li>We are not liable for damages from unauthorized access or data breaches despite reasonable security measures</li>
                <li>We are not liable for consequences of your report submission or third-party actions</li>
                <li>Our total liability shall not exceed the amount you paid for the service (if any)</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground mb-3">9. Indemnification</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>
                You agree to indemnify and hold WHRD Hub harmless from any claims, damages, or costs arising from:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Your use of the Platform in violation of these Terms</li>
                <li>Your submission of false or defamatory content</li>
                <li>Your violation of others' rights</li>
                <li>Your violation of applicable laws</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground mb-3">10. Confidentiality</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>
                WHRD Hub staff are bound by confidentiality obligations. However, we may disclose information if:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Required by law or court order</li>
                <li>Necessary to prevent imminent harm</li>
                <li>Requested by appropriate authorities investigating crimes</li>
                <li>You have given explicit consent</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground mb-3">11. Prohibited Conduct</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>
                The following conduct is strictly prohibited:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Threatening, harassing, or abusing any person</li>
                <li>Posting content that is defamatory, libelous, or illegal</li>
                <li>Impersonating others or creating fake accounts</li>
                <li>Attempting to hack or interfere with Platform security</li>
                <li>Engaging in coordinated harassment campaigns</li>
                <li>Posting sexually explicit content</li>
                <li>Selling or trading access to reports</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground mb-3">12. Account Suspension & Termination</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>
                We may suspend or terminate your account if:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>You violate these Terms of Use</li>
                <li>You submit false or harmful reports</li>
                <li>You engage in harassment or threatening behavior</li>
                <li>You attempt unauthorized access</li>
                <li>We determine your account is used for unlawful purposes</li>
              </ul>
              <p className="mt-4">
                Suspension or termination does not delete submitted reports, which we retain for advocacy and fact-checking purposes.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground mb-3">13. Support Services</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>
                WHRD Hub connects reporters with support services. However:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>We do not provide direct medical, legal, or mental health services</li>
                <li>Support services are provided by verified third-party organizations</li>
                <li>We are not responsible for the quality or outcome of support services</li>
                <li>Service availability varies by location and time</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground mb-3">14. Governing Law</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>
                These Terms of Use are governed by the laws of Kenya. Any disputes shall be resolved in the appropriate courts of Kenya. For international users, additional laws may apply.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground mb-3">15. Severability</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>
                If any provision of these Terms is found to be unenforceable, that provision shall be modified to the minimum extent necessary, and the remaining provisions shall remain in effect.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground mb-3">16. Modifications to Terms</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>
                We may modify these Terms at any time. We will notify you of material changes by email or prominent notice on the Platform. Your continued use of WHRD Hub indicates acceptance of modified Terms.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground mb-3">17. Contact Information</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>
                For questions about these Terms of Use:
              </p>
              <ul className="space-y-1 ml-2">
                <li>Email: <a href="mailto:legal@whrdhub.org" className="text-primary hover:underline">legal@whrdhub.org</a></li>
                <li>Website: <a href="https://whrdhub.vercel.app" className="text-primary hover:underline">whrdhub.vercel.app</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-border space-y-4">
            <p className="text-sm text-muted-foreground">
              <strong>Acknowledgment:</strong> By accessing and using WHRD Hub, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use and our Privacy Policy.
            </p>
            <div className="flex gap-4 text-sm">
              <Link href="/privacy-policy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              <Link href="/" className="text-primary hover:underline">
                Home
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

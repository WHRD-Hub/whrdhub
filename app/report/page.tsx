import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import ReportForm from "@/components/report-form";

export const metadata = {
  title: "Make a Report | WHRD Hub",
  description:
    "Securely report TFGBV or abuse. Your report is encrypted and handled with care by WHRD Hub defenders.",
};

async function ReportFormWithAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;
  const userEmail = user?.email ?? undefined;

  return <ReportForm isAuthenticated={isAuthenticated} userEmail={userEmail} />;
}

export default function ReportPage() {
  return (
    <main className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm opacity-80 hover:opacity-100 transition-opacity">
            <ArrowLeft className="w-4 h-4" />
            WHRD Hub
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4" />
            <span>Secure & Anonymous</span>
          </div>
        </div>
      </header>

      {/* Safety notice */}
      <div className="bg-amber-50 border-b border-amber-200 px-5 py-3">
        <p className="text-center text-sm text-amber-800 max-w-2xl mx-auto">
          <strong>Quick exit:</strong> Press <kbd className="bg-amber-200 px-1.5 py-0.5 rounded text-xs font-mono">Esc</kbd> twice or{" "}
          <a href="https://www.google.com" className="underline font-semibold">click here</a>{" "}
          to leave this page immediately. Your browser history is not cleared automatically — use private/incognito mode if needed.
        </p>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-5 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-primary mb-3">Make a Report</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            You are not alone. This form is encrypted, and your IP address is not recorded. Share only what you feel comfortable sharing.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-border p-6 md:p-10">
          <Suspense fallback={<div className="py-10 text-center text-muted-foreground text-sm">Loading form…</div>}>
            <ReportFormWithAuth />
          </Suspense>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Protected under the Kenya Data Protection Act (2019) · All data encrypted at rest and in transit ·{" "}
          <Link href="/" className="underline">Privacy Policy</Link>
        </p>
      </div>
    </main>
  );
}

import Link from "next/link";
import { Shield, ArrowLeft, Lock } from "lucide-react";
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
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            WHRD Hub
          </Link>
          <div className="flex items-center gap-2 text-sm text-white/80">
            <Lock className="w-4 h-4" />
            <span>Secure and confidential</span>
          </div>
        </div>
      </header>

      {/* Quick exit notice */}
      <div className="bg-amber-50 border-b border-amber-200 px-5 py-2.5">
        <p className="text-center text-xs text-amber-800 max-w-2xl mx-auto">
          <strong>Quick exit:</strong> Press <kbd className="bg-amber-200 px-1.5 py-0.5 rounded text-xs font-mono">Esc</kbd> twice or{" "}
          <a href="https://www.google.com" className="underline font-semibold">click here</a>{" "}
          to leave immediately. Use private/incognito mode if needed.
        </p>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-5 py-10">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-xs font-semibold mb-4">
            <Shield className="w-3.5 h-3.5" />
            Your report is encrypted
          </div>
          <h1 className="text-3xl font-black text-primary mb-2">Report safely</h1>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto leading-relaxed">
            You are not alone. Share only what feels comfortable. Your IP address is not recorded.
          </p>
        </div>

        <Suspense fallback={
          <div className="py-16 text-center text-muted-foreground text-sm">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
            Loading form...
          </div>
        }>
          <ReportFormWithAuth />
        </Suspense>
      </div>
    </main>
  );
}

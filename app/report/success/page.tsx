"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Check, ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

function SuccessContent() {
  const params    = useSearchParams();
  const username  = params.get("u") || "";
  const reportId  = params.get("rid") || "";

  return (
    <main className="min-h-screen bg-muted/30 flex items-center justify-center px-5 py-16">
      <div className="max-w-md w-full space-y-5">

        {/* Check */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-5">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-black text-foreground mb-2">Report received</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Thank you for your courage. Your report has been securely submitted to WHRD Hub defenders.
          </p>
        </div>

        {/* Next steps */}
        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-4">
          <h2 className="font-bold text-sm text-foreground">What happens next</h2>
          <ol className="space-y-3">
            {[
              "A WHRD Hub defender will review your report within 24 to 48 hours.",
              "Once verified, relevant support services will be shared with your account.",
              "Log in at any time using your credentials to check the status of your case.",
            ].map((s, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Credentials reminder */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-sm">
          <p className="font-semibold text-primary mb-1">You are already signed in</p>
          <p className="text-muted-foreground text-xs">
            Your anonymous email and username are displayed on your dashboard. Save them somewhere safe - they are the only way to access your account.
          </p>
        </div>

        {reportId && (
          <p className="text-center text-xs font-mono text-muted-foreground">
            Case reference: {reportId}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Button asChild className="w-full">
            <Link href="/dashboard">Go to your dashboard <ArrowRight className="w-4 h-4 ml-1" /></Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/">Return home</Link>
          </Button>
        </div>

        <div className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
          <Phone className="w-3 h-3" />
          In immediate danger?{" "}
          <a href="tel:999" className="font-bold text-destructive">999</a>
          {" or "}
          <a href="tel:1195" className="font-bold text-destructive">1195 (GBV Helpline)</a>
        </div>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}

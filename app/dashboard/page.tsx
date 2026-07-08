import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { FileText, Clock, CheckCircle, Plus, Briefcase, AlertTriangle, User, Shield } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { LangSwitcher } from "@/components/lang-switcher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CredentialsBanner } from "@/components/credentials-banner";

const STATUS_META: Record<string, { label: string; variant: "secondary" | "info" | "success" | "warning" | "destructive" }> = {
  submitted:    { label: "Submitted",          variant: "secondary" },
  under_review: { label: "Under review",       variant: "info" },
  referred:     { label: "Referred for support", variant: "success" },
  closed:       { label: "Closed",             variant: "secondary" },
  flagged:      { label: "Urgent",             variant: "destructive" },
};

const VERIF_META: Record<string, { label: string; variant: "secondary" | "info" | "success" | "warning" | "destructive" }> = {
  pending:         { label: "Pending review",      variant: "info" },
  verified:        { label: "Verified",            variant: "success" },
  unverified:      { label: "Could not verify",   variant: "destructive" },
  needs_more_info: { label: "More info needed",    variant: "warning" },
};

async function DashboardContent() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, is_anonymous, user_type, email, onboarding_completed")
    .eq("id", user.id)
    .single();

  // Only admin users see the admin console; reporter users see their own reports
  if (profile && profile.user_type === "admin") {
    redirect("/admin");
  }

  // ALL users must accept T&C before accessing their dashboard.
  // Anonymous users skip role selection but still go through onboarding.
  if (profile && !profile.onboarding_completed) {
    redirect("/onboarding");
  }

  const { data: reports } = await supabase
    .from("reports")
    .select("id, incident_types, status, urgency, verification_status, created_at, county, reporter_type")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const reportIds = (reports ?? []).map(r => r.id);
  const { data: assignedServices } = reportIds.length > 0
    ? await supabase
        .from("report_services")
        .select("report_id, note, services(name, category, organization, contact_phone, contact_email, contact_url)")
        .in("report_id", reportIds)
    : { data: [] };

  // If profile row doesn't exist yet (e.g. trigger delay after Google OAuth),
  // detect anonymity by email domain rather than defaulting to true.
  const isAnon = profile
    ? profile.is_anonymous
    : (user.email?.endsWith("@whrdhub.local") ?? false);

  const username   = profile?.username     ?? user.email?.split("@")[0] ?? "reporter";
  const greeting   = profile?.display_name ?? profile?.username ?? "there";
  const loginEmail = isAnon ? `${username}@whrdhub.local` : (profile?.email ?? user.email ?? "");

  const stats = [
    { label: "Reports submitted", value: reports?.length ?? 0,                                                              icon: FileText,      color: "text-primary bg-primary/10" },
    { label: "Under review",      value: reports?.filter(r => r.status === "under_review").length ?? 0,                    icon: Clock,         color: "text-amber-600 bg-amber-100" },
    { label: "Resolved",          value: reports?.filter(r => ["referred","closed"].includes(r.status ?? "")).length ?? 0,  icon: CheckCircle,   color: "text-green-600 bg-green-100" },
  ];

  return (
    <>
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 py-3 sm:py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <img src="/main-logo.png" alt="WHRD Hub" className="h-8 sm:h-9 w-auto object-contain" />
          </div>
          <div className="flex items-center gap-1 sm:gap-3">
            {profile?.user_type === "admin" && (
              <span className="hidden md:inline-flex items-center gap-1 text-xs font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full border border-primary/20">
                <Shield className="w-3 h-3" /> Admin
              </span>
            )}
            <LangSwitcher variant="compact" />
            <Link href="/profile"
              className="hidden xs:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 sm:px-3 py-1.5 rounded-lg hover:bg-muted">
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs sm:text-sm">{username}</span>
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-5 py-6 sm:py-10 space-y-6 sm:space-y-8">

        {/* Greeting */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-foreground">Hello, {greeting}</h1>
            <p className="text-muted-foreground text-sm mt-1">Track your reports and access support services here.</p>
          </div>
          <Button asChild size="sm">
            <Link href="/report"><Plus className="w-4 h-4 mr-1.5" />New report</Link>
          </Button>
        </div>

        {/* Anonymous credentials banner - dismissible */}
        {isAnon && (
          <CredentialsBanner username={username} loginEmail={loginEmail} />
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-border p-5 flex items-center gap-4 shadow-sm">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-black">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Assigned services */}
        {assignedServices && assignedServices.length > 0 && (
          <div>
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />Support services for you
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {assignedServices.map((a, i) => {
                const svc = (Array.isArray(a.services) ? a.services[0] : a.services) as {
                  name: string; category: string; organization?: string;
                  contact_phone?: string; contact_email?: string; contact_url?: string;
                } | null;
                return (
                  <div key={i} className="bg-white rounded-2xl border border-border p-5 space-y-3 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm">{svc?.name}</p>
                        {svc?.organization && <p className="text-xs text-muted-foreground">{svc.organization}</p>}
                      </div>
                      <Badge variant="secondary" className="shrink-0 capitalize">{svc?.category?.replace(/_/g, " ")}</Badge>
                    </div>
                    {a.note && <p className="text-xs text-muted-foreground italic">"{a.note}"</p>}
                    <div className="flex flex-wrap gap-3 text-xs">
                      {svc?.contact_phone && <a href={`tel:${svc.contact_phone}`} className="text-primary hover:underline font-medium">{svc.contact_phone}</a>}
                      {svc?.contact_email && <a href={`mailto:${svc.contact_email}`} className="text-primary hover:underline font-medium">{svc.contact_email}</a>}
                      {svc?.contact_url  && <a href={svc.contact_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">Visit website</a>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reports */}
        <div>
          <h2 className="font-bold text-lg mb-4">Your reports</h2>
          {!reports?.length ? (
            <div className="bg-white rounded-2xl border border-border p-12 text-center shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <FileText className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="font-semibold mb-1 text-foreground">No reports yet</p>
              <p className="text-sm text-muted-foreground mb-5">Your submitted reports will appear here once you make one.</p>
              <Button asChild size="sm">
                <Link href="/report">Make your first report</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map(r => {
                const sm = (r.status && STATUS_META[r.status]) || STATUS_META.submitted;
                const vm = (r.verification_status && VERIF_META[r.verification_status]) || VERIF_META.pending;
                const services = assignedServices?.filter(a => a.report_id === r.id) ?? [];
                return (
                  <Link key={r.id} href={`/dashboard/reports/${r.id}`} className="block bg-white rounded-2xl border border-border p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all space-y-3">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex flex-wrap gap-1.5">
                          {(r.incident_types as string[]).slice(0, 3).map(t => (
                            <span key={t} className="text-xs bg-muted px-2.5 py-0.5 rounded-full capitalize">{t.replace(/_/g, " ")}</span>
                          ))}
                          {(r.incident_types as string[]).length > 3 && (
                            <span className="text-xs text-muted-foreground">+{(r.incident_types as string[]).length - 3} more</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          {r.county && <span>{r.county}</span>}
                          <span>{new Date(r.created_at!).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}</span>
                          {r.urgency === "immediate" && (
                            <span className="text-destructive font-semibold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />Immediate
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 items-end shrink-0">
                        <Badge variant={sm.variant}>{sm.label}</Badge>
                        <Badge variant={vm.variant}>{vm.label}</Badge>
                      </div>
                    </div>
                    {services.length > 0 && (
                      <div className="px-3 py-2 rounded-xl bg-green-50 border border-green-200 text-xs text-green-800">
                        <span className="font-semibold">Services assigned: </span>
                        {services.map(a => ((Array.isArray(a.services) ? a.services[0] : a.services) as { name: string } | null)?.name).filter(Boolean).join(", ")}
                      </div>
                    )}
                    <p className="text-[10px] font-mono text-muted-foreground/60 border-t border-border pt-2">Case ID: {r.id}</p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Emergency resources */}
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
          <h2 className="font-bold text-sm mb-4 text-foreground">Emergency contacts</h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {[
              { label: "Kenya Police",      value: "999" },
              { label: "GBV Helpline",      value: "1195" },
              { label: "Childline Kenya",   value: "116" },
              { label: "FIDA Kenya",        value: "+254 20 3875590" },
            ].map(r => (
              <a key={r.label} href={`tel:${r.value.replace(/\s/g, "")}`}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted transition-colors">
                <span className="text-sm text-muted-foreground">{r.label}</span>
                <span className="font-bold text-primary text-sm">{r.value}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Footer with legal links */}
        <div className="border-t border-border pt-6 mt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>© 2025 WHRD Hub. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link href="/privacy-policy" className="hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <span className="opacity-30">•</span>
              <Link href="/terms-of-use" className="hover:text-primary transition-colors">
                Terms of Use
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-muted/30">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      }>
        <DashboardContent />
      </Suspense>
    </main>
  );
}

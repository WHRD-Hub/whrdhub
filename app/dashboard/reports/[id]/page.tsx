import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, MapPin, Calendar, Shield, AlertCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LangSwitcher } from "@/components/lang-switcher";
import { NotificationBell } from "@/components/notification-bell";
import { notFound } from "next/navigation";
import { translations } from "@/lib/i18n/translations";
import { getServerLanguage } from "@/lib/i18n/server";

type BadgeMeta = { color: string; label: string };

export const metadata = {
  title: "Report Details | WHRD Hub",
};

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("preferred_language")
    .eq("id", session.user.id)
    .single();

  const lang = await getServerLanguage(profile?.preferred_language);
  const t = translations[lang].reportDetail;
  const td = translations[lang].dashboard;

  const { data: report, error: reportError } = await supabase
    .from("reports")
    .select(
      `*,
       report_services (
         id, service_id, assigned_at, note,
         services (id, name, description, contact_phone, contact_email, contact_url)
       )`
    )
    .eq("id", id)
    .eq("user_id", session.user.id)
    .single();

  if (reportError || !report) return notFound();

  const isVerified = report.verification_status === "verified";

  // Support-service details only ever surface once the case has been fact-checked
  // and verified — matches the same rule enforced on the dashboard list.
  const visibleServices = isVerified ? (report.report_services ?? []) : [];

  const STATUS_META: Record<string, BadgeMeta> = {
    submitted:    { color: "bg-blue-100 text-blue-700",   label: td.statusSubmitted },
    under_review: { color: "bg-purple-100 text-purple-700", label: td.statusUnderReview },
    referred:     { color: "bg-green-100 text-green-700",  label: td.statusReferred },
    closed:       { color: "bg-gray-100 text-gray-700",    label: td.statusClosed },
    flagged:      { color: "bg-red-100 text-red-700",      label: td.statusFlagged },
  };

  const VERIF_META: Record<string, BadgeMeta> = {
    pending:         { color: "bg-yellow-100 text-yellow-700", label: td.verifPending },
    verified:        { color: "bg-green-100 text-green-700",   label: td.verifVerified },
    unverified:      { color: "bg-red-100 text-red-700",       label: td.verifUnverified },
    needs_more_info: { color: "bg-orange-100 text-orange-700", label: td.verifNeedsMoreInfo },
  };

  const sm = (report.status && STATUS_META[report.status]) || STATUS_META.submitted;
  const vm = (report.verification_status && VERIF_META[report.verification_status]) || VERIF_META.pending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-border shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-muted rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-primary">{t.title}</h1>
              <p className="text-sm text-muted-foreground">{t.status}: {report.id.slice(0, 8)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <NotificationBell />
            <LangSwitcher variant="compact" />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Status Cards */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className={`p-4 rounded-xl ${sm.color}`}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1 opacity-75">{t.status}</p>
            <p className="text-lg font-bold">{sm.label}</p>
          </div>
          <div className={`p-4 rounded-xl ${vm.color}`}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1 opacity-75">{t.verification}</p>
            <p className="text-lg font-bold">{vm.label}</p>
          </div>
        </div>

        {/* Report Context */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            {t.reportContext}
          </h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t.reportingFor}</dt>
              <dd className="font-medium capitalize">{report.reporting_for?.replace(/_/g, " ")}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t.violenceType}</dt>
              <dd className="font-medium capitalize">{(report.incident_types ?? []).map(it => it.replace(/_/g, " ")).join(", ")}</dd>
            </div>
          </dl>
        </div>

        {/* What Happened */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-primary" />
            {t.whatHappened}
          </h2>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">{t.description}</p>
              <p className="bg-muted/50 rounded-lg p-3 leading-relaxed">{report.description}</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground mb-1 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {t.county}
                </p>
                <p className="font-medium">{report.county}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {t.whenOccurred}
                </p>
                <p className="font-medium">
                  {report.occurred_at ? new Date(report.occurred_at).toLocaleDateString() : t.notSpecified}
                </p>
              </div>
            </div>
            {report.location_description && (
              <div>
                <p className="text-muted-foreground mb-1">{t.locationDetails}</p>
                <p className="bg-muted/50 rounded-lg p-3">{report.location_description}</p>
              </div>
            )}
            {report.is_ongoing && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {t.ongoing}
              </div>
            )}
          </div>
        </div>

        {/* Who Section */}
        {report.perpetrator_type && (
          <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-bold">{t.perpetratorInfo}</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground mb-1">{t.perpetratorType}</dt>
                <dd className="font-medium capitalize">{report.perpetrator_type?.replace(/_/g, " ")}</dd>
              </div>
              {report.perpetrator_detail && (
                <div>
                  <dt className="text-muted-foreground mb-1">{t.perpetratorDetails}</dt>
                  <dd className="font-medium">{report.perpetrator_detail}</dd>
                </div>
              )}
            </dl>
          </div>
        )}

        {/* Online Evidence */}
        {report.tfgbv_platform && (
          <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              {t.onlineEvidence}
            </h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground mb-1">{t.platform}</dt>
                <dd className="font-medium">{report.tfgbv_platform}</dd>
              </div>
              {report.tfgbv_link && (
                <div>
                  <dt className="text-muted-foreground mb-1">{t.link}</dt>
                  <dd className="font-mono text-xs bg-muted/50 rounded p-2 break-all text-primary hover:underline">
                    <a href={report.tfgbv_link} target="_blank" rel="noopener noreferrer">
                      {report.tfgbv_link}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
            {report.tfgbv_screenshot_urls && report.tfgbv_screenshot_urls.length > 0 && (
              <div>
                <p className="text-muted-foreground mb-3">{t.screenshots} ({report.tfgbv_screenshot_urls.length})</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {report.tfgbv_screenshot_urls.map((url: string, i: number) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg overflow-hidden hover:opacity-80 transition-opacity border border-border"
                    >
                      <img
                        src={url}
                        alt={`Screenshot ${i + 1}`}
                        className="w-full h-40 object-cover"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Support Needed */}
        {report.support_needed && report.support_needed.length > 0 && (
          <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-bold">{t.supportRequested}</h2>
            <div className="flex flex-wrap gap-2">
              {report.support_needed.map((service: string) => (
                <span
                  key={service}
                  className="bg-primary/10 text-primary text-sm px-3 py-1.5 rounded-full font-medium capitalize"
                >
                  {service.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Assigned Services — only once verified */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold">{t.assignedServices}</h2>
          {!isVerified ? (
            <p className="text-sm text-muted-foreground">{t.notVerifiedYet}</p>
          ) : visibleServices.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.notSpecified}</p>
          ) : (
            <div className="space-y-3">
              {visibleServices.map((assignment) => {
                const svc = assignment.services as {
                  name: string; description: string | null;
                  contact_phone?: string | null; contact_email?: string | null; contact_url?: string | null;
                } | null;
                return (
                  <div key={assignment.id} className="border border-border rounded-lg p-4">
                    <h3 className="font-bold mb-1">{svc?.name}</h3>
                    {svc?.description && <p className="text-sm text-muted-foreground mb-2">{svc.description}</p>}
                    <div className="flex flex-wrap gap-3 text-xs mb-2">
                      {svc?.contact_phone && <a href={`tel:${svc.contact_phone}`} className="text-primary hover:underline font-medium">{svc.contact_phone}</a>}
                      {svc?.contact_email && <a href={`mailto:${svc.contact_email}`} className="text-primary hover:underline font-medium">{svc.contact_email}</a>}
                      {svc?.contact_url && <a href={svc.contact_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">{svc.contact_url}</a>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t.assignedOn} {new Date(assignment.assigned_at!).toLocaleDateString()}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Contact & Urgency */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold">{t.contactUrgency}</h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground mb-1">{t.urgency}</dt>
              <dd className="font-medium capitalize">{report.urgency?.replace(/_/g, " ")}</dd>
            </div>
            {report.contact_method && (
              <>
                <div>
                  <dt className="text-muted-foreground mb-1">{t.preferredContact}</dt>
                  <dd className="font-medium capitalize">{report.contact_method?.replace(/_/g, " ")}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground mb-1">{t.contactDetails}</dt>
                  <dd className="font-mono bg-muted/50 rounded p-2 text-xs">{report.contact_value}</dd>
                </div>
              </>
            )}
          </dl>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold">{t.timeline}</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <dt className="text-muted-foreground">{t.submitted}</dt>
              <dd className="font-medium">{new Date(report.created_at!).toLocaleString()}</dd>
            </div>
            {report.updated_at && (
              <div className="flex justify-between items-center">
                <dt className="text-muted-foreground">{t.lastUpdated}</dt>
                <dd className="font-medium">{new Date(report.updated_at).toLocaleString()}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-center pt-4">
          <Button asChild variant="outline">
            <Link href="/dashboard">← {t.back}</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}

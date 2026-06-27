import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { FileText, Clock, CheckCircle, AlertTriangle, Users, Shield } from "lucide-react";
import { ReportsCharts } from "@/components/admin/reports-charts";

async function AdminDashboardContent() {
  const supabase = await createClient();

  const { data: reports } = await supabase
    .from("reports")
    .select("id, incident_types, status, urgency, verification_status, reporter_type, county, created_at");

  const total = reports?.length ?? 0;
  const pending = reports?.filter(r => r.verification_status === "pending").length ?? 0;
  const immediate = reports?.filter(r => r.urgency === "immediate").length ?? 0;
  const verified = reports?.filter(r => r.verification_status === "verified").length ?? 0;
  const anonymous = reports?.filter(r => r.reporter_type === "anonymous").length ?? 0;
  const authenticated = total - anonymous;

  // Build chart data
  const incidentCounts: Record<string, number> = {};
  reports?.forEach(r => {
    (r.incident_types as string[]).forEach(t => {
      incidentCounts[t] = (incidentCounts[t] || 0) + 1;
    });
  });
  const incidentBreakdown = Object.entries(incidentCounts)
    .map(([k, v]) => ({ name: k.replace(/_/g, " "), count: v }))
    .sort((a, b) => b.count - a.count).slice(0, 10);

  const countyCounts: Record<string, number> = {};
  reports?.forEach(r => { if (r.county) countyCounts[r.county] = (countyCounts[r.county] || 0) + 1; });
  const countyBreakdown = Object.entries(countyCounts)
    .map(([k, v]) => ({ name: k, count: v }))
    .sort((a, b) => b.count - a.count);

  const urgencyBreakdown = [
    { name: "Immediate", count: reports?.filter(r => r.urgency === "immediate").length ?? 0 },
    { name: "Within Week", count: reports?.filter(r => r.urgency === "within_week").length ?? 0 },
    { name: "No Rush", count: reports?.filter(r => r.urgency === "no_rush").length ?? 0 },
  ];

  const verificationBreakdown = [
    { name: "Pending", count: reports?.filter(r => r.verification_status === "pending").length ?? 0 },
    { name: "Verified", count: reports?.filter(r => r.verification_status === "verified").length ?? 0 },
    { name: "Unverified", count: reports?.filter(r => r.verification_status === "unverified").length ?? 0 },
    { name: "Needs Info", count: reports?.filter(r => r.verification_status === "needs_more_info").length ?? 0 },
  ];

  const reporterTypeBreakdown = [
    { name: "Anonymous", value: anonymous },
    { name: "Authenticated", value: authenticated },
  ];

  // Monthly trend (last 6 months)
  const months: Record<string, { anonymous: number; authenticated: number }> = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleString("en", { month: "short", year: "2-digit" });
    months[key] = { anonymous: 0, authenticated: 0 };
  }
  reports?.forEach(r => {
    const d = new Date(r.created_at);
    const key = d.toLocaleString("en", { month: "short", year: "2-digit" });
    if (months[key]) {
      months[key][r.reporter_type === "anonymous" ? "anonymous" : "authenticated"]++;
    }
  });
  const monthlyTrend = Object.entries(months).map(([month, v]) => ({ month, ...v }));

  const chartData = { incidentBreakdown, countyBreakdown, urgencyBreakdown, verificationBreakdown, reporterTypeBreakdown, monthlyTrend };

  const stats = [
    { label: "Total Reports", value: total, icon: FileText, color: "text-primary bg-primary/10" },
    { label: "Pending Review", value: pending, icon: Clock, color: "text-yellow-600 bg-yellow-100" },
    { label: "Immediate Urgency", value: immediate, icon: AlertTriangle, color: "text-red-600 bg-red-100" },
    { label: "Verified", value: verified, icon: CheckCircle, color: "text-green-600 bg-green-100" },
    { label: "Anonymous Reports", value: anonymous, icon: Shield, color: "text-purple-600 bg-purple-100" },
    { label: "Authenticated Users", value: authenticated, icon: Users, color: "text-blue-600 bg-blue-100" },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-foreground mb-1">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm">Overview of all reports and platform activity.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-border p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-black">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <ReportsCharts data={chartData} />
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="p-8 grid grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-xl border h-24 animate-pulse" />)}
      </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  );
}

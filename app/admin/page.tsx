import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { AdminDashboardClient, type Report } from "@/components/admin/dashboard-client";

async function AdminDashboardData() {
  const supabase = await createClient();

  const { data: reports } = await supabase
    .from("reports")
    .select("id, incident_types, status, urgency, verification_status, reporter_type, county, created_at, latitude, longitude, description, perpetrator_type, channel");

  return <AdminDashboardClient reports={(reports ?? []) as Report[]} />;
}

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="p-8 space-y-4">
        <div className="h-8 w-48 bg-muted/50 rounded animate-pulse" />
        <div className="h-24 grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="bg-muted/30 rounded-xl animate-pulse" />)}
        </div>
        <div className="h-64 bg-muted/20 rounded-xl animate-pulse" />
      </div>
    }>
      <AdminDashboardData />
    </Suspense>
  );
}

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import { MapView } from "@/components/map-view";

async function MapData() {
  const supabase = await createClient();
  const { data: reports } = await supabase
    .from("reports")
    .select("id, latitude, longitude, incident_types, county, urgency, reporter_type, verification_status, created_at")
    .not("latitude", "is", null)
    .not("longitude", "is", null);

  return <MapView reports={reports ?? []} />;
}

export default function MapPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-primary-foreground px-6 py-4">
        <Link href="/admin/reports" className="inline-flex items-center gap-1.5 text-xs font-semibold opacity-90 hover:opacity-100 mb-2">
          <ArrowLeft className="w-4 h-4" /> Back to reports
        </Link>
        <h1 className="font-black text-lg">WHRD Hub - Incident Map</h1>
        <p className="text-xs opacity-70">Reports with GPS coordinates. Data is anonymized.</p>
      </header>
      <div className="flex-1">
        <Suspense fallback={<div className="flex-1 bg-muted/20 flex items-center justify-center h-96 text-muted-foreground">Loading map data...</div>}>
          <MapData />
        </Suspense>
      </div>
    </div>
  );
}

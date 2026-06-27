"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ExternalLink, MapPin, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Report {
  id: string;
  latitude: number;
  longitude: number;
  incident_types: string[];
  county?: string;
  urgency: string;
  reporter_type: string;
  verification_status: string;
  created_at: string;
}

const URGENCY_COLORS: Record<string, string> = {
  immediate: "#ef4444",
  within_week: "#f59e0b",
  no_rush: "#10b981",
};

export function MapView({ reports }: { reports: Report[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!mapRef.current || typeof window === "undefined" || initializedRef.current) return;
    initializedRef.current = true;

    import("leaflet").then(L => {
      if (!mapRef.current) return;

      delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current).setView([-0.0236, 37.9062], 6);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      const markers = reports.map(r => {
        const color = URGENCY_COLORS[r.urgency] || "#6b21a8";
        const isAnon = r.reporter_type === "anonymous";

        const icon = L.divIcon({
          className: "",
          html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);opacity:${isAnon ? 0.7 : 1};cursor:pointer" data-id="${r.id}"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });

        const marker = L.marker([r.latitude, r.longitude], { icon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family:sans-serif;font-size:12px;min-width:200px">
            <p style="font-weight:700;margin:0 0 4px;font-size:13px">${(r.incident_types || []).map((t: string) => t.replace(/_/g, " ")).join(", ") || "Incident"}</p>
            <p style="color:#666;margin:0 0 2px"><strong>${r.county || "Unknown"}</strong></p>
            <p style="margin:0 0 2px">Urgency: <span style="color:${color};font-weight:600">${r.urgency?.replace(/_/g, " ")}</span></p>
            <p style="margin:0 0 2px">${r.reporter_type} · ${new Date(r.created_at).toLocaleDateString()}</p>
            <p style="margin:4px 0 0"><a href="/admin/reports/${r.id}" style="color:violet;font-weight:600;text-decoration:underline">Fact-check →</a></p>
          </div>
        `);
        marker.on("click", () => setSelectedId(r.id));
        return marker;
      });

      markersRef.current = markers;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current = [];
      }
      initializedRef.current = false;
    };
  }, []);

  const handleSelect = (r: Report) => {
    setSelectedId(r.id);
    const map = mapInstanceRef.current;
    if (map) map.flyTo([r.latitude, r.longitude], 10, { duration: 0.8 });
  };

  const geotagged = reports.filter(r => r.latitude && r.longitude);

  return (
    <div className="flex h-[calc(100vh-80px)]">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? "w-72" : "w-0"} transition-all duration-300 bg-white border-r border-border overflow-hidden shrink-0`}>
        <div className="w-72 h-full flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="font-bold text-sm">Incidents on Map</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{geotagged.length} geotagged report{geotagged.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {geotagged.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">No geotagged reports yet.</div>
            ) : geotagged.map(r => (
              <button
                key={r.id}
                onClick={() => handleSelect(r)}
                className={`w-full text-left p-3.5 hover:bg-muted/20 transition-colors ${selectedId === r.id ? "bg-primary/5 border-l-2 border-primary" : ""}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-xs font-semibold capitalize truncate">
                    {(r.incident_types || []).slice(0, 2).map(t => t.replace(/_/g, " ")).join(", ") || "Incident"}
                  </span>
                  <div
                    className="w-2.5 h-2.5 rounded-full border border-white shrink-0 mt-0.5"
                    style={{ background: URGENCY_COLORS[r.urgency] || "#6b21a8" }}
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span>{r.county || "Unknown county"}</span>
                  <span>·</span>
                  <span>{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge variant={URGENCY_COLORS[r.urgency] === "#ef4444" ? "destructive" : "secondary"} className="text-[10px] px-1.5 py-0">
                    {r.urgency?.replace(/_/g, " ")}
                  </Badge>
                  <Link
                    href={`/admin/reports/${r.id}`}
                    onClick={e => e.stopPropagation()}
                    className="text-xs text-primary hover:underline flex items-center gap-0.5 ml-auto"
                  >
                    Fact-check <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="absolute inset-0" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-white transition-colors"
        >
          {sidebarOpen ? "Hide list" : "Show list"}
        </button>
        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-border p-3 z-[1000] space-y-1.5 text-xs">
          <p className="font-bold text-xs mb-1.5">Legend</p>
          {Object.entries(URGENCY_COLORS).map(([key, color]) => (
            <div key={key} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border border-white shadow-sm" style={{ background: color }} />
              <span className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}</span>
            </div>
          ))}
          <p className="text-muted-foreground pt-1 border-t border-border mt-1.5">{geotagged.length} geotagged reports</p>
        </div>
      </div>
    </div>
  );
}

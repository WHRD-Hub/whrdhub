"use client";

import { useEffect, useRef } from "react";

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

const URGENCY_COLORS = { immediate: "#ef4444", within_week: "#f59e0b", no_rush: "#10b981" };

export function MapView({ reports }: { reports: Report[] }) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current || typeof window === "undefined") return;

    let map: L.Map;

    import("leaflet").then(L => {
      // Fix default icon paths (Leaflet + webpack issue)
      delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      map = L.map(mapRef.current!).setView([-0.0236, 37.9062], 6);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      reports.forEach(r => {
        const color = URGENCY_COLORS[r.urgency as keyof typeof URGENCY_COLORS] || "#6b21a8";
        const isAnon = r.reporter_type === "anonymous";

        const icon = L.divIcon({
          className: "",
          html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4);opacity:${isAnon ? 0.7 : 1}"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });

        const popup = L.popup().setContent(`
          <div style="font-family:sans-serif;font-size:12px;min-width:180px">
            <p style="font-weight:700;margin:0 0 4px">${(r.incident_types || []).map((t: string) => t.replace(/_/g, " ")).join(", ") || "Incident"}</p>
            <p style="color:#666;margin:0 0 2px">${r.county || "Unknown county"}</p>
            <p style="margin:0 0 2px">Urgency: <strong style="color:${color}">${r.urgency?.replace(/_/g, " ")}</strong></p>
            <p style="margin:0 0 2px">Reporter: ${r.reporter_type}</p>
            <p style="margin:0;color:#999">${new Date(r.created_at).toLocaleDateString()}</p>
          </div>
        `);

        L.marker([r.latitude, r.longitude], { icon }).bindPopup(popup).addTo(map);
      });
    });

    return () => { map?.remove(); };
  }, [reports]);

  // Legend
  return (
    <div className="relative">
      <div ref={mapRef} style={{ height: "calc(100vh - 80px)" }} />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div className="absolute bottom-6 right-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-border p-3 z-[1000] space-y-2 text-xs">
        <p className="font-bold text-xs">Legend</p>
        {[
          { color: "#ef4444", label: "Immediate urgency" },
          { color: "#f59e0b", label: "Within week" },
          { color: "#10b981", label: "No rush" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border border-white shadow-sm" style={{ background: color }} />
            <span className="text-muted-foreground">{label}</span>
          </div>
        ))}
        <div className="pt-1 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border border-white shadow-sm opacity-60" style={{ background: "#6b21a8" }} />
            <span className="text-muted-foreground">Anonymous (dimmed)</span>
          </div>
        </div>
        <p className="text-muted-foreground pt-1 border-t border-border">{reports.length} geotagged reports</p>
      </div>
    </div>
  );
}

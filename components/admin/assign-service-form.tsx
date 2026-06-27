"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { assignService } from "@/app/actions/admin-actions";
import { toast } from "sonner";

interface Service { id: string; name: string; category: string; organization?: string }

export function AssignServiceForm({ reportId, services }: { reportId: string; services: Service[] }) {
  const [serviceId, setServiceId] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAssign = async () => {
    if (!serviceId) return;
    setLoading(true);
    const result = await assignService(reportId, serviceId, note);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Service assigned to this report");
      setServiceId(""); setNote("");
    }
    setLoading(false);
  };

  if (!services.length) {
    return <p className="text-xs text-muted-foreground">All available services have been assigned.</p>;
  }

  return (
    <div className="space-y-2 pt-2 border-t border-border">
      <p className="text-xs font-semibold text-muted-foreground uppercase">Assign a Service</p>
      <select value={serviceId} onChange={e => setServiceId(e.target.value)}
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
        <option value="">Select service...</option>
        {services.map(s => (
          <option key={s.id} value={s.id}>{s.name} ({s.category}){s.organization ? ` - ${s.organization}` : ""}</option>
        ))}
      </select>
      <input type="text" value={note} onChange={e => setNote(e.target.value)}
        placeholder="Optional note to reporter..."
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
      <Button onClick={handleAssign} disabled={!serviceId || loading} size="sm" variant="outline" className="gap-1 w-full">
        <Plus className="w-3.5 h-3.5" /> Assign Service
      </Button>
    </div>
  );
}

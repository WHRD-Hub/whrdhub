"use client";

import { useState } from "react";
import { CheckCircle, XCircle, HelpCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { verifyReport } from "@/app/actions/admin-actions";
import { toast } from "sonner";

const OPTIONS = [
  { value: "verified", label: "Verified — Credible", icon: CheckCircle, color: "text-green-600 bg-green-50 border-green-200 hover:border-green-400" },
  { value: "needs_more_info", label: "Needs More Info", icon: AlertTriangle, color: "text-yellow-600 bg-yellow-50 border-yellow-200 hover:border-yellow-400" },
  { value: "unverified", label: "Could Not Verify", icon: XCircle, color: "text-red-600 bg-red-50 border-red-200 hover:border-red-400" },
  { value: "pending", label: "Keep as Pending", icon: HelpCircle, color: "text-blue-600 bg-blue-50 border-blue-200 hover:border-blue-400" },
];

export function FactCheckForm({ reportId, currentStatus, currentNotes }: {
  reportId: string; currentStatus: string; currentNotes?: string | null;
}) {
  const [status, setStatus] = useState(currentStatus || "pending");
  const [notes, setNotes] = useState(currentNotes || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const result = await verifyReport(reportId, status, notes);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Fact-check status updated");
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-xl border border-border p-6 space-y-4">
      <h2 className="font-bold text-base flex items-center gap-2">
        <CheckCircle className="w-4 h-4 text-primary" />
        Fact-Check / Verification
      </h2>
      <div className="grid sm:grid-cols-2 gap-2">
        {OPTIONS.map(({ value, label, icon: Icon, color }) => (
          <button key={value} type="button" onClick={() => setStatus(value)}
            className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${status === value ? color + " ring-2 ring-offset-1 ring-current" : "border-border bg-muted/30 hover:border-primary/40"}`}>
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </button>
        ))}
      </div>
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">Verification Notes</label>
        <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
          placeholder="Describe what was checked, sources consulted, reasons for the decision..." />
      </div>
      <Button onClick={handleSubmit} disabled={loading} size="sm">
        {loading ? "Saving..." : "Save Fact-Check Decision"}
      </Button>
    </div>
  );
}

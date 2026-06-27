"use client";

import { useState, useTransition, KeyboardEvent } from "react";
import {
  CheckCircle, XCircle, HelpCircle, AlertTriangle,
  Tag, X, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { factCheckReport } from "@/app/actions/admin-actions";
import { toast } from "sonner";

/* ── incident type options ── */
const INCIDENT_TYPES = [
  { value: "online_harassment",              label: "Online Harassment" },
  { value: "cyberstalking",                  label: "Cyberstalking" },
  { value: "non_consensual_intimate_images", label: "Non-Consensual Intimate Images (NCII)" },
  { value: "doxxing",                        label: "Doxxing / Identity Exposure" },
  { value: "impersonation",                  label: "Impersonation / Fake Profiles" },
  { value: "hate_speech",                    label: "Hate Speech / Slurs" },
  { value: "threats",                        label: "Threats & Intimidation" },
  { value: "coordinated_attack",             label: "Coordinated Attack" },
  { value: "online_blackmail",               label: "Online Blackmail / Sextortion" },
  { value: "surveillance_spyware",           label: "Surveillance / Spyware" },
  { value: "hacking",                        label: "Hacking / Account Takeover" },
  { value: "sexual_solicitation",            label: "Sexual Solicitation" },
  { value: "digital_forgery",               label: "Digital Forgery / Deepfake" },
  { value: "other",                          label: "Other / Unclassified" },
];

/* ── attack nature options ── */
const ATTACK_NATURE = [
  { value: "coordinated",  label: "Coordinated",  desc: "Multiple accounts or actors acting in concert" },
  { value: "bot_assisted", label: "Bot-Assisted", desc: "Automated accounts or bot activity involved" },
  { value: "organic",      label: "Organic",      desc: "Individual or spontaneous - not coordinated" },
  { value: "unknown",      label: "Unknown",      desc: "Insufficient evidence to determine" },
];

/* ── verification status options ── */
const VERIF_OPTIONS = [
  { value: "verified",        label: "Verified - Credible",   icon: CheckCircle,   color: "text-green-600 bg-green-50 border-green-200",   ring: "ring-green-400" },
  { value: "needs_more_info", label: "Needs More Info",        icon: AlertTriangle, color: "text-yellow-600 bg-yellow-50 border-yellow-200", ring: "ring-yellow-400" },
  { value: "unverified",      label: "Could Not Verify",       icon: XCircle,       color: "text-red-600 bg-red-50 border-red-200",          ring: "ring-red-400" },
  { value: "pending",         label: "Keep as Pending",        icon: HelpCircle,    color: "text-blue-600 bg-blue-50 border-blue-200",       ring: "ring-blue-400" },
];

/* ── collapsible section ── */
function Section({ title, children, defaultOpen = true }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-muted/20 hover:bg-muted/40 transition-colors text-left"
      >
        <span className="font-semibold text-sm">{title}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="p-5">{children}</div>}
    </div>
  );
}

/* ── derogatory word tag input ── */
function DerogatoryWordInput({
  words, onChange,
}: { words: string[]; onChange: (w: string[]) => void }) {
  const [input, setInput] = useState("");

  const addWord = () => {
    const trimmed = input.trim().replace(/,/g, "");
    if (trimmed && !words.includes(trimmed)) onChange([...words, trimmed]);
    setInput("");
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addWord(); }
    if (e.key === "Backspace" && !input && words.length) onChange(words.slice(0, -1));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 min-h-[40px] p-2 rounded-lg border border-input bg-background focus-within:ring-2 focus-within:ring-ring">
        {words.map(w => (
          <span key={w} className="flex items-center gap-1 bg-destructive/10 text-destructive text-xs font-mono px-2 py-0.5 rounded-md">
            {w}
            <button type="button" onClick={() => onChange(words.filter(x => x !== w))}>
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKey}
          onBlur={addWord}
          placeholder={words.length === 0 ? "Type a word and press Enter…" : ""}
          className="flex-1 min-w-[160px] text-sm bg-transparent outline-none placeholder:text-muted-foreground"
        />
      </div>
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <Tag className="w-3 h-3" />
        Press Enter or comma to add. These are stored as evidence of hate speech content.
      </p>
    </div>
  );
}

/* ── main component ── */
export function FactCheckForm({
  reportId,
  currentStatus,
  currentNotes,
  currentIncidentTypes,
  currentAttackNature,
  currentDerogatoryWords,
}: {
  reportId: string;
  currentStatus: string;
  currentNotes?: string | null;
  currentIncidentTypes?: string[];
  currentAttackNature?: string | null;
  currentDerogatoryWords?: string[];
}) {
  const [status, setStatus]               = useState(currentStatus || "pending");
  const [notes, setNotes]                 = useState(currentNotes || "");
  const [incidentTypes, setIncidentTypes] = useState<string[]>(currentIncidentTypes ?? []);
  const [attackNature, setAttackNature]   = useState(currentAttackNature || "unknown");
  const [derogatoryWords, setDerogatoryWords] = useState<string[]>(currentDerogatoryWords ?? []);
  const [isPending, startTransition]      = useTransition();

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await factCheckReport(reportId, {
        verification_status: status,
        verification_notes: notes,
        incident_types: incidentTypes,
        attack_nature: attackNature,
        derogatory_words: derogatoryWords,
      });
      if (result?.error) toast.error(result.error);
      else toast.success("Fact-check saved successfully");
    });
  };

  return (
    <div className="space-y-3">

      {/* 1 · Verification decision */}
      <Section title="1 · Verification Decision">
        <div className="grid sm:grid-cols-2 gap-2">
          {VERIF_OPTIONS.map(({ value, label, icon: Icon, color, ring }) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatus(value)}
              className={`flex items-center gap-2.5 p-3 rounded-xl border text-sm font-medium transition-all
                ${status === value ? `${color} ring-2 ${ring} ring-offset-1` : "border-border bg-muted/20 hover:border-primary/30"}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          ))}
        </div>
      </Section>

      {/* 2 · TFGBV Classification */}
      <Section title="2 · TFGBV Classification" defaultOpen={false}>
        <p className="text-xs text-muted-foreground mb-3">
          Select all incident types that apply. You may add or remove types from the reporter&apos;s original selection.
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {INCIDENT_TYPES.map(({ value, label }) => {
            const checked = incidentTypes.includes(value);
            return (
              <label
                key={value}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs cursor-pointer transition-colors select-none
                  ${checked ? "border-primary bg-primary/5 text-primary font-semibold" : "border-border hover:border-primary/30"}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    setIncidentTypes(prev =>
                      checked ? prev.filter(t => t !== value) : [...prev, value]
                    )
                  }
                  className="accent-primary shrink-0"
                />
                {label}
              </label>
            );
          })}
        </div>
      </Section>

      {/* 3 · Attack nature */}
      <Section title="3 · Attack Nature Classification" defaultOpen={false}>
        <p className="text-xs text-muted-foreground mb-3">
          Characterise how the attack was carried out based on evidence in the report.
        </p>
        <div className="grid sm:grid-cols-2 gap-2">
          {ATTACK_NATURE.map(({ value, label, desc }) => (
            <label
              key={value}
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors select-none
                ${attackNature === value ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border hover:border-primary/30"}`}
            >
              <input
                type="radio"
                name="attack_nature"
                value={value}
                checked={attackNature === value}
                onChange={() => setAttackNature(value)}
                className="mt-0.5 accent-primary shrink-0"
              />
              <div>
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </label>
          ))}
        </div>
      </Section>

      {/* 4 · Derogatory words */}
      <Section title="4 · Derogatory Words & Hate Speech Evidence" defaultOpen={false}>
        <p className="text-xs text-muted-foreground mb-3">
          Log specific slurs, derogatory terms, or hateful language documented in the incident for evidentiary purposes.
        </p>
        <DerogatoryWordInput words={derogatoryWords} onChange={setDerogatoryWords} />
      </Section>

      {/* 5 · Notes */}
      <Section title="5 · Verification Notes">
        <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
          Notes (visible to all authorised staff)
        </label>
        <Textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={4}
          placeholder="Describe what was checked, sources consulted, reasoning for the decision, and any follow-up actions required…"
        />
      </Section>

      <Button onClick={handleSubmit} disabled={isPending} className="w-full sm:w-auto gap-2">
        <CheckCircle className="w-4 h-4" />
        {isPending ? "Saving…" : "Save Fact-Check"}
      </Button>
    </div>
  );
}

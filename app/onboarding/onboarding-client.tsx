"use client";

import { useState, useTransition } from "react";
import type { KeyboardEvent } from "react";
import {
  Shield, Heart, Check, ChevronDown, ChevronRight,
  ArrowRight, Lock, ArrowLeft,
} from "lucide-react";
import { completeOnboarding } from "./actions";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/context";
import { getTerms } from "@/lib/i18n/terms";
import { LangSwitcher } from "@/components/lang-switcher";

type Role = "admin" | "defender";

/* ─────────────────────────────────────── roles ── */
const ROLES = [
  {
    id: "admin" as Role,
    Icon: Shield,
    label: "Admin",
    tagline: "Platform oversight & fact-checking",
    description:
      "Review all incoming reports, perform TFGBV fact-checking and classification, manage support services, and oversee platform activity.",
    capabilities: [
      "Review and fact-check all reports",
      "Classify TFGBV type and attack nature",
      "Identify derogatory words and content",
      "Assign support services to reporters",
      "Access analytics dashboards and maps",
      "Submit self-reports (filtered separately)",
    ],
    iconBg: "bg-primary/10 text-primary",
    selectedBorder: "border-primary ring-2 ring-primary/20",
    check: "bg-primary",
  },
  {
    id: "defender" as Role,
    Icon: Heart,
    label: "Human Rights Defender (WHRD)",
    tagline: "Reporting, tracking & support access",
    description:
      "Submit reports documenting TFGBV incidents, track case status, access support services assigned to your cases, and manage your secure profile.",
    capabilities: [
      "Submit detailed TFGBV incident reports",
      "Track the status of your submitted reports",
      "Access services assigned to your cases",
      "Receive secure follow-up communications",
      "Manage your anonymous or named profile",
    ],
    iconBg: "bg-rose-100 text-rose-600",
    selectedBorder: "border-rose-500 ring-2 ring-rose-200",
    check: "bg-rose-500",
  },
];

/* ─────────────────────────────── accordion ── */
function AccordionItem({
  title, body, open, onToggle,
}: { title: string; body: string; open: boolean; onToggle: () => void }) {
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/30 transition-colors"
      >
        <span className="font-semibold text-sm text-foreground">{title}</span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed whitespace-pre-line border-t border-border pt-4">
          {body}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────── page ── */
export function OnboardingClient({ isAnon }: { isAnon: boolean }) {
  const { language } = useLanguage();
  const terms = getTerms(language);
  // All users (anonymous and new accounts) go straight to terms - role selection deactivated for testing
  // Everyone becomes a normal user (reporter)
  const [step, setStep] = useState<1 | 2>(2);
  const [selectedRole, setSelectedRole] = useState<Role | "reporter" | null>("reporter");
  const [openAccordions, setOpenAccordions] = useState<Set<number>>(new Set([0]));
  const [accepted, setAccepted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const toggleAccordion = (i: number) =>
    setOpenAccordions(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  const handleComplete = () => {
    if (!accepted) return;
    // Anonymous users pass null - action keeps their user_type unchanged
    const role = isAnon ? null : selectedRole;
    if (!isAnon && !role) return;
    startTransition(async () => {
      await completeOnboarding(role);
    });
  };

  // Step count display - role selection deactivated, all users see only terms step
  const totalSteps = 1;
  const displayStep = 1;

  return (
    <div className="min-h-[100dvh] bg-muted/30 flex flex-col">
      {/* ── header / stepper ── */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/main-logo.png" alt="WHRD Hub" className="h-9 w-auto object-contain" />
          </div>

          <div className="flex items-center gap-3">
            {/* Step indicator - hidden since role selection is deactivated */}
            <span className="hidden sm:inline text-xs text-muted-foreground">{terms.stepLabel}</span>
            <LangSwitcher variant="compact" />
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-3xl w-full mx-auto px-5 py-10">

        {/* ══ STEP 1: Role selection - DEACTIVATED FOR TESTING ══ */}
        {false && (
          <></>
        )}

        {/* ══ STEP 2: Terms (all users) ══ */}
        {step === 2 && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-black text-foreground mb-2">{terms.heading}</h1>
              <p className="text-muted-foreground">
                {terms.intro}
              </p>
            </div>

            <div className="space-y-2 mb-6">
              {terms.sections.map((section, i) => (
                <AccordionItem
                  key={i}
                  title={section.title}
                  body={section.body}
                  open={openAccordions.has(i)}
                  onToggle={() => toggleAccordion(i)}
                />
              ))}
            </div>

            {/* Accept */}
            <div className="bg-white rounded-xl border border-border p-5 mb-4">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={e => setAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-primary shrink-0"
                />
                <span className="text-sm text-foreground leading-relaxed">
                  {terms.acceptLabel}
                </span>
              </label>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              {terms.storedNote}
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleComplete}
                disabled={!accepted || isPending}
                className="gap-2"
              >
                {isPending ? terms.settingUp : terms.continue}
                {!isPending && <ArrowRight className="w-4 h-4" />}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

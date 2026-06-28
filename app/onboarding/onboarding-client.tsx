"use client";

import { useState, useTransition } from "react";
import type { KeyboardEvent } from "react";
import {
  Shield, Heart, Check, ChevronDown, ChevronRight,
  ArrowRight, Lock, ArrowLeft,
} from "lucide-react";
import { completeOnboarding } from "./actions";
import { Button } from "@/components/ui/button";

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

/* ─────────────────────────────── terms ── */
const TERMS = [
  {
    title: "Data Privacy & Confidentiality",
    body: `All reports submitted through WHRD Hub are treated as strictly confidential. We collect only the minimum data required to process each report. Personal information is encrypted at rest and in transit using industry-standard protocols.

Reporter identities are protected at all times. Anonymous accounts cannot be traced back to individuals without user-disclosed information. Platform staff have a duty to maintain confidentiality of all reporter information and case details - disclosure to unauthorised parties is grounds for immediate account suspension.`,
  },
  {
    title: "Acceptable Use Policy",
    body: `WHRD Hub is intended exclusively for reporting and responding to technology-facilitated gender-based violence (TFGBV) and related human rights violations. You may not use this platform to submit false reports, harass individuals, or engage in any activity that violates applicable laws.

All users must use their access only for legitimate platform purposes. Misuse of reporter data, unauthorised disclosure of case information, or abuse of platform features may result in immediate account suspension and referral to relevant authorities.`,
  },
  {
    title: "Fact-Checking & Verification (Staff)",
    body: `Staff who perform fact-checking must document evidence and reasoning clearly. Distinguish between confirmed facts and assessments. Be aware that verification decisions have real consequences for reporters and may influence referrals to support services.

Mark reports as "Needs More Info" rather than "Unverified" when evidence is inconclusive. Verification notes are visible to all authorised staff and must be professional, factual, and trauma-informed at all times.`,
  },
  {
    title: "Your Rights as a User",
    body: `You have the right to access your own account data and request corrections at any time. You have the right to withdraw your consent and delete your account upon request.

You are responsible for maintaining the security of your login credentials and must report any suspected unauthorised access immediately. All use of this platform must comply with applicable data protection laws including Kenya's Data Protection Act 2019.`,
  },
  {
    title: "Platform Safety & Mandatory Escalation",
    body: `If you encounter or submit a report indicating an immediate risk to life or safety, this will be treated as a priority and escalated immediately. Do not delay action on any report marked "Immediate Urgency."

WHRD Hub operates under a duty of care to all users. Staff must adhere to trauma-informed practices at all times and must not re-traumatise reporters through insensitive communication or unnecessary data requests.`,
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
  // Anonymous users go straight to terms (step 2); staff start at step 1
  const [step, setStep] = useState<1 | 2>(isAnon ? 2 : 1);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
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

  // Step count display
  const totalSteps = isAnon ? 1 : 2;
  const displayStep = isAnon ? 1 : step;

  return (
    <div className="min-h-[100dvh] bg-muted/30 flex flex-col">
      {/* ── header / stepper ── */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/main-logo.png" alt="WHRD Hub" className="h-8 w-auto object-contain" />
          </div>

          {/* Step indicator */}
          {!isAnon && (
            <div className="flex items-center gap-1.5">
              {[
                { n: 1, label: "Choose role" },
                { n: 2, label: "Accept terms" },
              ].map(({ n, label }, idx) => {
                const done = n < step;
                const active = n === step;
                return (
                  <div key={n} className="flex items-center gap-1.5">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                        ${done ? "bg-primary text-primary-foreground" : active ? "bg-foreground text-background" : "bg-muted text-muted-foreground"}`}
                    >
                      {done ? <Check className="w-3.5 h-3.5" /> : n}
                    </div>
                    <span className={`text-xs hidden sm:inline ${active ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                      {label}
                    </span>
                    {idx < 1 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                  </div>
                );
              })}
            </div>
          )}

          {isAnon && (
            <span className="text-xs text-muted-foreground">Step 1 of 1 - Terms & Conditions</span>
          )}
        </div>
      </header>

      <div className="flex-1 max-w-3xl w-full mx-auto px-5 py-10">

        {/* ══ STEP 1: Role selection (staff only) ══ */}
        {step === 1 && !isAnon && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-black text-foreground mb-2">Welcome to WHRD Hub</h1>
              <p className="text-muted-foreground">
                Choose the role that describes your work on this platform to set up your account correctly.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {ROLES.map(role => {
                const isSelected = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    className={`relative text-left p-6 rounded-2xl border-2 transition-all bg-white
                      ${isSelected ? role.selectedBorder : "border-border hover:shadow-sm"}`}
                  >
                    {isSelected && (
                      <div className={`absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center ${role.check}`}>
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${role.iconBg}`}>
                      <role.Icon className="w-6 h-6" />
                    </div>
                    <p className="font-black text-lg text-foreground mb-0.5">{role.label}</p>
                    <p className="text-xs text-muted-foreground font-medium mb-3">{role.tagline}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{role.description}</p>
                    <ul className="space-y-1.5">
                      {role.capabilities.map(cap => (
                        <li key={cap} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <Check className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                          {cap}
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!selectedRole} className="gap-2">
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}

        {/* ══ STEP 2: Terms (all users) ══ */}
        {(step === 2 || isAnon) && (
          <>
            {!isAnon && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}

            <div className="mb-8">
              <h1 className="text-3xl font-black text-foreground mb-2">
                {isAnon ? "Before you continue" : "Terms & Conditions"}
              </h1>
              <p className="text-muted-foreground">
                {isAnon
                  ? "Please read and accept our terms before accessing your reports and dashboard."
                  : <>Please read all sections carefully before proceeding as a{" "}
                      <strong>{selectedRole === "admin" ? "platform Admin" : "Human Rights Defender"}</strong>.</>
                }
              </p>
            </div>

            <div className="space-y-2 mb-6">
              {TERMS.map((section, i) => (
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
                  {isAnon
                    ? "I have read and I accept the WHRD Hub Terms & Conditions. I understand my reports are handled confidentially and I may request data deletion at any time."
                    : "I have read and I accept the WHRD Hub Terms & Conditions. I understand my responsibilities as a platform staff member and commit to upholding reporter confidentiality, trauma-informed practice, and platform safety."
                  }
                </span>
              </label>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              Your acceptance is recorded with a timestamp and stored securely on your account.
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleComplete}
                disabled={!accepted || isPending}
                className="gap-2"
              >
                {isPending ? "Setting up your account…" : isAnon ? "Continue to Dashboard" : "Complete Setup"}
                {!isPending && <ArrowRight className="w-4 h-4" />}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

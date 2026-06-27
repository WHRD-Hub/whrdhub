"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Eye, EyeOff, ChevronRight, ChevronLeft, Shield, AlertCircle,
  Link as LinkIcon, Check, MapPin, Upload, X, Loader2, Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { submitReport, type ReportData } from "@/app/actions/submit-report";
import { uploadReportScreenshots } from "@/lib/supabase/storage";
import { CopyButton } from "@/components/copy-button";
import { toast } from "sonner";

// ─── helpers ─────────────────────────────────────────────────────────────────
const L = ({ en, sw }: { en: string; sw: string }) => (
  <span>{en} <span className="text-muted-foreground font-normal text-xs">({sw})</span></span>
);

const Chip = ({
  selected, onClick, en, sw,
}: { selected: boolean; onClick: () => void; en: string; sw: string }) => (
  <button type="button" onClick={onClick}
    className={`text-left px-3 py-2.5 rounded-lg border text-sm transition-all
      ${selected
        ? "bg-primary text-primary-foreground border-primary shadow-sm"
        : "bg-white border-border hover:border-primary/40 hover:shadow-sm"}`}>
    <span className="font-medium leading-tight">{en}</span>
    <span className="block text-[11px] mt-0.5 opacity-60 leading-tight">{sw}</span>
  </button>
);

const Field = ({ label, required, children, hint }: {
  label: React.ReactNode; required?: boolean; children: React.ReactNode; hint?: string;
}) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-semibold">
      {label}{required && <span className="text-destructive ml-0.5">*</span>}
    </label>
    {children}
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);

function toggle(arr: string[], val: string, set: (v: string[]) => void) {
  set(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
}

// ─── data ─────────────────────────────────────────────────────────────────────
const DIGITAL_TYPES = new Set([
  "online_harassment","doxxing","cyber_stalking",
  "non_consensual_images","account_hacking","digital_threats","impersonation",
]);

const INCIDENT_OPTIONS = [
  { value: "online_harassment",      en: "Online harassment / hate speech",       sw: "Unyanyasaji mtandaoni / lugha ya chuki" },
  { value: "doxxing",                en: "Doxxing — private info exposed online", sw: "Kutoa taarifa za kibinafsi mtandaoni" },
  { value: "cyber_stalking",         en: "Cyber stalking / unwanted contact",     sw: "Kufuatwa mtandaoni" },
  { value: "non_consensual_images",  en: "Non-consensual image/video sharing",    sw: "Picha/video bila ridhaa" },
  { value: "account_hacking",        en: "Account hacking / surveillance",        sw: "Kudukuliwa akaunti / ufuatiliaji" },
  { value: "digital_threats",        en: "Digital threats / blackmail",           sw: "Vitisho vya kidijitali / unyakuzi" },
  { value: "impersonation",          en: "Online impersonation",                  sw: "Kujifanya mtu mwingine mtandaoni" },
  { value: "physical_violence",      en: "Physical violence / assault",           sw: "Unyanyasaji wa kimwili" },
  { value: "sexual_violence",        en: "Sexual violence",                       sw: "Unyanyasaji wa kijinsia" },
  { value: "intimate_partner",       en: "Intimate partner violence",             sw: "Unyanyasaji wa mpenzi" },
  { value: "workplace_abuse",        en: "Workplace harassment",                  sw: "Unyanyasaji mahali pa kazi" },
  { value: "hrd_intimidation",       en: "Intimidation targeting HRD work",       sw: "Vitisho dhidi ya kazi ya ulinzi wa haki" },
  { value: "other",                  en: "Other",                                 sw: "Nyingine" },
];

const TFGBV_PLATFORMS = [
  "Facebook","Twitter / X","Instagram","WhatsApp","TikTok","YouTube",
  "Telegram","LinkedIn","Snapchat","Email","SMS / Text","Other",
];

const PERPETRATOR_TYPES = [
  { value: "government",        en: "Government / State",              sw: "Serikali" },
  { value: "security_forces",   en: "Security forces / Police",        sw: "Vikosi vya usalama / Polisi" },
  { value: "intimate_partner",  en: "Intimate partner",                sw: "Mpenzi / Mwenza" },
  { value: "family_member",     en: "Family member",                   sw: "Mwanafamilia" },
  { value: "community_member",  en: "Community member",                sw: "Mwanajamii" },
  { value: "employer",          en: "Employer / Colleague",            sw: "Mwajiri / Mwenzake" },
  { value: "online_troll",      en: "Online troll / anonymous group",  sw: "Mtesi mtandaoni / kikundi kisichojulikana" },
  { value: "unknown",           en: "Unknown",                         sw: "Haijulikani" },
  { value: "other",             en: "Other",                           sw: "Nyingine" },
];

const EVIDENCE_TYPES = [
  { value: "screenshot",     en: "Screenshot",              sw: "Picha ya skrini" },
  { value: "recording",      en: "Recording (audio/video)", sw: "Rekodi (sauti/video)" },
  { value: "link",           en: "Link / URL",              sw: "Kiungo / URL" },
  { value: "witness",        en: "Witness",                 sw: "Shahidi" },
  { value: "medical_report", en: "Medical report",          sw: "Ripoti ya daktari" },
  { value: "chat_logs",      en: "Chat logs / messages",    sw: "Rekodi za mazungumzo" },
];

const SUPPORT_OPTIONS = [
  { value: "legal",           en: "Legal support",                   sw: "Msaada wa kisheria" },
  { value: "medical",         en: "Medical care",                    sw: "Huduma ya afya" },
  { value: "psychosocial",    en: "Counselling / psychosocial",      sw: "Ushauri wa kisaikolojia" },
  { value: "digital_security",en: "Digital security help",           sw: "Msaada wa usalama wa kidijitali" },
  { value: "shelter",         en: "Safe shelter",                    sw: "Makazi salama" },
  { value: "documentation",   en: "Help documenting the case",       sw: "Msaada wa kurekodi kesi" },
  { value: "referral",        en: "Referral to another organisation", sw: "Uhamisho kwa shirika lingine" },
];

const ACTIVISM_CONTEXTS = [
  { value: "environmental",  en: "Environmental advocacy", sw: "Utetezi wa mazingira" },
  { value: "land_rights",    en: "Land rights",            sw: "Haki za ardhi" },
  { value: "womens_rights",  en: "Women's rights",         sw: "Haki za wanawake" },
  { value: "lgbtq",          en: "LGBTQ+ rights",          sw: "Haki za LGBTQ+" },
  { value: "political",      en: "Political activism",     sw: "Uanaharakati wa kisiasa" },
  { value: "labour",         en: "Labour rights",          sw: "Haki za wafanyakazi" },
  { value: "journalism",     en: "Journalism / media",     sw: "Uandishi wa habari" },
  { value: "demonstration",  en: "Demonstration / protest",sw: "Maandamano" },
  { value: "community_org",  en: "Community organising",   sw: "Uongozaji wa jamii" },
  { value: "other",          en: "Other",                  sw: "Nyingine" },
];

const COUNTIES = [
  "Nairobi","Mombasa","Kisumu","Nakuru","Uasin Gishu / Eldoret","Kilifi","Kwale",
  "Kakamega","Bungoma","Machakos","Kajiado","Nyeri","Meru","Embu","Kisii","Migori",
  "Homa Bay","Siaya","Trans Nzoia","West Pokot","Turkana","Garissa","Wajir","Mandera",
  "Marsabit","Isiolo","Laikipia","Nyandarua","Kirinyaga","Murang'a","Kiambu","Narok",
  "Bomet","Kericho","Baringo","Elgeyo-Marakwet","Nandi","Samburu","Tharaka-Nithi",
  "Kitui","Makueni","Taita Taveta","Tana River","Lamu","Other / Outside Kenya",
];

type Step = "what" | "who" | "where_when" | "how" | "why" | "support" | "account";
const STEPS: Step[] = ["what","who","where_when","how","why","support","account"];
const STEP_LABELS = ["What","Who","Where & When","How","Why","Support","Account"];

// ─── component ────────────────────────────────────────────────────────────────
interface ReportFormProps {
  isAuthenticated?: boolean;
  userEmail?: string;
}

export default function ReportForm({ isAuthenticated = false, userEmail }: ReportFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("what");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // WHAT
  const [incidentTypes,   setIncidentTypes]   = useState<string[]>([]);
  const [whatDescription, setWhatDescription] = useState("");
  const [isTfgbv,         setIsTfgbv]         = useState(false);
  const [tfgbvPlatform,   setTfgbvPlatform]   = useState("");
  const [tfgbvLink,       setTfgbvLink]       = useState("");
  const [tfgbvText,       setTfgbvText]       = useState("");
  const [deroWords,       setDeroWords]       = useState("");   // comma / newline separated
  const [attackNature,    setAttackNature]    = useState<"coordinated"|"bot_assisted"|"organic"|"unknown"|"">("");
  const [reportingFor,    setReportingFor]    = useState<"self"|"someone_else"|"community_leader">("self");

  // WHO
  const [perpetratorType,   setPerpType]   = useState("");
  const [perpetratorDetail, setPerpDetail] = useState("");

  // WHERE & WHEN
  const [county,       setCounty]       = useState("");
  const [locationDesc, setLocationDesc] = useState("");
  const [occurredDate, setOccurredDate] = useState("");
  const [occurredTime, setOccurredTime] = useState("");
  const [isOngoing,    setIsOngoing]    = useState(false);
  const [latitude,     setLatitude]     = useState<number | null>(null);
  const [longitude,    setLongitude]    = useState<number | null>(null);

  // HOW
  const [howDescription, setHowDescription] = useState("");
  const [evidenceTypes,  setEvidenceTypes]  = useState<string[]>([]);

  // Screenshots
  const [screenshotFiles,  setScreenshotFiles]  = useState<File[]>([]);
  const [screenshotUrls,   setScreenshotUrls]   = useState<string[]>([]);
  const [screenshotUploading, setScreenshotUploading] = useState(false);
  const screenshotInputRef = useRef<HTMLInputElement>(null);

  // WHY
  const [activismContext,  setActivismContext]  = useState<string[]>([]);
  const [whyDescription,   setWhyDescription]   = useState("");

  // SUPPORT
  const [supportNeeded,      setSupportNeeded]      = useState<string[]>([]);
  const [urgency,            setUrgency]            = useState<"immediate"|"within_week"|"no_rush">("within_week");
  const [consentToFollowup,  setConsentToFollowup]  = useState(false);
  const [contactMethod,      setContactMethod]      = useState("");
  const [contactValue,       setContactValue]       = useState("");

  // ACCOUNT
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setIsTfgbv(incidentTypes.some(t => DIGITAL_TYPES.has(t)));
  }, [incidentTypes]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => { setLatitude(pos.coords.latitude); setLongitude(pos.coords.longitude); },
      () => {}
    );
  }, []);

  const stepIndex = STEPS.indexOf(step);
  const progress  = ((stepIndex + 1) / STEPS.length) * 100;

  const canAdvance = () => {
    if (step === "what")       return incidentTypes.length > 0 && whatDescription.trim().length >= 10;
    if (step === "who")        return !!perpetratorType;
    if (step === "where_when") return !!county && !!occurredDate;
    if (step === "how")        return howDescription.trim().length >= 5;
    if (step === "why")        return true;
    if (step === "support")    return !!urgency;
    if (step === "account")    return isAuthenticated || password.length >= 8;
    return true;
  };

  const next = () => { const i = stepIndex + 1; if (i < STEPS.length) setStep(STEPS[i]); };
  const back = () => { const i = stepIndex - 1; if (i >= 0) setStep(STEPS[i]); };

  const handleSubmit = async () => {
    setLoading(true); setError(null);
    try {
      // Upload screenshots if any are queued
      let uploadedScreenshotUrls = [...screenshotUrls];
      if (screenshotFiles.length > 0 && screenshotUrls.length === 0) {
        setScreenshotUploading(true);
        // For anonymous users, screenshots will be uploaded after account creation
        // via the server action. For authenticated users, upload now.
        if (isAuthenticated) {
          const { urls, errors } = await uploadReportScreenshots(
            "", // userId will be derived from auth session in the storage helper
            screenshotFiles
          );
          if (errors.length > 0) {
            toast.error(`Some files failed to upload: ${errors[0]}`);
          }
          uploadedScreenshotUrls = urls;
          setScreenshotUrls(urls);
        }
        setScreenshotUploading(false);
      }

      const deroArray = deroWords
        .split(/[\n,]+/)
        .map(w => w.trim())
        .filter(Boolean);

      const payload: ReportData = {
        incident_types:   incidentTypes,
        description:      whatDescription,
        what_description: whatDescription,
        tfgbv_platform:   tfgbvPlatform   || undefined,
        tfgbv_link:       tfgbvLink       || undefined,
        tfgbv_content_text: tfgbvText     || undefined,
        tfgbv_screenshot_urls: uploadedScreenshotUrls.length ? uploadedScreenshotUrls : undefined,
        derogatory_words: deroArray.length ? deroArray : undefined,
        attack_nature:    (attackNature as ReportData["attack_nature"]) || undefined,
        perpetrator_type:   perpetratorType   || undefined,
        perpetrator_detail: perpetratorDetail || undefined,
        reporting_for:    reportingFor,
        county,
        location_description: locationDesc || undefined,
        latitude:  latitude  ?? undefined,
        longitude: longitude ?? undefined,
        occurred_at:   occurredDate || undefined,
        occurred_time: occurredTime || undefined,
        is_ongoing:    isOngoing,
        how_description: howDescription,
        evidence_types:  evidenceTypes,
        activism_context: activismContext.join(", ") || undefined,
        why_description:  whyDescription || undefined,
        support_needed:   supportNeeded,
        urgency,
        consent_to_followup: consentToFollowup,
        contact_method: contactMethod || undefined,
        contact_value:  contactValue  || undefined,
        password:        isAuthenticated ? undefined : password,
        is_authenticated: isAuthenticated,
        reporter_type:   isAuthenticated ? "authenticated" : "anonymous",
      };

      const result = await submitReport(payload);
      if (result.success) {
        if (isAuthenticated) {
          toast.success("Report submitted successfully.");
          router.push("/dashboard");
        } else {
          const params = new URLSearchParams({ u: result.username!, rid: result.reportId || "" });
          router.push(`/report/success?${params}`);
        }
      } else {
        setError(result.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="font-bold text-primary">{STEP_LABELS[stepIndex]} <span className="font-normal text-muted-foreground text-xs">({STEP_LABELS[stepIndex] === "What" ? "Nini" : STEP_LABELS[stepIndex] === "Who" ? "Nani" : STEP_LABELS[stepIndex] === "Where & When" ? "Wapi & Lini" : STEP_LABELS[stepIndex] === "How" ? "Jinsi gani" : STEP_LABELS[stepIndex] === "Why" ? "Kwa nini" : STEP_LABELS[stepIndex] === "Support" ? "Msaada" : "Akaunti"})</span></span>
          <span className="text-xs text-muted-foreground">{stepIndex + 1} / {STEPS.length}</span>
        </div>
        <div className="flex gap-1 mb-2">
          {STEPS.map((s, i) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${i < stepIndex ? "bg-primary" : i === stepIndex ? "bg-secondary" : "bg-border"}`} />
          ))}
        </div>
        <Progress value={progress} className="h-1" />
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* ── STEP 1: WHAT ─────────────────────────────────────────────────────── */}
      {step === "what" && (
        <div className="space-y-7">
          <div>
            <h2 className="text-xl font-black text-primary mb-1"><L en="What happened?" sw="Nini kilitokea?" /></h2>
            <p className="text-xs text-muted-foreground">Select all that apply — Chagua yote yanayohusika</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-2">
            {INCIDENT_OPTIONS.map(opt => (
              <Chip key={opt.value} en={opt.en} sw={opt.sw}
                selected={incidentTypes.includes(opt.value)}
                onClick={() => toggle(incidentTypes, opt.value, setIncidentTypes)} />
            ))}
          </div>

          <Field label={<L en="Describe what happened" sw="Elezea kilichotokea" />} required
            hint={`${whatDescription.length} chars — min. 10`}>
            <Textarea value={whatDescription} onChange={e => setWhatDescription(e.target.value)} rows={4}
              placeholder="In your own words… / Kwa maneno yako mwenyewe…" />
          </Field>

          {/* TFGBV section — only shown when digital incident types are selected */}
          {isTfgbv && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-5">
              <p className="text-sm font-bold text-amber-900">
                <L en="Online / digital violence details" sw="Maelezo ya unyanyasaji wa kidijitali" />
              </p>

              {/* Platform */}
              <Field label={<L en="Platform where it occurred" sw="Jukwaa lililotumika" />}>
                <select value={tfgbvPlatform} onChange={e => setTfgbvPlatform(e.target.value)}
                  className="w-full rounded-lg border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Select platform / Chagua jukwaa</option>
                  {TFGBV_PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>

              {/* Link */}
              <Field label={<span className="flex items-center gap-1"><LinkIcon className="w-3 h-3" /><L en="Link / URL to the content" sw="Kiungo cha maudhui" /></span>}>
                <input type="url" value={tfgbvLink} onChange={e => setTfgbvLink(e.target.value)}
                  placeholder="https://…"
                  className="w-full rounded-lg border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </Field>

              {/* Derogatory words */}
              <Field label={<L en="Specific derogatory words / slurs used" sw="Maneno ya kudhalilisha yaliyotumiwa" />}
                hint="Enter words separated by commas or new lines — Andika maneno yakitenganishwa na mkato">
                <Textarea value={deroWords} onChange={e => setDeroWords(e.target.value)} rows={2}
                  placeholder="e.g. word1, word2 — or one per line" />
              </Field>

              {/* Attack nature */}
              <Field label={<L en="Nature of the attack" sw="Asili ya shambulio" />}>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { value: "coordinated",  en: "Coordinated attack",  sw: "Shambulio lililopangwa" },
                    { value: "bot_assisted", en: "Bot-assisted / automated", sw: "Botis / moja kwa moja" },
                    { value: "organic",      en: "Organic / individual",  sw: "La kawaida / mtu mmoja" },
                    { value: "unknown",      en: "Unknown",              sw: "Haijulikani" },
                  ] as const).map(opt => (
                    <button key={opt.value} type="button"
                      onClick={() => setAttackNature(attackNature === opt.value ? "" : opt.value)}
                      className={`text-left px-3 py-2.5 rounded-lg border text-sm transition-all
                        ${attackNature === opt.value
                          ? "bg-amber-700 text-white border-amber-700"
                          : "bg-white border-border hover:border-amber-400"}`}>
                      <span className="font-medium">{opt.en}</span>
                      <span className="block text-[11px] mt-0.5 opacity-70">{opt.sw}</span>
                    </button>
                  ))}
                </div>
              </Field>

              {/* Paste content */}
              <Field label={<L en="Paste harmful content / text" sw="Bandika maudhui ya kudhuru" />}>
                <Textarea value={tfgbvText} onChange={e => setTfgbvText(e.target.value)} rows={3}
                  placeholder="Paste the message, comment, or post here…" />
              </Field>
            </div>
          )}

          <Field label={<L en="Reporting on behalf of" sw="Ninawasilisha kwa niaba ya" />}>
            <div className="flex flex-wrap gap-2">
              {(["self","someone_else","community_leader"] as const).map(opt => (
                <button key={opt} type="button" onClick={() => setReportingFor(opt)}
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors
                    ${reportingFor === opt ? "bg-secondary text-secondary-foreground border-secondary" : "border-border hover:border-secondary/50 bg-white"}`}>
                  {opt === "self" ? "Myself / Mimi" : opt === "someone_else" ? "Someone else / Mtu mwingine" : "My community / Jamii yangu"}
                </button>
              ))}
            </div>
          </Field>
        </div>
      )}

      {/* ── STEP 2: WHO ──────────────────────────────────────────────────────── */}
      {step === "who" && (
        <div className="space-y-7">
          <div>
            <h2 className="text-xl font-black text-primary mb-1"><L en="Who did this?" sw="Nani alifanya hivi?" /></h2>
            <p className="text-xs text-muted-foreground">Identifying the perpetrator helps us understand patterns — Kutambua mtendaji husaidia kuelewa mwenendo</p>
          </div>
          <Field label={<L en="Perpetrator type" sw="Aina ya mtendaji" />} required>
            <div className="grid sm:grid-cols-2 gap-2">
              {PERPETRATOR_TYPES.map(opt => (
                <Chip key={opt.value} en={opt.en} sw={opt.sw}
                  selected={perpetratorType === opt.value}
                  onClick={() => setPerpType(perpetratorType === opt.value ? "" : opt.value)} />
              ))}
            </div>
          </Field>
          <Field label={<L en="Perpetrator details (optional)" sw="Maelezo ya mtendaji (hiari)" />}
            hint="Only share what is safe — Shiriki tu kinachokuwa salama">
            <input type="text" value={perpetratorDetail} onChange={e => setPerpDetail(e.target.value)}
              placeholder="Name, title, organisation…"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </Field>
        </div>
      )}

      {/* ── STEP 3: WHERE & WHEN ─────────────────────────────────────────────── */}
      {step === "where_when" && (
        <div className="space-y-7">
          <div>
            <h2 className="text-xl font-black text-primary mb-1"><L en="Where and when?" sw="Wapi na lini?" /></h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label={<L en="County / Region" sw="Kaunti / Mkoa" />} required>
              <select value={county} onChange={e => setCounty(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">Select county / Chagua kaunti</option>
                {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label={<L en="Specific location" sw="Mahali mahususi" />}>
              <input type="text" value={locationDesc} onChange={e => setLocationDesc(e.target.value)}
                placeholder="e.g. School hostels, online, workplace…"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </Field>
            <Field label={<L en="Date" sw="Tarehe" />} required>
              <input type="date" value={occurredDate} onChange={e => setOccurredDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </Field>
            <Field label={<L en="Approximate time" sw="Wakati takriban" />}>
              <input type="time" value={occurredTime} onChange={e => setOccurredTime(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </Field>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={isOngoing} onChange={e => setIsOngoing(e.target.checked)}
              className="w-4 h-4 rounded accent-primary" />
            <span className="text-sm font-medium"><L en="This is still happening (ongoing)" sw="Hili bado linaendelea" /></span>
          </label>
          {latitude && (
            <p className="flex items-center gap-2 text-xs text-green-800 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              GPS captured: {latitude.toFixed(4)}, {longitude?.toFixed(4)} — will be used only for anonymised map visualisation
            </p>
          )}
        </div>
      )}

      {/* ── STEP 4: HOW ──────────────────────────────────────────────────────── */}
      {step === "how" && (
        <div className="space-y-7">
          <div>
            <h2 className="text-xl font-black text-primary mb-1"><L en="How did it happen?" sw="Ilitokea vipi?" /></h2>
          </div>
          <Field label={<L en="Describe how the incident occurred" sw="Elezea jinsi tukio lilivyotokea" />} required
            hint={`${howDescription.length} chars — min. 5`}>
            <Textarea value={howDescription} onChange={e => setHowDescription(e.target.value)} rows={5}
              placeholder="e.g. I was assaulted physically AND they recorded it / Nilipigiwa vibaya NA walinipiga picha…" />
          </Field>
          <Field label={<L en="What evidence exists? (optional)" sw="Ushahidi gani unapatikana? (hiari)" />}>
            <div className="grid sm:grid-cols-2 gap-2">
              {EVIDENCE_TYPES.map(opt => (
                <button key={opt.value} type="button"
                  onClick={() => toggle(evidenceTypes, opt.value, setEvidenceTypes)}
                  className={`flex items-center gap-2 text-left px-3 py-2.5 rounded-lg border text-sm transition-all
                    ${evidenceTypes.includes(opt.value)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-white border-border hover:border-primary/40"}`}>
                  {evidenceTypes.includes(opt.value)
                    ? <Check className="w-4 h-4 shrink-0" />
                    : <span className="w-4 h-4 rounded-sm border-2 border-current opacity-30 shrink-0" />}
                  <div>
                    <span className="font-medium">{opt.en}</span>
                    <span className="block text-[11px] mt-0.5 opacity-60">{opt.sw}</span>
                  </div>
                </button>
              ))}
            </div>
          </Field>

          {/* Screenshot upload — shown when 'screenshot' evidence type is selected */}
          {evidenceTypes.includes("screenshot") && (
            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
              <p className="text-sm font-semibold flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-primary" />
                <L en="Upload screenshots / evidence" sw="Pakia picha za skrini / ushahidi" />
              </p>
              <p className="text-xs text-muted-foreground">
                JPEG, PNG, WebP, or PDF · max 5 MB each · up to 10 files
              </p>

              {/* File picker */}
              <input
                ref={screenshotInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  const total = screenshotFiles.length + files.length;
                  if (total > 10) {
                    toast.error("Maximum 10 files allowed.");
                    return;
                  }
                  setScreenshotFiles(prev => [...prev, ...files]);
                  if (screenshotInputRef.current) screenshotInputRef.current.value = "";
                }}
              />

              <button
                type="button"
                onClick={() => screenshotInputRef.current?.click()}
                disabled={screenshotUploading || screenshotFiles.length >= 10}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-border hover:border-primary/40 bg-white text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Upload className="w-4 h-4" />
                Choose files
              </button>

              {/* File list */}
              {screenshotFiles.length > 0 && (
                <div className="space-y-1.5">
                  {screenshotFiles.map((file, i) => (
                    <div key={`${file.name}-${i}`} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-border text-sm">
                      <ImageIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="flex-1 truncate">{file.name}</span>
                      <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</span>
                      <button
                        type="button"
                        onClick={() => setScreenshotFiles(prev => prev.filter((_, j) => j !== i))}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload status */}
              {screenshotUrls.length > 0 && (
                <p className="text-xs text-green-700 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  {screenshotUrls.length} file(s) uploaded successfully
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── STEP 5: WHY ──────────────────────────────────────────────────────── */}
      {step === "why" && (
        <div className="space-y-7">
          <div>
            <h2 className="text-xl font-black text-primary mb-1"><L en="Why did this happen? (optional)" sw="Kwa nini ilitokea? (hiari)" /></h2>
            <p className="text-xs text-muted-foreground">Helps us understand attacks on HRDs — Husaidia kuelewa mwenendo wa mashambulizi dhidi ya walinzi wa haki</p>
          </div>
          <Field label={<L en="Related to your activism / HRD work?" sw="Inahusiana na uanaharakati wako?" />}>
            <div className="grid sm:grid-cols-2 gap-2">
              {ACTIVISM_CONTEXTS.map(opt => (
                <Chip key={opt.value} en={opt.en} sw={opt.sw}
                  selected={activismContext.includes(opt.value)}
                  onClick={() => toggle(activismContext, opt.value, setActivismContext)} />
              ))}
            </div>
          </Field>
          <Field label={<L en="Additional context" sw="Muktadha zaidi" />}>
            <Textarea value={whyDescription} onChange={e => setWhyDescription(e.target.value)} rows={3}
              placeholder="e.g. I was advocating for equal rights at a demonstration… / Nilikuwa nikitetea haki sawa…" />
          </Field>
        </div>
      )}

      {/* ── STEP 6: SUPPORT ──────────────────────────────────────────────────── */}
      {step === "support" && (
        <div className="space-y-7">
          <div>
            <h2 className="text-xl font-black text-primary mb-1"><L en="What support do you need?" sw="Unahitaji msaada gani?" /></h2>
          </div>
          <Field label={<L en="Types of support needed" sw="Aina ya msaada unaohitajika" />}>
            <div className="grid sm:grid-cols-2 gap-2">
              {SUPPORT_OPTIONS.map(opt => (
                <Chip key={opt.value} en={opt.en} sw={opt.sw}
                  selected={supportNeeded.includes(opt.value)}
                  onClick={() => toggle(supportNeeded, opt.value, setSupportNeeded)} />
              ))}
            </div>
          </Field>

          <Field label={<L en="How urgent is your situation?" sw="Hali yako ni ya haraka kiasi gani?" />} required>
            <div className="space-y-2">
              {[
                { value: "immediate",   en: "Immediate — I am in danger right now",       sw: "Dharura — niko hatarini sasa hivi",   cls: "border-destructive/40 bg-destructive/5" },
                { value: "within_week", en: "This week — serious but currently safe",      sw: "Wiki hii — kali lakini salama sasa",  cls: "" },
                { value: "no_rush",     en: "No rush — documenting for the record",        sw: "Hakuna haraka — ninaandika kwa rekodi", cls: "" },
              ].map(opt => (
                <button key={opt.value} type="button" onClick={() => setUrgency(opt.value as typeof urgency)}
                  className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all
                    ${urgency === opt.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : `bg-white border-border hover:border-primary/40 ${opt.cls}`}`}>
                  <span className="font-semibold">{opt.en}</span>
                  <span className="block text-xs mt-0.5 opacity-70">{opt.sw}</span>
                </button>
              ))}
            </div>
          </Field>

          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={consentToFollowup} onChange={e => setConsentToFollowup(e.target.checked)}
                className="w-4 h-4 mt-0.5 accent-primary" />
              <span className="text-sm"><L en="I consent to being contacted by a WHRD Hub defender" sw="Nakubali kuwasiliana na mlinzi wa WHRD Hub" /></span>
            </label>
            {consentToFollowup && (
              <div className="grid sm:grid-cols-2 gap-3 pl-7">
                <select value={contactMethod} onChange={e => setContactMethod(e.target.value)}
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Preferred method / Njia unayopendelea</option>
                  <option value="phone">Phone call / Simu</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                </select>
                <input type="text" value={contactValue} onChange={e => setContactValue(e.target.value)}
                  placeholder="Phone number or email"
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── STEP 7: ACCOUNT ──────────────────────────────────────────────────── */}
      {step === "account" && (
        <div className="space-y-6">
          <h2 className="text-xl font-black text-primary"><L en="Your private access" sw="Ufikiaji wako wa kibinafsi" /></h2>

          {isAuthenticated ? (
            <div className="p-4 rounded-xl bg-green-50 border border-green-200 space-y-2">
              <div className="flex items-center gap-2 text-green-800 font-semibold text-sm">
                <Shield className="w-4 h-4" />
                <L en="Logged in — report will link to your account" sw="Umeingia — ripoti itaunganishwa na akaunti yako" />
              </div>
              {userEmail && (
                <div className="flex items-center gap-2 pl-6">
                  <span className="text-sm font-mono text-green-900 bg-green-100 px-2 py-1 rounded">{userEmail}</span>
                  <CopyButton text={userEmail} label="Copy" />
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-primary"><L en="Your username is auto-generated" sw="Jina lako la mtumiaji linazalishwa kiotomatiki" /></p>
                    <p className="text-xs text-muted-foreground">
                      e.g. <span className="font-mono bg-white px-1 rounded">brave-shield-k4x2</span>{" "}
                      No real name or email needed. Your login email will be shown on the next screen to copy.
                    </p>
                  </div>
                </div>
              </div>
              <Field label={<L en="Choose a password (min. 8 characters)" sw="Chagua nenosiri (angalau herufi 8)" />} required>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Create a memorable password / Unda nenosiri unalokumbuka"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password.length > 0 && password.length < 8 && (
                  <p className="text-xs text-destructive">Minimum 8 characters / Angalau herufi 8</p>
                )}
              </Field>
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-900">
                <p className="font-semibold mb-0.5"><L en="Save your password" sw="Hifadhi nenosiri lako" /></p>
                <p className="text-xs">Write it down somewhere safe — no email is linked so we cannot send a reset. / Andika mahali salama — hakuna barua pepe iliyounganishwa.</p>
              </div>
            </>
          )}

          <div className="p-4 rounded-xl bg-muted/30 border border-border text-xs text-muted-foreground space-y-2">
            <p className="font-semibold text-foreground text-sm"><L en="Consent declaration" sw="Tamko la idhini" /></p>
            <ul className="list-disc list-inside space-y-1">
              <li>The information I have provided is true to the best of my knowledge.</li>
              <li>I consent to WHRD Hub storing this report for case management purposes.</li>
              <li>I understand I can request deletion of my data at any time.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center mt-10 pt-6 border-t border-border">
        <Button variant="ghost" onClick={back} disabled={stepIndex === 0}>
          <ChevronLeft className="w-4 h-4 mr-1" />Back
        </Button>

        {step !== "account" ? (
          <Button onClick={next} disabled={!canAdvance()}>
            Continue <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={!canAdvance() || loading}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 min-w-[160px]">
            {loading
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />Submitting…</>
              : <><Shield className="w-4 h-4 mr-2" />Submit Report</>}
          </Button>
        )}
      </div>
    </div>
  );
}

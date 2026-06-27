"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Eye, EyeOff, Shield, AlertCircle, Link as LinkIcon,
  Check, MapPin, Upload, X, Loader2, Image as ImageIcon, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { submitReport, type ReportData } from "@/app/actions/submit-report";
import { uploadReportScreenshots } from "@/lib/supabase/storage";
import { CopyButton } from "@/components/copy-button";
import { toast } from "sonner";

// ─── i18n helper ─────────────────────────────────────────────────────────────
const L = ({ en, sw }: { en: string; sw: string }) => (
  <span>{en} <span className="text-muted-foreground font-normal text-xs">({sw})</span></span>
);

// ─── pill toggle ─────────────────────────────────────────────────────────────
function Pill({
  selected, onClick, children, danger,
}: {
  selected: boolean; onClick: () => void; children: React.ReactNode; danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium select-none
        transition-[transform,background-color,border-color,color,box-shadow] duration-150 ease-out
        active:scale-[0.97]
        ${selected
          ? danger
            ? "bg-destructive text-white border-destructive shadow-sm"
            : "bg-primary text-primary-foreground border-primary shadow-sm"
          : "bg-white border-border text-foreground"
        }`}
      style={{ willChange: "transform" }}
    >
      {selected && <Check className="w-3.5 h-3.5 shrink-0" />}
      {children}
    </button>
  );
}

// ─── card ────────────────────────────────────────────────────────────────────
function Card({ title, subtitle, children }: {
  title?: string; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm p-6 md:p-8 space-y-5">
      {title && (
        <div className="space-y-0.5">
          <h2 className="font-bold text-base text-foreground">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

// ─── field wrapper ────────────────────────────────────────────────────────────
function Field({ label, hint, required, children }: {
  label?: React.ReactNode; hint?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-semibold text-foreground">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </label>
      )}
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

// ─── select ──────────────────────────────────────────────────────────────────
function Select({ value, onChange, children, placeholder }: {
  value: string; onChange: (v: string) => void;
  children: React.ReactNode; placeholder?: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full appearance-none rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring pr-9"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
    </div>
  );
}

function toggle(arr: string[], val: string, set: (v: string[]) => void) {
  set(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
}

// ─── data ─────────────────────────────────────────────────────────────────────
const PLATFORMS = [
  "Facebook", "Twitter / X", "Instagram", "WhatsApp", "TikTok",
  "YouTube", "Telegram", "LinkedIn", "Snapchat", "Email", "SMS", "Other",
];

const PERPETRATOR_TYPES = [
  { value: "government",       label: "Government / Police",     sw: "Serikali / Polisi" },
  { value: "intimate_partner", label: "Partner / Spouse",        sw: "Mpenzi / Mwenza" },
  { value: "family_member",    label: "Family member",           sw: "Mwanafamilia" },
  { value: "employer",         label: "Employer / Colleague",    sw: "Mwajiri" },
  { value: "online_troll",     label: "Stranger / Online group", sw: "Mtesi / Kikundi" },
  { value: "unknown",          label: "Unknown",                 sw: "Haijulikani" },
];

const SUPPORT_OPTIONS = [
  { value: "legal",            label: "Legal support",        sw: "Kisheria" },
  { value: "medical",          label: "Medical care",         sw: "Afya" },
  { value: "psychosocial",     label: "Counselling",          sw: "Ushauri" },
  { value: "digital_security", label: "Digital security",     sw: "Usalama wa mtandao" },
  { value: "shelter",          label: "Safe shelter",         sw: "Makazi salama" },
  { value: "referral",         label: "Referral",             sw: "Uhamisho" },
  { value: "other",            label: "Other",                sw: "Nyingine" },
];

const COUNTIES = [
  "Nairobi","Mombasa","Kisumu","Nakuru","Uasin Gishu","Kilifi","Kwale","Kakamega",
  "Bungoma","Machakos","Kajiado","Nyeri","Meru","Embu","Kisii","Migori","Homa Bay",
  "Siaya","Trans Nzoia","Turkana","Garissa","Wajir","Mandera","Marsabit","Isiolo",
  "Laikipia","Nyandarua","Kirinyaga","Murang'a","Kiambu","Narok","Bomet","Kericho",
  "Baringo","Nandi","Samburu","Kitui","Makueni","Taita Taveta","Tana River","Lamu",
  "Other / Outside Kenya",
];

// ─── props ────────────────────────────────────────────────────────────────────
interface ReportFormProps {
  isAuthenticated?: boolean;
  userEmail?: string;
}

// ─── component ────────────────────────────────────────────────────────────────
export default function ReportForm({ isAuthenticated = false, userEmail }: ReportFormProps) {
  const router = useRouter();
  const screenshotRef = useRef<HTMLInputElement>(null);

  // Context
  const [reportingFor, setReportingFor] = useState<"self"|"someone_else"|"child"|"community">("self");
  const [violenceType, setViolenceType] = useState<"online"|"physical"|"both"|"">("");

  // What happened
  const [description, setDescription]   = useState("");
  const [county, setCounty]             = useState("");
  const [locationDesc, setLocationDesc] = useState("");
  const [occurredDate, setOccurredDate] = useState("");
  const [isOngoing, setIsOngoing]       = useState(false);
  const [latitude, setLatitude]         = useState<number|null>(null);
  const [longitude, setLongitude]       = useState<number|null>(null);

  // Who
  const [perpetratorType, setPerpType]     = useState("");
  const [perpetratorDetail, setPerpDetail] = useState("");

  // Online evidence
  const [platform, setPlatform]           = useState("");
  const [link, setLink]                   = useState("");
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);
  const [screenshotUrls, setScreenshotUrls]   = useState<string[]>([]);
  const [uploading, setUploading]             = useState(false);

  // Support
  const [supportNeeded, setSupportNeeded] = useState<string[]>([]);
  const [supportOther, setSupportOther]   = useState("");
  const [urgency, setUrgency]             = useState<"immediate"|"within_week"|"no_rush">("within_week");
  const [consent, setConsent]             = useState(false);
  const [contactMethod, setContactMethod] = useState("");
  const [contactValue, setContactValue]   = useState("");

  // Account
  const [password, setPassword]       = useState("");
  const [showPass, setShowPass]       = useState(false);

  // State
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string|null>(null);

  const isOnline = violenceType === "online" || violenceType === "both";

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      p => { setLatitude(p.coords.latitude); setLongitude(p.coords.longitude); },
      () => {}
    );
  }, []);

  const canSubmit = () => {
    if (!violenceType) return false;
    if (description.trim().length < 20) return false;
    if (!county) return false;
    if (!isAuthenticated && password.length < 8) return false;
    return true;
  };

  const handleSubmit = async () => {
    if (!canSubmit()) return;
    setLoading(true);
    setError(null);

    try {
      let uploadedUrls = [...screenshotUrls];
      if (screenshotFiles.length > 0 && isAuthenticated) {
        setUploading(true);
        const { urls, errors } = await uploadReportScreenshots("", screenshotFiles);
        if (errors.length) toast.error(`Some files failed to upload: ${errors[0]}`);
        uploadedUrls = urls;
        setUploading(false);
      }

      // Map context pills to incident_types the DB expects
      const incidentTypes: string[] = [];
      if (violenceType === "online" || violenceType === "both") incidentTypes.push("online_harassment");
      if (violenceType === "physical" || violenceType === "both") incidentTypes.push("physical_violence");

      const allSupport = [...supportNeeded.filter(s => s !== "other")];
      if (supportNeeded.includes("other") && supportOther.trim()) allSupport.push("other");

      const payload: ReportData = {
        incident_types: incidentTypes,
        description,
        reporting_for: reportingFor === "child" || reportingFor === "community"
          ? "someone_else"
          : (reportingFor as "self"|"someone_else"),
        county,
        location_description: locationDesc || undefined,
        latitude:  latitude  ?? undefined,
        longitude: longitude ?? undefined,
        occurred_at: occurredDate || undefined,
        is_ongoing: isOngoing,
        perpetrator_type: perpetratorType || undefined,
        perpetrator_detail: perpetratorDetail || undefined,
        tfgbv_platform: isOnline && platform ? platform : undefined,
        tfgbv_link: isOnline && link ? link : undefined,
        tfgbv_screenshot_urls: uploadedUrls.length ? uploadedUrls : undefined,
        support_needed: allSupport,
        urgency,
        consent_to_followup: consent,
        contact_method: consent && contactMethod ? contactMethod : undefined,
        contact_value: consent && contactValue ? contactValue : undefined,
        password: isAuthenticated ? undefined : password,
        is_authenticated: isAuthenticated,
        reporter_type: isAuthenticated ? "authenticated" : "anonymous",
      };

      const result = await submitReport(payload);
      if (result.success) {
        if (isAuthenticated) {
          toast.success("Report submitted. Thank you for your courage.");
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
    <div className="space-y-5 max-w-2xl mx-auto">

      {/* ── Context ─────────────────────────────────────────────── */}
      <Card
        title="About this report"
        subtitle="Help us understand the situation so we can connect you with the right support."
      >
        <Field label={<L en="Who are you reporting for?" sw="Unawasilisha kwa niaba ya nani?" />}>
          <div className="flex flex-wrap gap-2">
            {([
              { value: "self",      label: "Myself",       sw: "Mimi" },
              { value: "child",     label: "A child",      sw: "Mtoto" },
              { value: "someone_else", label: "Someone else", sw: "Mtu mwingine" },
              { value: "community", label: "My community", sw: "Jamii yangu" },
            ] as const).map(opt => (
              <Pill
                key={opt.value}
                selected={reportingFor === opt.value}
                onClick={() => setReportingFor(opt.value)}
              >
                {opt.label}
                <span className="text-[11px] opacity-60 font-normal">/ {opt.sw}</span>
              </Pill>
            ))}
          </div>
        </Field>

        <Field
          label={<L en="Where did the violence happen?" sw="Unyanyasaji ulitokea wapi?" />}
          required
        >
          <div className="flex flex-wrap gap-2">
            {([
              { value: "online",   label: "Online",          sw: "Mtandaoni" },
              { value: "physical", label: "Physical / In person", sw: "Kimwili" },
              { value: "both",     label: "Both",            sw: "Vyote viwili" },
            ] as const).map(opt => (
              <Pill
                key={opt.value}
                selected={violenceType === opt.value}
                onClick={() => setViolenceType(opt.value)}
              >
                {opt.label}
                <span className="text-[11px] opacity-60 font-normal">/ {opt.sw}</span>
              </Pill>
            ))}
          </div>
          {!violenceType && (
            <p className="text-xs text-muted-foreground mt-1">Please select one to continue</p>
          )}
        </Field>
      </Card>

      {/* ── What happened ────────────────────────────────────────── */}
      <Card title="What happened" subtitle="Share as much or as little as you feel comfortable with.">
        <Field
          label={<L en="Tell us what happened" sw="Tuambie kilichotokea" />}
          required
          hint={description.length >= 20 ? undefined : `${description.length}/20 minimum characters`}
        >
          <Textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={5}
            placeholder="In your own words, describe what happened. You don't need to use legal or medical terms."
            className="rounded-xl resize-none"
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label={<L en="Approximately when?" sw="Takriban lini?" />}>
            <input
              type="date"
              value={occurredDate}
              onChange={e => setOccurredDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </Field>

          <Field label={<L en="County / Region" sw="Kaunti" />} required>
            <Select value={county} onChange={setCounty} placeholder="Select county">
              {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
          </Field>
        </div>

        <Field label={<L en="Location (optional)" sw="Mahali (hiari)" />}>
          <input
            type="text"
            value={locationDesc}
            onChange={e => setLocationDesc(e.target.value)}
            placeholder="e.g. home, workplace, school, a specific street"
            className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </Field>

        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={isOngoing}
            onChange={e => setIsOngoing(e.target.checked)}
            className="w-4 h-4 rounded accent-primary"
          />
          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
            <L en="This is still happening" sw="Hili bado linaendelea" />
          </span>
        </label>

        {latitude && (
          <p className="flex items-center gap-2 text-xs text-green-800 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            GPS noted for anonymised map visualisation only.
          </p>
        )}
      </Card>

      {/* ── Who did this ─────────────────────────────────────────── */}
      <Card title="Who did this?" subtitle="This is optional. Only share what feels safe.">
        <div className="flex flex-wrap gap-2">
          {PERPETRATOR_TYPES.map(opt => (
            <Pill
              key={opt.value}
              selected={perpetratorType === opt.value}
              onClick={() => setPerpType(perpetratorType === opt.value ? "" : opt.value)}
            >
              {opt.label}
              <span className="text-[11px] opacity-60 font-normal">/ {opt.sw}</span>
            </Pill>
          ))}
        </div>
        {perpetratorType && (
          <Field label="Any details? (optional)" hint="Leave blank if you prefer">
            <input
              type="text"
              value={perpetratorDetail}
              onChange={e => setPerpDetail(e.target.value)}
              placeholder="Name, title, organisation, or any identifying detail"
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </Field>
        )}
      </Card>

      {/* ── Online evidence ───────────────────────────────────────── */}
      {isOnline && (
        <Card
          title="Online evidence"
          subtitle="These details help defenders understand what happened online."
        >
          <Field label={<L en="Platform" sw="Jukwaa" />}>
            <Select value={platform} onChange={setPlatform} placeholder="Select platform">
              {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
            </Select>
          </Field>

          <Field label={<L en="Link to the content (optional)" sw="Kiungo cha maudhui (hiari)" />}>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="url"
                value={link}
                onChange={e => setLink(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border border-input bg-background pl-9 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </Field>

          <Field label={<L en="Upload screenshots (optional)" sw="Pakia picha za skrini (hiari)" />}>
            <input
              ref={screenshotRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              multiple
              className="hidden"
              onChange={e => {
                const files = Array.from(e.target.files || []);
                if (screenshotFiles.length + files.length > 10) {
                  toast.error("Maximum 10 files"); return;
                }
                setScreenshotFiles(prev => [...prev, ...files]);
                if (screenshotRef.current) screenshotRef.current.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => screenshotRef.current?.click()}
              disabled={uploading || screenshotFiles.length >= 10}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border-2 border-dashed border-border hover:border-primary/40 bg-muted/20 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Upload className="w-4 h-4" />
              Choose files (JPEG, PNG, PDF — max 5 MB each)
            </button>
            {screenshotFiles.length > 0 && (
              <div className="space-y-1.5 mt-2">
                {screenshotFiles.map((f, i) => (
                  <div key={`${f.name}-${i}`} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-border text-sm">
                    <ImageIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="flex-1 truncate">{f.name}</span>
                    <span className="text-xs text-muted-foreground">{(f.size / 1024).toFixed(0)} KB</span>
                    <button
                      type="button"
                      onClick={() => setScreenshotFiles(prev => prev.filter((_, j) => j !== i))}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {screenshotUrls.length > 0 && (
              <p className="text-xs text-green-700 flex items-center gap-1.5 mt-1">
                <Check className="w-3.5 h-3.5" />
                {screenshotUrls.length} file(s) uploaded
              </p>
            )}
          </Field>
        </Card>
      )}

      {/* ── Support ───────────────────────────────────────────────── */}
      <Card title="How can we help?" subtitle="Select everything that applies. We will try to connect you with the right services.">
        <Field label={<L en="Type of support needed" sw="Aina ya msaada" />}>
          <div className="flex flex-wrap gap-2">
            {SUPPORT_OPTIONS.map(opt => (
              <Pill
                key={opt.value}
                selected={supportNeeded.includes(opt.value)}
                onClick={() => toggle(supportNeeded, opt.value, setSupportNeeded)}
              >
                {opt.label}
                <span className="text-[11px] opacity-60 font-normal">/ {opt.sw}</span>
              </Pill>
            ))}
          </div>
          {supportNeeded.includes("other") && (
            <Textarea
              value={supportOther}
              onChange={e => setSupportOther(e.target.value)}
              rows={2}
              placeholder="Describe the support you need..."
              className="rounded-xl mt-2"
            />
          )}
        </Field>

        <Field label={<L en="How urgent is your situation?" sw="Hali yako ni ya haraka?" />} required>
          <div className="space-y-2">
            {([
              { value: "immediate",   label: "I am in danger right now", sw: "Niko hatarini sasa hivi", danger: true  as boolean },
              { value: "within_week", label: "This week, help soon",     sw: "Wiki hii, msaada haraka", danger: false as boolean },
              { value: "no_rush",     label: "No rush, documenting",     sw: "Hakuna haraka, ninaandika", danger: false as boolean },
            ]).map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setUrgency(opt.value as "immediate"|"within_week"|"no_rush")}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all
                  ${urgency === opt.value
                    ? opt.danger
                      ? "bg-destructive text-white border-destructive"
                      : "bg-primary text-primary-foreground border-primary"
                    : `bg-white border-border hover:border-primary/30 ${opt.danger ? "hover:border-destructive/30" : ""}`
                  }`}
              >
                <span className="font-semibold">{opt.label}</span>
                <span className="block text-[11px] mt-0.5 opacity-70">{opt.sw}</span>
              </button>
            ))}
          </div>
        </Field>

        <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consent}
              onChange={e => setConsent(e.target.checked)}
              className="w-4 h-4 mt-0.5 accent-primary"
            />
            <span className="text-sm"><L en="I am okay with being contacted by a WHRD Hub defender" sw="Nakubali kuwasiliana na mlinzi wa WHRD Hub" /></span>
          </label>
          {consent && (
            <div className="grid sm:grid-cols-2 gap-3 pl-7">
              <Select value={contactMethod} onChange={setContactMethod} placeholder="Preferred method">
                <option value="phone">Phone call</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
              </Select>
              <input
                type="text"
                value={contactValue}
                onChange={e => setContactValue(e.target.value)}
                placeholder="Phone number or email"
                className="rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}
        </div>
      </Card>

      {/* ── Account ───────────────────────────────────────────────── */}
      <Card title="Your private access">
        {isAuthenticated ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
            <Shield className="w-5 h-5 text-green-700 shrink-0" />
            <div>
              <p className="font-semibold text-sm text-green-800">
                <L en="Signed in" sw="Umeingia" />
              </p>
              {userEmail && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono text-green-700">{userEmail}</span>
                  <CopyButton text={userEmail} label="Copy" />
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/15">
              <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-sm">
                  <L en="Your username is automatically generated" sw="Jina lako linazalishwa kiotomatiki" />
                </p>
                <p className="text-xs text-muted-foreground">
                  No real name or email is needed. You will see your login details on the next screen.
                </p>
              </div>
            </div>

            <Field
              label={<L en="Create a password (minimum 8 characters)" sw="Weka nenosiri (angalau herufi 8)" />}
              required
            >
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Something memorable and unique"
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password.length > 0 && password.length < 8 && (
                <p className="text-xs text-destructive">At least 8 characters required</p>
              )}
            </Field>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900 space-y-0.5">
              <p className="font-semibold">Write this password down somewhere safe</p>
              <p className="text-xs">No email is linked to your account, so there is no way to reset it.</p>
            </div>
          </>
        )}

        <div className="p-4 rounded-xl bg-muted/30 border border-border text-xs text-muted-foreground space-y-1.5">
          <p className="font-semibold text-foreground text-sm">Consent declaration</p>
          <ul className="list-disc list-inside space-y-1">
            <li>The information I have provided is truthful to the best of my knowledge.</li>
            <li>I consent to WHRD Hub storing this report for case management purposes.</li>
            <li>I understand I can request deletion of my data at any time.</li>
          </ul>
        </div>
      </Card>

      {/* ── Error ─────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Submit ────────────────────────────────────────────────── */}
      <Button
        onClick={handleSubmit}
        disabled={!canSubmit() || loading}
        className="w-full h-12 text-sm font-bold rounded-xl"
      >
        {loading || uploading ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{uploading ? "Uploading files..." : "Submitting..."}</>
        ) : (
          <><Shield className="w-4 h-4 mr-2" />Submit report securely</>
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground pb-4">
        Protected under the Kenya Data Protection Act (2019). All data is encrypted at rest and in transit.
      </p>
    </div>
  );
}

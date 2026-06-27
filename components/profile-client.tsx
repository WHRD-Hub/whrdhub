"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { uploadAvatar, deleteAvatar } from "@/lib/supabase/storage";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/copy-button";
import { toast } from "sonner";
import {
  Shield, User, Settings, LogOut, ArrowLeft,
  Eye, EyeOff, Bell, Type, Contrast, Camera, Trash2, Loader2,
} from "lucide-react";

interface Props {
  userId: string;
  username: string;
  displayName: string;
  email: string;
  virtualEmail: string;
  isAnon: boolean;
  userType: string;
  avatarUrl: string | null;
}

type Tab = "profile" | "credentials" | "accessibility";

export function ProfileClient({
  userId, username: initUsername, displayName: initDisplay,
  email, virtualEmail, isAnon, userType, avatarUrl: initAvatarUrl,
}: Props) {
  const [tab, setTab] = useState<Tab>("profile");
  const [username,    setUsername]    = useState(initUsername);
  const [displayName, setDisplayName] = useState(initDisplay);
  const [saving, setSaving] = useState(false);

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initAvatarUrl);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Accessibility prefs stored locally
  const [fontSize,      setFontSize]      = useState<"normal" | "large" | "xl">("normal");
  const [highContrast,  setHighContrast]  = useState(false);
  const [reduceMotion,  setReduceMotion]  = useState(false);

  // Load prefs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("whrd_prefs");
    if (saved) {
      const p = JSON.parse(saved);
      setFontSize(p.fontSize ?? "normal");
      setHighContrast(p.highContrast ?? false);
      setReduceMotion(p.reduceMotion ?? false);
    }
  }, []);

  // Apply accessibility classes to <html>
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("text-lg", fontSize === "large");
    root.classList.toggle("text-xl", fontSize === "xl");
    root.classList.toggle("high-contrast", highContrast);
    root.style.setProperty("--motion", reduceMotion ? "0" : "1");
    localStorage.setItem("whrd_prefs", JSON.stringify({ fontSize, highContrast, reduceMotion }));
  }, [fontSize, highContrast, reduceMotion]);

  const saveProfile = async () => {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName, ...(isAnon ? {} : { username }) })
      .eq("id", userId);
    setSaving(false);
    if (error) toast.error("Could not save changes.");
    else toast.success("Profile updated.");
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate client-side
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Please select a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2 MB.");
      return;
    }

    setAvatarUploading(true);
    const { url, error } = await uploadAvatar(userId, file);

    if (error || !url) {
      toast.error(error || "Upload failed. Please try again.");
      setAvatarUploading(false);
      return;
    }

    // Save avatar_url to profile
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: url })
      .eq("id", userId);

    setAvatarUploading(false);

    if (updateError) {
      toast.error("Image uploaded but profile could not be updated.");
    } else {
      setAvatarUrl(url);
      toast.success("Avatar updated.");
    }

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAvatarRemove = async () => {
    setAvatarUploading(true);
    const { error } = await deleteAvatar(userId);

    if (error) {
      toast.error("Could not remove avatar.");
      setAvatarUploading(false);
      return;
    }

    const supabase = createClient();
    await supabase.from("profiles").update({ avatar_url: null }).eq("id", userId);

    setAvatarUrl(null);
    setAvatarUploading(false);
    toast.success("Avatar removed.");
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "profile",       label: "Profile",       icon: <User className="w-4 h-4" /> },
    { key: "credentials",   label: "Credentials",   icon: <Shield className="w-4 h-4" /> },
    { key: "accessibility", label: "Accessibility", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard"
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <img src="/icon.png" alt="WHRD Hub" className="w-7 h-7" />
              <span className="font-bold text-sm text-primary">WHRD<span className="text-accent">HUB</span></span>
            </div>
          </div>
          <form action="/auth/signout" method="post">
            <button type="submit"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted">
              <LogOut className="w-3.5 h-3.5" />Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-5 py-10">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-foreground">Your Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your account, credentials, and preferences.</p>
        </div>

        <div className="grid md:grid-cols-[220px_1fr] gap-6">
          {/* Sidebar tabs */}
          <aside className="space-y-1">
            {tabs.map(t => (
              <button key={t.key} type="button" onClick={() => setTab(t.key)}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors text-left
                  ${tab === t.key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-white"}`}>
                {t.icon}
                {t.label}
              </button>
            ))}
            <div className="pt-2 border-t border-border mt-2">
              <Link href="/dashboard"
                className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white transition-colors">
                <ArrowLeft className="w-4 h-4" />Back to dashboard
              </Link>
            </div>
          </aside>

          {/* Content */}
          <div className="space-y-5">

            {/* Profile tab */}
            {tab === "profile" && (
              <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
                <h2 className="font-bold text-base">Personal details</h2>

                {/* Avatar section */}
                <div className="flex items-center gap-5 pb-5 border-b border-border">
                  <div className="relative group">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="w-16 h-16 rounded-full object-cover border-2 border-border"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-black border-2 border-border">
                        {(displayName || username || "?")[0].toUpperCase()}
                      </div>
                    )}

                    {/* Camera overlay */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={avatarUploading}
                      className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      {avatarUploading ? (
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      ) : (
                        <Camera className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{displayName || username || "Anonymous reporter"}</p>
                    <p className="text-xs text-muted-foreground capitalize">{userType} {isAnon && "· Anonymous account"}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={avatarUploading}
                        className="text-xs text-primary font-medium hover:underline"
                      >
                        {avatarUrl ? "Change photo" : "Upload photo"}
                      </button>
                      {avatarUrl && (
                        <button
                          type="button"
                          onClick={handleAvatarRemove}
                          disabled={avatarUploading}
                          className="text-xs text-destructive font-medium hover:underline flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold">Display name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      placeholder="How would you like to be addressed?"
                      className="w-full rounded-xl border border-input bg-muted/30 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  {!isAnon && (
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold">Username</label>
                      <input
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className="w-full rounded-xl border border-input bg-muted/30 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold">Email address</label>
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-muted/20 text-sm text-muted-foreground">
                      <span className="flex-1 font-mono truncate">{email}</span>
                      {isAnon && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Virtual</span>}
                    </div>
                    {isAnon && (
                      <p className="text-xs text-muted-foreground">This is your anonymous login email. See Credentials tab for details.</p>
                    )}
                  </div>
                </div>

                <Button onClick={saveProfile} disabled={saving} className="w-full sm:w-auto">
                  {saving ? "Saving..." : "Save changes"}
                </Button>
              </div>
            )}

            {/* Credentials tab */}
            {tab === "credentials" && (
              <div className="space-y-4">
                {isAnon ? (
                  <>
                    <div className="bg-white rounded-2xl border border-primary/20 p-6 space-y-5">
                      <div className="flex items-center gap-2 text-primary font-bold">
                        <Shield className="w-5 h-5" />
                        Your anonymous account credentials
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Your account was created without a real email address. Save these credentials somewhere safe.
                        There is no recovery option if you lose them.
                      </p>

                      <div className="space-y-3">
                        <CredRow label="Username" value={initUsername} />
                        <CredRow label="Login email" value={virtualEmail} mono />
                      </div>

                      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
                        <p className="font-semibold mb-1">How to log back in</p>
                        <ol className="list-decimal list-inside space-y-1 text-xs">
                          <li>Go to the login page</li>
                          <li>Enter your login email above (or just your username)</li>
                          <li>Enter the password you chose when you made your report</li>
                        </ol>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-border p-6">
                      <h3 className="font-bold text-sm mb-3">Want to upgrade your account?</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        You can add a real email address to your account to enable password recovery.
                        Your reports and case history will stay intact.
                      </p>
                      <Button variant="outline" size="sm" disabled>Coming soon</Button>
                    </div>
                  </>
                ) : (
                  <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
                    <div className="flex items-center gap-2 text-primary font-bold">
                      <Shield className="w-5 h-5" />
                      Account credentials
                    </div>
                    <CredRow label="Email address" value={email} />
                    <p className="text-sm text-muted-foreground">
                      Use the forgot password link on the login page to reset your password at any time.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Accessibility tab */}
            {tab === "accessibility" && (
              <div className="bg-white rounded-2xl border border-border p-6 space-y-6">
                <h2 className="font-bold text-base">Accessibility preferences</h2>
                <p className="text-sm text-muted-foreground">These settings are saved to your browser and apply across the platform.</p>

                {/* Font size */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Type className="w-4 h-4 text-primary" />
                    Text size
                  </div>
                  <div className="flex gap-2">
                    {(["normal", "large", "xl"] as const).map(size => (
                      <button key={size} type="button" onClick={() => setFontSize(size)}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all
                          ${fontSize === size
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border hover:border-primary/40"}`}>
                        {size === "normal" ? "Normal" : size === "large" ? "Large" : "Extra large"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* High contrast */}
                <div className="flex items-center justify-between py-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Contrast className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-sm font-semibold">High contrast mode</p>
                      <p className="text-xs text-muted-foreground">Increases text and border contrast</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setHighContrast(!highContrast)}
                    className={`relative inline-flex h-6 w-11 rounded-full transition-colors
                      ${highContrast ? "bg-primary" : "bg-border"}`}>
                    <span className={`inline-block w-4 h-4 bg-white rounded-full shadow-sm transition-transform mt-1
                      ${highContrast ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>

                {/* Reduce motion */}
                <div className="flex items-center justify-between py-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-sm font-semibold">Reduce motion</p>
                      <p className="text-xs text-muted-foreground">Minimises animations and transitions</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setReduceMotion(!reduceMotion)}
                    className={`relative inline-flex h-6 w-11 rounded-full transition-colors
                      ${reduceMotion ? "bg-primary" : "bg-border"}`}>
                    <span className={`inline-block w-4 h-4 bg-white rounded-full shadow-sm transition-transform mt-1
                      ${reduceMotion ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>

                <p className="text-xs text-muted-foreground">
                  These preferences are stored locally in your browser and are not shared with anyone.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CredRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
      <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/40 border border-border">
        <span className={`flex-1 text-sm break-all ${mono ? "font-mono" : "font-semibold"}`}>{value}</span>
        <CopyButton text={value} label="Copy" />
      </div>
    </div>
  );
}

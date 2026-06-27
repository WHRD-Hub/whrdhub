"use client";

import { useState, useEffect } from "react";
import { Shield, X } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import Link from "next/link";

export function CredentialsBanner({ username, loginEmail }: { username: string; loginEmail: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("whrd_creds_dismissed");
    if (!dismissed) setVisible(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem("whrd_creds_dismissed", "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="bg-white rounded-2xl border border-primary/20 shadow-sm overflow-hidden">
      <div className="bg-primary px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary-foreground font-semibold text-sm">
          <Shield className="w-4 h-4" />
          Save your login credentials
        </div>
        <button onClick={dismiss}
          className="p-1 rounded-lg hover:bg-white/10 transition-colors text-primary-foreground/70 hover:text-primary-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-5 space-y-4">
        <p className="text-sm text-muted-foreground">
          Your account was created anonymously. Keep these safe - there is no way to recover them if lost.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Username</p>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/40 border border-border">
              <span className="font-mono text-sm font-bold flex-1">{username}</span>
              <CopyButton text={username} label="Copy" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Login email</p>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/40 border border-border">
              <span className="font-mono text-xs flex-1 truncate">{loginEmail}</span>
              <CopyButton text={loginEmail} label="Copy" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs">
          <p className="text-muted-foreground">
            View anytime under{" "}
            <Link href="/profile?tab=credentials" className="text-primary hover:underline font-medium">
              Profile / Credentials
            </Link>
          </p>
          <button onClick={dismiss} className="text-muted-foreground hover:text-foreground underline">
            Got it, dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

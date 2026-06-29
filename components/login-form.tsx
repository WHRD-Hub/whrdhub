"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Shield } from "lucide-react";
import { useT } from "@/lib/i18n/context";
import { LangSwitcher } from "@/components/lang-switcher";

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();
  const t = useT();
  const l = t.auth.login;

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const isUsername = !identifier.includes("@");
      const email = isUsername
        ? `${identifier.trim()}@whrdhub.local`
        : identifier.trim();

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t.common.error;
      setError(
        msg.includes("Invalid login credentials")
          ? l.incorrectCredentials
          : msg
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    setIsGoogleLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        queryParams: { prompt: "select_account" },
      },
    });
    if (error) {
      setError(error.message);
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-4 sm:gap-6", className)} {...props}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-3 sm:gap-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <img src="/main-logo.png" alt="WHRD Hub" className="h-10 sm:h-12 w-auto object-contain" />
          <p className="text-xs text-muted-foreground hidden sm:block">Protect · Heal · Nurture</p>
        </div>
        <LangSwitcher variant="compact" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{l.title}</CardTitle>
          <CardDescription>{l.subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Google */}
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isLoading}
            aria-label={isGoogleLoading ? l.redirecting : l.continueWithGoogle}
          >
            <GoogleIcon />
            <span aria-hidden="true">{isGoogleLoading ? l.redirecting : l.continueWithGoogle}</span>
          </Button>

          <div role="separator" aria-label={t.common.or} className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span aria-hidden="true" className="bg-card px-2 text-muted-foreground">{t.common.or}</span>
            </div>
          </div>

          {/* Error live region */}
          <div aria-live="assertive" aria-atomic="true" className="sr-only">
            {error ?? ""}
          </div>

          {/* Email / Username + Password */}
          <form onSubmit={handleEmailLogin} className="space-y-4" noValidate aria-label="Sign in with email">
            <div className="grid gap-2">
              <Label htmlFor="identifier">{l.usernameOrEmail}</Label>
              <Input
                id="identifier"
                type="text"
                placeholder={l.usernamePlaceholder}
                required
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{l.password}</Label>
                <Link
                  id="forgot-password-hint"
                  href="/auth/forgot-password"
                  className="text-xs text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
                >
                  {l.forgotPassword}
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                aria-describedby="forgot-password-hint"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg flex items-center gap-2">
                <span aria-hidden="true">⚠</span>{error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
              {isLoading ? l.loggingIn : l.logIn}
            </Button>
          </form>

          <div role="note" aria-label="Anonymous access information" className="p-3 rounded-xl bg-muted/40 flex items-start gap-2 text-xs text-muted-foreground">
            <Shield className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary" aria-hidden="true" />
            <span>
              {l.anonHint}
            </span>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            {l.noAccount}{" "}
            <Link href="/auth/sign-up" className="text-primary font-semibold underline-offset-4 hover:underline">
              {l.signUp}
            </Link>
            {" "}{t.common.or}{" "}
            <Link href="/report" className="text-primary font-semibold underline-offset-4 hover:underline">
              {l.reportAnon}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

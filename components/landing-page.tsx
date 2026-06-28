"use client";

import Link from "next/link";
import { Shield, Heart, Users, AlertTriangle, Lock, FileText, ArrowRight, Phone, CheckCircle, LayoutDashboard } from "lucide-react";
import { useT } from "@/lib/i18n/context";
import { LangSwitcher } from "@/components/lang-switcher";

const REPORT_ICONS = [AlertTriangle, Shield, Users, Heart, Lock, AlertTriangle, Shield, Users, FileText];

export function LandingPage({ isAuthenticated }: { isAuthenticated: boolean }) {
  const t = useT();
  const l = t.landing;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ── Skip to main content ── */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:font-semibold focus:text-sm"
      >
        Skip to main content
      </a>

      {/* ── Nav ── */}
      <nav aria-label="Main navigation" className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3" aria-label="WHRD Hub home">
            <img src="/main-logo.png" alt="WHRD Hub" className="h-10 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-2">
            <LangSwitcher variant="compact" />
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors px-4 py-2 rounded-lg border border-primary/30 hover:border-primary/50"
              >
                <LayoutDashboard className="w-4 h-4" />
                {l.nav.dashboard}
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
              >
                {l.nav.signIn}
              </Link>
            )}
            <Link
              href="/report"
              className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              {l.nav.reportNow}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <main id="main-content" tabIndex={-1}>
      <section className="pt-32 pb-24 px-6 bg-primary text-white" aria-labelledby="hero-heading">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider mb-8">
            <Lock className="w-3 h-3" />
            {l.hero.badge}
          </div>
          <h1 id="hero-heading" className="text-4xl sm:text-5xl md:text-[3.25rem] font-black leading-[1.12] mb-5">
            {l.hero.title}
            <br />
            <span className="text-white/75 font-light">{l.hero.titleLight}</span>
          </h1>
          <p className="text-base md:text-lg text-white/70 max-w-xl mx-auto mb-10 leading-relaxed">
            {l.hero.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/report"
              className="group inline-flex items-center justify-center gap-2 bg-white text-primary px-7 py-3.5 rounded-lg font-bold text-sm hover:bg-white/95 transition-colors"
            >
              {l.hero.ctaMakeReport}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center justify-center border border-white/25 text-white px-7 py-3.5 rounded-lg font-medium text-sm hover:bg-white/8 transition-colors"
            >
              {l.hero.ctaHowItWorks}
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] text-white/55">
            {l.hero.trust.map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle className="w-3 h-3 text-white/50" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Safety banner ── */}
      <div role="note" aria-label="Safety information" className="bg-amber-50 border-b border-amber-200 py-2.5 px-6">
        <p className="text-center text-xs text-amber-800 max-w-3xl mx-auto">
          <span className="font-semibold">{l.safetyBanner.bold}</span>{" "}
          {l.safetyBanner.text}{" "}
          <Link href="/report" className="underline font-semibold hover:text-amber-900 transition-colors">
            {l.safetyBanner.link}
          </Link>
        </p>
      </div>

      {/* ── How it works ── */}
      <section id="how-it-works" aria-labelledby="how-it-works-heading" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "hsl(27, 87%, 52%)" }}>
              {l.howItWorks.label}
            </p>
            <h2 id="how-it-works-heading" className="text-2xl sm:text-3xl font-black text-foreground mb-3">{l.howItWorks.title}</h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">{l.howItWorks.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {l.howItWorks.steps.map((step, i) => {
              const num = String(i + 1).padStart(2, "0");
              const Icon = [FileText, Lock, Shield][i];
              return (
                <div key={num} className="relative p-7 rounded-2xl border border-border bg-background hover:shadow-md transition-shadow">
                  <span className="absolute top-5 right-6 text-5xl font-black text-primary/[0.07] select-none leading-none">{num}</span>
                  <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center mb-5" aria-hidden="true">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-foreground mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── What you can report ── */}
      <section aria-labelledby="report-types-heading" className="py-24 px-6 bg-muted/30 border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "hsl(192, 100%, 38%)" }}>
              {l.whatYouCanReport.label}
            </p>
            <h2 id="report-types-heading" className="text-2xl sm:text-3xl font-black text-foreground mb-3">{l.whatYouCanReport.title}</h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">{l.whatYouCanReport.subtitle}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {l.whatYouCanReport.items.map((item, i) => {
              const Icon = REPORT_ICONS[i % REPORT_ICONS.length];
              return (
                <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-border hover:shadow-sm transition-shadow">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0" aria-hidden="true">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium leading-snug">{item}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section aria-label="Platform statistics" className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border rounded-2xl overflow-hidden border border-border">
            {l.stats.map((item, i) => {
              const accent = ["hsl(270, 52%, 37%)", "hsl(27, 87%, 52%)", "hsl(192, 100%, 38%)"][i];
              return (
                <div key={i} className="bg-white px-8 py-10 text-center">
                  <p className="text-3xl font-black mb-1" style={{ color: accent }}>{item.value}</p>
                  <p className="font-bold text-foreground text-sm mb-1">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section aria-labelledby="cta-heading" className="py-24 px-6 bg-primary text-white">
        <div className="max-w-xl mx-auto text-center">
          <h2 id="cta-heading" className="text-2xl sm:text-3xl font-black mb-4">{l.cta.title}</h2>
          <p className="text-white/70 mb-8 text-base leading-relaxed">{l.cta.subtitle}</p>
          <Link
            href="/report"
            className="group inline-flex items-center gap-2 bg-white text-primary px-8 py-3.5 rounded-lg font-bold text-sm hover:bg-white/95 transition-colors"
          >
            {l.cta.button}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* ── Emergency strip ── */}
      <div role="complementary" aria-label="Emergency contacts" className="bg-red-50 border-t border-red-200 py-3 px-6">
        <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-5 text-sm">
          <span className="text-red-700 font-semibold flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5" aria-hidden="true" />{l.emergency.title}
          </span>
          <a href="tel:999"  className="font-bold text-red-700 hover:underline">{l.emergency.police}</a>
          <a href="tel:1195" className="font-bold text-red-700 hover:underline">{l.emergency.gbv}</a>
          <a href="tel:116"  className="font-bold text-red-700 hover:underline">{l.emergency.childline}</a>
        </div>
      </div>

      </main>

      {/* ── Footer ── */}
      <footer aria-label="Site footer" className="border-t border-border py-10 px-6 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/main-logo.png" alt="WHRD Hub" className="h-9 w-auto object-contain" />
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <LangSwitcher variant="full" />
            <p className="text-[11px] text-muted-foreground font-medium text-center md:text-right">
              {l.footer.tagline}
              <span className="mx-2 opacity-30">|</span>
              {l.footer.legal}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

import Link from "next/link";
import {
  Shield, Heart, Users, AlertTriangle, Lock,
  FileText, ArrowRight, Phone, CheckCircle,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-background">

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <img src="/icon.png" alt="WHRD Hub" className="w-9 h-9" />
            <div className="leading-tight">
              <div>
                <span className="font-black text-primary text-[15px] tracking-tight">WHRD</span>
                <span className="font-black text-accent text-[15px] tracking-tight">HUB</span>
              </div>
              <p className="text-[9px] text-muted-foreground font-semibold tracking-widest uppercase leading-none">
                Women Human Rights Defenders
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
            >
              Sign in
            </Link>
            <Link
              href="/report"
              className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Report now
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 bg-primary text-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider mb-8">
            <Lock className="w-3 h-3" />
            Secure · Anonymous · Confidential
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-[3.25rem] font-black leading-[1.12] mb-5">
            Your voice matters.
            <br />
            <span className="text-white/75 font-light">Your safety comes first.</span>
          </h1>

          <p className="text-base md:text-lg text-white/70 max-w-xl mx-auto mb-10 leading-relaxed">
            A safe space for Women Human Rights Defenders to report gender-based violence
            and connect with support they deserve.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/report"
              className="group inline-flex items-center justify-center gap-2 bg-white text-primary px-7 py-3.5 rounded-lg font-bold text-sm hover:bg-white/95 transition-colors"
            >
              Make a report
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center justify-center border border-white/25 text-white px-7 py-3.5 rounded-lg font-medium text-sm hover:bg-white/8 transition-colors"
            >
              How it works
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] text-white/55">
            {["No email required", "No IP logged", "Encrypted reports", "Kenya DPA compliant"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle className="w-3 h-3 text-white/50" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Safety notice */}
      <div className="bg-amber-50 border-b border-amber-200 py-2.5 px-6">
        <p className="text-center text-xs text-amber-800 max-w-3xl mx-auto">
          <span className="font-semibold">Your safety first.</span>{" "}
          This platform does not store your IP address. You can report without creating an account.{" "}
          <Link href="/report" className="underline font-semibold hover:text-amber-900 transition-colors">
            Start here
          </Link>
        </p>
      </div>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "hsl(27, 87%, 52%)" }}>
              Simple process
            </p>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-3">
              How it works
            </h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
              Three steps. No account needed. Your identity is protected at every stage.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                step: "01",
                icon: <FileText className="w-5 h-5" />,
                title: "Share what happened",
                desc: "Describe the incident in your own words. Only share what feels safe. No field forces sensitive details.",
              },
              {
                step: "02",
                icon: <Lock className="w-5 h-5" />,
                title: "Get a private account",
                desc: "We create an anonymous username for you automatically. No email required to report.",
              },
              {
                step: "03",
                icon: <Shield className="w-5 h-5" />,
                title: "Access support",
                desc: "Your report reaches WHRD Hub defenders. Receive referrals for legal, medical, and counselling support.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative p-7 rounded-2xl border border-border bg-background hover:shadow-md transition-shadow"
              >
                <span className="absolute top-5 right-6 text-5xl font-black text-primary/[0.07] select-none leading-none">
                  {item.step}
                </span>
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center mb-5">
                  {item.icon}
                </div>
                <h3 className="font-bold text-base text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you can report */}
      <section className="py-24 px-6 bg-muted/30 border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "hsl(192, 100%, 38%)" }}>
              We hear you
            </p>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-3">
              What you can report
            </h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
              For Women Human Rights Defenders and community members experiencing any of the following.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { icon: <AlertTriangle className="w-4 h-4" />, label: "Online harassment and hate speech" },
              { icon: <Shield className="w-4 h-4" />, label: "Cyber stalking and digital threats" },
              { icon: <Users className="w-4 h-4" />, label: "Non-consensual image sharing" },
              { icon: <Heart className="w-4 h-4" />, label: "Intimate partner digital abuse" },
              { icon: <Lock className="w-4 h-4" />, label: "Account hacking and surveillance" },
              { icon: <AlertTriangle className="w-4 h-4" />, label: "Physical GBV and sexual violence" },
              { icon: <Shield className="w-4 h-4" />, label: "Intimidation targeting HRD work" },
              { icon: <Users className="w-4 h-4" />, label: "Community and workplace abuse" },
              { icon: <FileText className="w-4 h-4" />, label: "Any other abuse you have experienced" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-border hover:shadow-sm transition-shadow"
              >
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <span className="text-sm font-medium leading-snug">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border rounded-2xl overflow-hidden border border-border">
            {[
              { value: "100%", label: "Anonymous reporting", desc: "No email or real name required", accent: "hsl(270, 52%, 37%)" },
              { value: "24 h", label: "Response time",       desc: "Defenders review every report", accent: "hsl(27, 87%, 52%)" },
              { value: "Encrypted", label: "All data",       desc: "Kenya Data Protection Act 2019", accent: "hsl(192, 100%, 38%)" },
            ].map((item) => (
              <div key={item.label} className="bg-white px-8 py-10 text-center">
                <p className="text-3xl font-black mb-1" style={{ color: item.accent }}>{item.value}</p>
                <p className="font-bold text-foreground text-sm mb-1">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-primary text-white">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-black mb-4">You are not alone.</h2>
          <p className="text-white/70 mb-8 text-base leading-relaxed">
            WHRD Hub defenders are here to listen, support, and act.
            Your report is safe with us.
          </p>
          <Link
            href="/report"
            className="group inline-flex items-center gap-2 bg-white text-primary px-8 py-3.5 rounded-lg font-bold text-sm hover:bg-white/95 transition-colors"
          >
            Report safely
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      {/* Emergency bar */}
      <div className="bg-red-50 border-t border-red-200 py-3 px-6">
        <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-5 text-sm">
          <span className="text-red-700 font-semibold flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5" />
            In immediate danger?
          </span>
          <a href="tel:999" className="font-bold text-red-700 hover:underline">Police: 999</a>
          <a href="tel:1195" className="font-bold text-red-700 hover:underline">GBV Helpline: 1195</a>
          <a href="tel:116" className="font-bold text-red-700 hover:underline">Childline: 116</a>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-10 px-6 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/icon.png" alt="WHRD Hub" className="w-8 h-8" />
            <div>
              <p className="font-black text-sm">
                <span className="text-primary">WHRD</span>
                <span className="text-accent">HUB</span>
              </p>
              <p className="text-[9px] text-muted-foreground font-semibold tracking-widest uppercase">
                Women Human Rights Defenders
              </p>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground font-medium text-center md:text-right">
            Protect · Heal · Nurture
            <span className="mx-2 opacity-30">|</span>
            All reports encrypted · No IP addresses logged · Kenya Data Protection Act 2019
          </p>
        </div>
      </footer>

    </main>
  );
}

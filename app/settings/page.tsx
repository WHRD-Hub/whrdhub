"use client";

import { Check } from "lucide-react";
import { useLanguage, LANGUAGE_META, SUPPORTED, type Language } from "@/lib/i18n/context";
import { toast } from "sonner";

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage();
  const s = t.settings;

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
    toast.success(LANGUAGE_META[lang].nativeLabel + " — " + t.settings.language.saved);
  };

  return (
    <div className="min-h-screen bg-muted/20 py-12 px-6">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-foreground">{s.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{s.subtitle}</p>
        </div>

        {/* Language section */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
          <div className="space-y-0.5">
            <h2 className="font-bold text-base text-foreground">{s.language.title}</h2>
            <p className="text-xs text-muted-foreground">{s.language.subtitle}</p>
          </div>

          <p className="text-xs text-primary/80 bg-primary/5 border border-primary/15 rounded-lg px-3 py-2">
            {s.language.autoDetected}
          </p>

          <div className="grid sm:grid-cols-2 gap-2.5">
            {SUPPORTED.map((lang: Language) => {
              const meta = LANGUAGE_META[lang];
              const isSelected = lang === language;
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => handleSelect(lang)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all
                    ${isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background hover:border-primary/30 hover:bg-muted/30"
                    }`}
                >
                  <span className="text-2xl leading-none">{meta.flag}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm ${isSelected ? "text-primary" : "text-foreground"}`}>
                      {meta.nativeLabel}
                    </p>
                    <p className="text-xs text-muted-foreground">{meta.label}</p>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

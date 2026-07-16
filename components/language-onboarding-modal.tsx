"use client";

import { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { useLanguage, LANGUAGE_META, type Language } from "@/lib/i18n/context";
import { translations } from "@/lib/i18n/translations";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CHOSEN_KEY = "whrd-lang-chosen";
const OTHER_LANGS: Language[] = ["fr", "pt", "de", "ar"];

export function LanguageOnboardingModal() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);

  // The modal copy should read in whatever language is currently active so the
  // prompt itself is understandable; default English on first paint.
  const t = translations[language].languageModal;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(CHOSEN_KEY)) {
      setOpen(true);
    }
  }, []);

  function choose(lang: Language) {
    setLanguage(lang);
    localStorage.setItem(CHOSEN_KEY, "1");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => {
      // Dismissing without an explicit choice still records one (current language)
      // so the modal doesn't reappear on every visit.
      if (!v) localStorage.setItem(CHOSEN_KEY, "1");
      setOpen(v);
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Globe className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-center">{t.title}</DialogTitle>
          <DialogDescription className="text-center">{t.subtitle}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 mt-2">
          <button
            type="button"
            onClick={() => choose("en")}
            className="flex flex-col items-center gap-1.5 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-colors py-5 font-semibold"
          >
            <span className="text-2xl">{LANGUAGE_META.en.flag}</span>
            {t.english}
          </button>
          <button
            type="button"
            onClick={() => choose("sw")}
            className="flex flex-col items-center gap-1.5 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-colors py-5 font-semibold"
          >
            <span className="text-2xl">{LANGUAGE_META.sw.flag}</span>
            {t.kiswahili}
          </button>
        </div>

        <div className="mt-2">
          <label className="text-xs text-muted-foreground mb-1.5 block">{t.otherLanguages}</label>
          <Select onValueChange={(v) => choose(v as Language)}>
            <SelectTrigger>
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              {OTHER_LANGS.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {LANGUAGE_META[lang].flag} {LANGUAGE_META[lang].nativeLabel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </DialogContent>
    </Dialog>
  );
}

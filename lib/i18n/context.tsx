"use client";

import {
  createContext, useContext, useState, useEffect,
  useCallback, type ReactNode,
} from "react";
import { translations, LANGUAGE_META, type Language, type TranslationSchema } from "./translations";

// ─── types ────────────────────────────────────────────────────────────────────
interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationSchema;
  isRTL: boolean;
  /** true when the language is one that shows dual-language labels in the report form */
  isDualLang: boolean;
  /** the secondary label language for dual-lang mode */
  secondaryLang: Language | null;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

// ─── detection ────────────────────────────────────────────────────────────────
const SUPPORTED: Language[] = ["en", "sw", "fr", "pt", "de", "ar"];
const LS_KEY = "whrd-language";

function detectLanguage(): Language {
  if (typeof window === "undefined") return "en";

  // 1. Saved preference wins
  const saved = localStorage.getItem(LS_KEY) as Language | null;
  if (saved && SUPPORTED.includes(saved)) return saved;

  // 2. Browser locale
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith("sw")) return "sw";
  if (browserLang.startsWith("fr")) return "fr";
  if (browserLang.startsWith("pt")) return "pt";
  if (browserLang.startsWith("de")) return "de";
  if (browserLang.startsWith("ar")) return "ar";
  // en-KE, en-US, en-* → English (default for Kenya)
  return "en";
}

// ─── provider ────────────────────────────────────────────────────────────────
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  // Detect on mount (client-only)
  useEffect(() => {
    setLanguageState(detectLanguage());
  }, []);

  // Update html[dir] and html[lang] when language changes
  useEffect(() => {
    const meta = LANGUAGE_META[language];
    document.documentElement.lang = language;
    document.documentElement.dir = meta.rtl ? "rtl" : "ltr";
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LS_KEY, lang);
  }, []);

  const t = translations[language] as unknown as TranslationSchema;
  const isRTL = LANGUAGE_META[language].rtl;

  // In English or Swahili, report form fields show dual-language labels (EN+SW)
  const isDualLang = language === "en" || language === "sw";
  const secondaryLang: Language | null = isDualLang ? (language === "en" ? "sw" : "en") : null;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL, isDualLang, secondaryLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

// ─── hooks ────────────────────────────────────────────────────────────────────
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside <LanguageProvider>");
  return ctx;
}

/** Convenience hook: just returns the translator */
export function useT() {
  return useLanguage().t;
}

export { LANGUAGE_META, SUPPORTED, type Language };

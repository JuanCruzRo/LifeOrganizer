"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import {
  AppLanguage,
  copy,
  LanguageMode,
  resolveAppLanguage,
  type TranslationSet
} from "@/lib/i18n";

const LANGUAGE_MODE_KEY = "life-organizer-language-mode";
const MANUAL_LANGUAGE_KEY = "life-organizer-manual-language";

type LanguageContextValue = {
  copy: TranslationSet;
  language: AppLanguage;
  manualLanguage: AppLanguage;
  mode: LanguageMode;
  setManualLanguage: (language: AppLanguage) => void;
  setMode: (mode: LanguageMode) => void;
  systemLanguage: AppLanguage;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<LanguageMode>("auto");
  const [manualLanguage, setManualLanguageState] = useState<AppLanguage>("en");
  const [systemLanguage, setSystemLanguage] = useState<AppLanguage>("en");

  useEffect(() => {
    const storedMode = window.localStorage.getItem(LANGUAGE_MODE_KEY);
    const storedLanguage = window.localStorage.getItem(MANUAL_LANGUAGE_KEY);
    const browserLocale =
      navigator.languages?.[0] ??
      navigator.language ??
      Intl.DateTimeFormat().resolvedOptions().locale;
    const resolvedSystemLanguage = resolveAppLanguage(browserLocale);

    setSystemLanguage(resolvedSystemLanguage);

    if (storedMode === "auto" || storedMode === "manual") {
      setModeState(storedMode);
    }

    if (storedLanguage === "en" || storedLanguage === "es") {
      setManualLanguageState(storedLanguage);
    } else {
      setManualLanguageState(resolvedSystemLanguage);
    }
  }, []);

  const language = mode === "manual" ? manualLanguage : systemLanguage;

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<LanguageContextValue>(() => {
    return {
      copy: copy[language],
      language,
      manualLanguage,
      mode,
      setManualLanguage: (nextLanguage) => {
        setManualLanguageState(nextLanguage);
        window.localStorage.setItem(MANUAL_LANGUAGE_KEY, nextLanguage);
      },
      setMode: (nextMode) => {
        setModeState(nextMode);
        window.localStorage.setItem(LANGUAGE_MODE_KEY, nextMode);
      },
      systemLanguage
    };
  }, [language, manualLanguage, mode, systemLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useAppLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useAppLanguage must be used inside LanguageProvider.");
  }

  return context;
}

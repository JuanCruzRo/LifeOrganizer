"use client";

import { ClerkProvider } from "@clerk/nextjs";
import {
  deDE, enUS, esES, frFR, itIT, jaJP, koKR, nlNL, plPL, ptBR, ruRU, trTR, zhCN
} from "@clerk/localizations";
import type { ReactNode } from "react";
import { useAppLanguage } from "@/components/language-provider";
import type { AppLanguage } from "@/lib/i18n";

const clerkLocalizations: Record<AppLanguage, typeof enUS> = {
  en: enUS, es: esES, pt: ptBR, fr: frFR, de: deDE, it: itIT,
  zh: zhCN, ja: jaJP, ko: koKR, ru: ruRU, tr: trTR, nl: nlNL, pl: plPL
};

// Clerk's own screens (email, password, errors...) follow the app language.
export function LocalizedClerkProvider({ children }: { children: ReactNode }) {
  const { language } = useAppLanguage();
  return <ClerkProvider localization={clerkLocalizations[language]}>{children}</ClerkProvider>;
}

"use client";

import { FiChevronDown, FiMonitor } from "react-icons/fi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/animate-ui/radix/dropdown-menu";
import { AppLanguage, languageFlags, languageNativeNames, supportedLanguages } from "@/lib/i18n";
import { useAppLanguage } from "@/components/language-provider";

export function LanguageSwitcher() {
  const { copy, language, manualLanguage, mode, setManualLanguage, setMode } = useAppLanguage();
  const selectedValue = mode === "auto" ? "auto" : manualLanguage;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-2 text-sm font-medium text-foreground transition hover:bg-secondary/80"
          type="button"
        >
          <span className="text-base leading-none">{languageFlags[language]}</span>
          <span className="hidden sm:inline">{languageNativeNames[language]}</span>
          {mode === "auto" && (
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
              {copy.language.automatic}
            </span>
          )}
          <FiChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-56 max-h-96 overflow-y-auto">
        <DropdownMenuLabel>{copy.language.responseLanguage}</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          onValueChange={(value) => {
            if (value === "auto") {
              setMode("auto");
              return;
            }
            if (supportedLanguages.includes(value as AppLanguage)) {
              setManualLanguage(value as AppLanguage);
              setMode("manual");
            }
          }}
          value={selectedValue}
        >
          <DropdownMenuRadioItem value="auto">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-foreground">
              <FiMonitor className="h-3.5 w-3.5" />
            </span>
            <span className="flex flex-col">
              <span>{copy.language.automatic}</span>
              <span className="text-xs font-normal text-muted-foreground">
                {copy.language.activeLanguage}
              </span>
            </span>
          </DropdownMenuRadioItem>

          <DropdownMenuSeparator />

          {supportedLanguages.map((lang) => (
            <DropdownMenuRadioItem key={lang} value={lang}>
              <span className="text-lg leading-none">{languageFlags[lang]}</span>
              <span>{languageNativeNames[lang]}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

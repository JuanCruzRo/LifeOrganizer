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
import { useAppLanguage } from "@/components/language-provider";

export function LanguageSwitcher() {
  const { copy, language, manualLanguage, mode, setManualLanguage, setMode } = useAppLanguage();
  const selectedValue = mode === "auto" ? "auto" : manualLanguage;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="inline-flex items-center gap-3 rounded-full border border-[rgba(31,41,55,0.08)] bg-white/80 px-3 py-2 text-sm font-medium text-[var(--foreground)] shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition hover:border-[rgba(244,114,36,0.32)] hover:bg-white"
          type="button"
        >
          <LanguageFlag language={language} />
          <span className="hidden sm:inline">
            {language === "es" ? copy.language.spanish : copy.language.english}
          </span>
          {mode === "auto" ? (
            <span className="rounded-full bg-[rgba(244,114,36,0.14)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
              {copy.language.automatic}
            </span>
          ) : null}
          <FiChevronDown className="h-4 w-4 text-[var(--muted)]" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-[18rem]">
        <DropdownMenuLabel>{copy.language.responseLanguage}</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          onValueChange={(value) => {
            if (value === "auto") {
              setMode("auto");
              return;
            }

            if (value === "en" || value === "es") {
              setManualLanguage(value);
              setMode("manual");
            }
          }}
          value={selectedValue}
        >
          <DropdownMenuRadioItem value="auto">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(15,23,42,0.06)] text-[var(--foreground)]">
              <FiMonitor className="h-4 w-4" />
            </span>
            <span className="flex flex-col">
              <span>{copy.language.automatic}</span>
              <span className="text-xs font-normal text-[var(--muted)]">
                {copy.language.activeLanguage}
              </span>
            </span>
          </DropdownMenuRadioItem>

          <DropdownMenuSeparator />

          <DropdownMenuRadioItem value="en">
            <LanguageFlag language="en" />
            <span>{copy.language.english}</span>
          </DropdownMenuRadioItem>

          <DropdownMenuRadioItem value="es">
            <LanguageFlag language="es" />
            <span>{copy.language.spanish}</span>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function LanguageFlag({ language }: { language: "en" | "es" }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-[rgba(15,23,42,0.08)] bg-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)]"
    >
      {language === "es" ? <SpainFlag /> : <UnitedStatesFlag />}
    </span>
  );
}

function SpainFlag() {
  return (
    <svg className="h-full w-full" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect fill="#AA151B" height="32" width="32" />
      <rect fill="#F1BF00" height="16" width="32" y="8" />
    </svg>
  );
}

function UnitedStatesFlag() {
  return (
    <svg className="h-full w-full" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect fill="#B22234" height="32" width="32" />
      <g fill="#FFFFFF">
        <rect height="2.46" width="32" y="2.46" />
        <rect height="2.46" width="32" y="7.38" />
        <rect height="2.46" width="32" y="12.31" />
        <rect height="2.46" width="32" y="17.23" />
        <rect height="2.46" width="32" y="22.15" />
        <rect height="2.46" width="32" y="27.08" />
      </g>
      <rect fill="#3C3B6E" height="14.77" width="14.5" />
    </svg>
  );
}

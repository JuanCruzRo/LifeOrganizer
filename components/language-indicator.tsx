"use client";

import { useAppLanguage } from "@/components/language-provider";

export function LanguageIndicator() {
  const { language } = useAppLanguage();

  return (
    <span className="inline-flex h-6 w-6 overflow-hidden rounded-full border border-border">
      {language === "es" ? <SpainFlag /> : <UsFlag />}
    </span>
  );
}

function SpainFlag() {
  return (
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect fill="#AA151B" height="32" width="32" />
      <rect fill="#F1BF00" height="16" width="32" y="8" />
    </svg>
  );
}

function UsFlag() {
  return (
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
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

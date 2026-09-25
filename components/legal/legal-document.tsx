"use client";

import Link from "next/link";
import { useAppLanguage } from "@/components/language-provider";

export type LegalSection = { title: string; body: string[] };
export type LegalContent = { title: string; intro?: string; sections: LegalSection[] };

type Props = {
  content: { es: LegalContent; en: LegalContent };
  lastUpdated: string;
};

export function LegalDocument({ content, lastUpdated }: Props) {
  const { language } = useAppLanguage();
  const doc = language === "es" ? content.es : content.en;
  const backLabel = language === "es" ? "← Volver a Spark" : "← Back to Spark";
  const updatedLabel = language === "es" ? "Última actualización" : "Last updated";

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-12 text-[hsl(220,10%,85%)]">
      <Link href="/" className="text-sm text-[hsl(168,100%,42%)] hover:underline">
        {backLabel}
      </Link>
      <h1 className="mt-6 font-display text-3xl font-semibold text-[hsl(220,10%,96%)]">{doc.title}</h1>
      <p className="mt-2 text-sm text-[hsl(220,8%,60%)]">
        {updatedLabel}: {lastUpdated}
      </p>
      {doc.intro && <p className="mt-6 leading-relaxed">{doc.intro}</p>}
      {doc.sections.map((section, i) => (
        <section key={section.title} className="mt-8">
          <h2 className="text-lg font-semibold text-[hsl(220,10%,96%)]">
            {i + 1}. {section.title}
          </h2>
          {section.body.map((paragraph) => (
            <p key={paragraph} className="mt-3 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </section>
      ))}
    </main>
  );
}

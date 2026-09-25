import type { Metadata } from "next";
import { headers } from "next/headers";
import { LandingContent } from "@/components/landing/landing-content";
import { resolveAppLanguage, type AppLanguage } from "@/lib/i18n";
import { landingCopy } from "@/lib/landing-copy";
import { LEGAL } from "@/lib/legal-config";

// Server-side language guess from the browser's Accept-Language header, so the first paint
// (and search engines) already get a sensible language. The client then follows the app's
// own language provider (browser locale or the user's manual choice).
async function detectLanguage(): Promise<AppLanguage> {
  const header = (await headers()).get("accept-language");
  if (!header) return "es";
  return resolveAppLanguage(header.split(",")[0]?.trim());
}

export async function generateMetadata(): Promise<Metadata> {
  const t = landingCopy[await detectLanguage()];
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: { canonical: "/" },
    openGraph: { title: t.metaTitle, description: t.metaDescription, type: "website" }
  };
}

export default async function LandingPage() {
  const initialLanguage = await detectLanguage();
  const t = landingCopy[initialLanguage];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Spark",
        applicationCategory: "ProductivityApplication",
        operatingSystem: "Web",
        description: t.appDescription,
        offers: [
          { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" },
          { "@type": "Offer", name: "Plus", price: String(LEGAL.prices.plus), priceCurrency: "USD" },
          { "@type": "Offer", name: "Pro", price: String(LEGAL.prices.pro), priceCurrency: "USD" }
        ]
      },
      {
        "@type": "FAQPage",
        mainEntity: t.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a }
        }))
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LandingContent initialLanguage={initialLanguage} />
    </>
  );
}

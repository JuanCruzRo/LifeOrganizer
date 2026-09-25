import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/legal-document";
import { LEGAL } from "@/lib/legal-config";
import { termsContent } from "@/lib/legal-content";

export const metadata: Metadata = { title: "Términos y condiciones · Spark" };

export default function TermsPage() {
  return <LegalDocument content={termsContent} lastUpdated={LEGAL.lastUpdated} />;
}

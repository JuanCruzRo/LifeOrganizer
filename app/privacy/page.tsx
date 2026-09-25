import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/legal-document";
import { LEGAL } from "@/lib/legal-config";
import { privacyContent } from "@/lib/legal-content";

export const metadata: Metadata = { title: "Política de privacidad · Spark" };

export default function PrivacyPage() {
  return <LegalDocument content={privacyContent} lastUpdated={LEGAL.lastUpdated} />;
}

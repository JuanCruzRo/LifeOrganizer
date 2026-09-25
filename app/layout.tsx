import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Space_Grotesk } from "next/font/google";
import { LanguageProvider } from "@/components/language-provider";
import { LocalizedClerkProvider } from "@/components/localized-clerk-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Spark",
  description: "AI-powered task organizer."
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es" suppressHydrationWarning className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body>
        <LanguageProvider>
          <LocalizedClerkProvider>{children}</LocalizedClerkProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

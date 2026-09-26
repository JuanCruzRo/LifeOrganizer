import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter, Space_Grotesk } from "next/font/google";
import { LanguageProvider } from "@/components/language-provider";
import { LocalizedClerkProvider } from "@/components/localized-clerk-provider";
import { PwaRegister } from "@/components/pwa-register";
import { MotionPreferences } from "@/components/motion-preferences";
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
  description: "AI-powered task organizer.",
  appleWebApp: { capable: true, title: "Spark", statusBarStyle: "black-translucent" },
  icons: { apple: "/apple-icon.png" }
};

export const viewport: Viewport = {
  themeColor: "#101116",
  // Lets the app use the full screen on phones, below the notch.
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es" suppressHydrationWarning className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body>
        <PwaRegister />
        <MotionPreferences>
          <LanguageProvider>
            <LocalizedClerkProvider>{children}</LocalizedClerkProvider>
          </LanguageProvider>
        </MotionPreferences>
      </body>
    </html>
  );
}

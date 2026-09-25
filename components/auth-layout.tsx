"use client";

import { type ReactNode } from "react";
import { motion } from "motion/react";
import { useAppLanguage } from "@/components/language-provider";
import { authHeadings, landingCopy } from "@/lib/landing-copy";

const BOLT = "M 32 5 L 8 35 L 30 35 L 28 55 L 52 25 L 30 25 Z";

type AuthLayoutProps = {
  children: ReactNode;
  mode: "sign-in" | "sign-up";
};

export function AuthLayout({ children, mode }: AuthLayoutProps) {
  const { language } = useAppLanguage();
  const t = landingCopy[language];
  const FEATURES = [
    { icon: "✦", text: t.badge },
    { icon: "✦", text: t.features[0].title },
    { icon: "✦", text: t.features[3].title },
  ];
  const heading = mode === "sign-up" ? authHeadings[language].signUp : authHeadings[language].signIn;
  return (
    <div className="flex min-h-screen bg-[hsl(228,12%,7%)]">
      {/* Left panel — branding */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-[hsl(228,6%,14%)] bg-[hsl(228,10%,9%)] p-10 lg:flex lg:w-[46%] xl:w-[42%]">
        {/* Subtle grid background */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(hsl(228,6%,14%) 1px, transparent 1px), linear-gradient(90deg, hsl(228,6%,14%) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, black 40%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, black 40%, transparent 100%)",
          }}
        />

        {/* Teal glow orb */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: 480,
            height: 480,
            borderRadius: "50%",
            background: "radial-gradient(circle, hsla(168,100%,42%,0.09) 0%, transparent 70%)",
          }}
        />

        {/* Brand mark top */}
        <motion.div
          className="relative flex items-center gap-2.5"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(168,100%,42%)/15] ring-1 ring-[hsl(168,100%,42%)/30]">
            <svg viewBox="0 0 60 60" className="h-4 w-4 text-[hsl(168,100%,42%)]">
              <path d={BOLT} fill="currentColor" />
            </svg>
          </div>
          <span className="font-display text-base font-semibold tracking-tight text-[hsl(220,10%,93%)]">
            Spark
          </span>
        </motion.div>

        {/* Center content */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Animated bolt */}
          <motion.svg
            viewBox="0 0 60 60"
            className="mb-8 h-14 w-14 text-[hsl(168,100%,42%)]"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.15, 0.95, 1], opacity: [0, 1, 1, 1] }}
            transition={{ duration: 0.7, delay: 0.2, times: [0, 0.4, 0.7, 1] }}
          >
            <path d={BOLT} fill="currentColor" />
          </motion.svg>

          <p className="font-display text-4xl font-bold leading-tight tracking-tight text-[hsl(220,10%,95%)]">
            {t.heroTitle}
          </p>

          <p className="mt-4 max-w-xs text-sm leading-relaxed text-[hsl(220,5%,55%)]">
            {t.heroText}
          </p>

          <ul className="mt-8 flex flex-col gap-3">
            {FEATURES.map((f, i) => (
              <motion.li
                key={f.text}
                className="flex items-center gap-3 text-sm text-[hsl(220,5%,70%)]"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
              >
                <span className="text-[hsl(168,100%,42%)] text-xs">✦</span>
                {f.text}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Bottom tagline */}
        <motion.p
          className="relative text-xs text-[hsl(220,5%,40%)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          Spark — {t.badge}
        </motion.p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-10">
        {/* Mobile brand */}
        <motion.div
          className="mb-8 flex items-center gap-2.5 lg:hidden"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(168,100%,42%)/15] ring-1 ring-[hsl(168,100%,42%)/30]">
            <svg viewBox="0 0 60 60" className="h-4 w-4 text-[hsl(168,100%,42%)]">
              <path d={BOLT} fill="currentColor" />
            </svg>
          </div>
          <span className="font-display text-base font-semibold tracking-tight text-[hsl(220,10%,93%)]">
            Spark
          </span>
        </motion.div>

        <h1 className="mb-5 w-full max-w-sm text-center font-display text-2xl font-semibold text-[hsl(220,10%,93%)]">
          {heading}
        </h1>

        <motion.div
          className="w-full max-w-sm overflow-hidden rounded-2xl bg-[hsl(228,10%,11%)] ring-1 ring-white/5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}

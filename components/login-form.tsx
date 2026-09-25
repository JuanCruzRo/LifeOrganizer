"use client";

import { useState } from "react";
import { SignIn, SignUp } from "@clerk/nextjs";
import { motion, AnimatePresence } from "motion/react";
import { AnimatedLogo } from "@/components/animated-logo";
import { useAppLanguage } from "@/components/language-provider";
import { authHeadings } from "@/lib/landing-copy";
import { cn } from "@/lib/utils";

type Mode = "login" | "register";

export function LoginForm() {
  const [logoComplete, setLogoComplete] = useState(false);
  const [mode, setMode] = useState<Mode>("login");
  const { language } = useAppLanguage();
  const headings = authHeadings[language];

  return (
    <div className="flex h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <AnimatedLogo onComplete={() => setLogoComplete(true)} />

        <AnimatePresence>
          {logoComplete && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              {/* Mode tabs */}
              <div className="mb-6 flex rounded-xl border border-border p-1">
                {(["login", "register"] as Mode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className="relative flex-1 rounded-lg py-2 text-sm font-medium"
                  >
                    {mode === m && (
                      <motion.span
                        layoutId="tab-pill"
                        className="absolute inset-0 rounded-lg bg-primary"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className={cn(
                      "relative z-10 transition-colors duration-200",
                      mode === m ? "text-primary-foreground" : "text-muted-foreground"
                    )}>
                      {m === "login" ? headings.signIn : headings.signUp}
                    </span>
                  </button>
                ))}
              </div>

              {mode === "login" ? (
                <SignIn
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                      card: "bg-card border border-border shadow-none rounded-2xl p-6 w-full",
                      headerTitle: "hidden",
                      headerSubtitle: "hidden",
                      socialButtonsBlockButton: "border border-border bg-secondary hover:bg-secondary/80 text-foreground",
                      formFieldInput: "bg-background border-border text-foreground",
                      formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
                      footerActionLink: "text-primary",
                      dividerLine: "bg-border",
                      dividerText: "text-muted-foreground"
                    }
                  }}
                />
              ) : (
                <SignUp
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                      card: "bg-card border border-border shadow-none rounded-2xl p-6 w-full",
                      headerTitle: "hidden",
                      headerSubtitle: "hidden",
                      socialButtonsBlockButton: "border border-border bg-secondary hover:bg-secondary/80 text-foreground",
                      formFieldInput: "bg-background border-border text-foreground",
                      formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
                      footerActionLink: "text-primary",
                      dividerLine: "bg-border",
                      dividerText: "text-muted-foreground"
                    }
                  }}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

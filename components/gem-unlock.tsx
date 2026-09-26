"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { Gem } from "@/components/gem";
import { useAppLanguage } from "@/components/language-provider";
import { celebrate } from "@/lib/celebrate";
import { gemUnlockCopy, streakCopy } from "@/lib/focus-copy";
import { getGem, GEMS } from "@/lib/gems";

const DISMISS_AFTER_MS = 5200;

/**
 * A small popup, not a takeover: the bar fills, the counter ticks to the new
 * day and the gem drops in. It clears itself so nothing has to be dismissed.
 */
export function GemUnlock({
  level,
  days,
  onClose
}: {
  level: number;
  days: number;
  onClose: () => void;
}) {
  const { language } = useAppLanguage();
  const t = gemUnlockCopy[language];
  const names = streakCopy[language].names;
  const gem = getGem(level) ?? GEMS[0];
  const [count, setCount] = useState(Math.max(0, days - 1));
  const [showGem, setShowGem] = useState(false);

  useEffect(() => {
    // Bar first, then the number flips, then the gem lands.
    const flip = window.setTimeout(() => setCount(days), 800);
    const drop = window.setTimeout(() => {
      setShowGem(true);
      void celebrate("task");
    }, 1050);
    const close = window.setTimeout(onClose, DISMISS_AFTER_MS);
    return () => {
      window.clearTimeout(flip);
      window.clearTimeout(drop);
      window.clearTimeout(close);
    };
  }, [days, onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      // Centred and floating: it never blocks the page underneath.
      className="pointer-events-none fixed inset-x-0 top-24 z-[60] flex justify-center px-4"
      initial={{ opacity: 0, y: -16, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      role="status"
      aria-live="polite"
    >
      <div className="pointer-events-auto relative flex w-full max-w-sm items-center gap-4 rounded-2xl border border-primary/30 bg-card/95 p-4 shadow-2xl shadow-black/40 backdrop-blur">
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center">
          <AnimatePresence>
            {showGem && (
              <motion.div
                initial={{ scale: 0.2, opacity: 0, y: -24, rotate: -25 }}
                animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 13 }}
              >
                <Gem gem={gem} size={60} earned />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            {t.unlocked}
          </p>
          <p className="mt-0.5 truncate font-display text-lg font-semibold">{names[level - 1]}</p>

          <div className="mt-2 flex items-center gap-2">
            {/* The counter ticking over is the point: you see the day you just earned. */}
            <span className="flex items-baseline gap-1 tabular-nums">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={count}
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -12, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 420, damping: 26 }}
                  className="text-xl font-semibold"
                >
                  {count}
                </motion.span>
              </AnimatePresence>
              <span className="text-[11px] text-muted-foreground">{t.dayStreak}</span>
            </span>

            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
              />
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          aria-label={t.keepGoing}
          className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Gem } from "@/components/gem";
import { useAppLanguage } from "@/components/language-provider";
import { celebrate } from "@/lib/celebrate";
import { gemUnlockCopy, streakCopy } from "@/lib/focus-copy";
import { getGem, GEMS } from "@/lib/gems";

const DISMISS_AFTER_MS = 5600;
const RAYS = 12;

/**
 * A small popup, not a takeover. Everything is tinted with the gem's own hue,
 * so each milestone looks like the stone it awards.
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
      className="pointer-events-none fixed inset-x-0 top-20 z-[60] flex justify-center px-4"
      initial={{ opacity: 0, y: -20, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -14, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      role="status"
      aria-live="polite"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={t.keepGoing}
        className="pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-[22px] p-[1.5px] text-left"
        // A hairline gradient border in the gem's colour instead of a flat line.
        style={{ background: `linear-gradient(140deg, ${gem.hue}, ${gem.hue}22 45%, transparent 75%)` }}
      >
        <div className="relative overflow-hidden rounded-[21px] bg-[hsl(228,12%,9%)] px-4 py-4">
          {/* A wash of the gem's colour, strongest behind the stone. */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: `radial-gradient(120% 90% at 14% 50%, ${gem.hue}2e, transparent 62%)` }}
          />

          {/* One slow sweep of light across the card. */}
          <motion.div
            className="pointer-events-none absolute inset-y-0 w-1/3"
            style={{ background: `linear-gradient(100deg, transparent, ${gem.face}24, transparent)` }}
            initial={{ x: "-140%" }}
            animate={{ x: "420%" }}
            transition={{ duration: 1.6, delay: 0.9, ease: "easeInOut" }}
          />

          <div className="relative flex items-center gap-4">
            <div className="relative flex h-[72px] w-[72px] flex-shrink-0 items-center justify-center">
              <AnimatePresence>
                {showGem && (
                  <>
                    {/* Light bursting out the moment the stone lands. */}
                    <motion.span
                      className="absolute inset-0 rounded-full"
                      style={{ background: `radial-gradient(circle, ${gem.hue}66, transparent 65%)` }}
                      initial={{ scale: 0.3, opacity: 0 }}
                      animate={{ scale: [0.3, 1.5, 1.15], opacity: [0, 0.95, 0.55] }}
                      transition={{ duration: 0.85, times: [0, 0.45, 1], ease: "easeOut" }}
                    />
                    {Array.from({ length: RAYS }).map((_, i) => (
                      <motion.span
                        key={i}
                        className="absolute left-1/2 top-1/2 h-[2px] w-3 origin-left rounded-full"
                        style={{ background: gem.face, rotate: `${(360 / RAYS) * i}deg` }}
                        initial={{ scaleX: 0, opacity: 0, x: 6 }}
                        animate={{ scaleX: [0, 1, 0], opacity: [0, 0.8, 0], x: [6, 26, 34] }}
                        transition={{ duration: 0.7, delay: 0.05, ease: "easeOut" }}
                      />
                    ))}
                    <motion.div
                      initial={{ scale: 0.2, opacity: 0, y: -26, rotate: -30 }}
                      animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 250, damping: 12 }}
                      className="relative"
                    >
                      <Gem gem={gem} size={64} earned />
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="min-w-0 flex-1">
              <p
                className="text-[10px] font-bold uppercase tracking-[0.2em]"
                style={{ color: gem.face }}
              >
                {t.unlocked}
              </p>
              <p className="mt-1 truncate font-display text-[22px] font-semibold leading-tight text-[hsl(220,10%,96%)]">
                {names[level - 1]}
              </p>

              <div className="mt-2.5 flex items-center gap-2.5">
                <span className="flex items-baseline gap-1 tabular-nums">
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={count}
                      initial={{ y: 14, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -14, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 420, damping: 26 }}
                      className="font-display text-xl font-semibold"
                      style={{ color: gem.face }}
                    >
                      {count}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-[11px] text-[hsl(220,6%,58%)]">{t.dayStreak}</span>
                </span>

                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/8">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${gem.hue}, ${gem.face})` }}
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </button>
    </motion.div>
  );
}

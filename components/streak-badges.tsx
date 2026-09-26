"use client";


import { motion } from "motion/react";
import { Gem } from "@/components/gem";
import { useAppLanguage } from "@/components/language-provider";
import { streakCopy } from "@/lib/focus-copy";
import { GEMS, getGem } from "@/lib/gems";
import {
  getBadgeProgress,
  getCurrentBadge,
  getDaysToNextBadge,
  getNextBadge
} from "@/lib/streak";
import { cn } from "@/lib/utils";

/** The bolt fills in as the run grows; earned badges stay lit forever. */
export function StreakBadges({
  currentStreak,
  bestStreak
}: {
  currentStreak: number;
  bestStreak: number;
}) {
  const { language } = useAppLanguage();
  const t = streakCopy[language];
  // The name describes the run happening now; the ladder below is unlocked by the
  // best run ever, so breaking a streak never takes a badge away.
  const reference = Math.max(currentStreak, bestStreak);
  const current = getCurrentBadge(currentStreak);
  const next = getNextBadge(currentStreak);
  const remaining = getDaysToNextBadge(currentStreak);
  const progress = getBadgeProgress(currentStreak);
  const unit = currentStreak === 1 ? t.day : t.days;
  // Before the first badge, show the first gem locked: it says what is coming.
  const currentGem = getGem(current?.level ?? 1) ?? GEMS[0];

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t.streak}
          </p>
          <p className="mt-1 flex items-baseline gap-1.5">
            <span className="font-display text-4xl font-semibold tabular-nums">{currentStreak}</span>
            <span className="text-sm text-muted-foreground">{unit}</span>
          </p>
          {current && (
            <p className="mt-0.5 text-sm font-medium text-primary">{t.names[current.level - 1]}</p>
          )}
        </div>

        <motion.div
          key={current?.level ?? 0}
          initial={{ scale: 0.6, opacity: 0, rotate: -12 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 16 }}
          className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-secondary/40"
        >
          <Gem gem={currentGem} size={44} earned={current !== null} />
        </motion.div>
      </div>

      {/* Progress to the next badge keeps the days between milestones meaningful. */}
      <div className="mt-4">
        <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {currentStreak === 0
            ? t.startToday
            : next && remaining !== null
              ? t.toNext.replace("%d", String(remaining))
              : t.allUnlocked}
        </p>
      </div>

      {/* The full ladder: what is earned and what is still ahead. */}
      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {t.badges}
        </p>
        <ul className="mt-2.5 flex flex-wrap gap-x-3 gap-y-2.5">
          {GEMS.map((gem) => {
            const earned = reference >= gem.days;
            return (
              <li
                key={gem.level}
                title={`${t.names[gem.level - 1]} · ${gem.days} ${t.days}`}
                className="flex w-9 flex-col items-center gap-0.5"
              >
                <Gem gem={gem} size={28} earned={earned} />
                <span
                  className={cn(
                    "text-[10px] font-semibold tabular-nums",
                    earned ? "text-foreground" : "text-muted-foreground/60"
                  )}
                >
                  {gem.days}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {bestStreak > currentStreak && (
        <p className="mt-auto pt-3 text-xs text-muted-foreground">
          {t.best}: <span className="font-semibold tabular-nums text-foreground">{bestStreak}</span> {t.days}
        </p>
      )}
    </div>
  );
}

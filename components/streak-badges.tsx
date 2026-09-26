"use client";

import { Zap } from "lucide-react";
import { motion } from "motion/react";
import { useAppLanguage } from "@/components/language-provider";
import { streakCopy } from "@/lib/focus-copy";
import {
  getBadgeProgress,
  getCurrentBadge,
  getDaysToNextBadge,
  getNextBadge,
  STREAK_BADGES
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
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 18 }}
          className={cn(
            "flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl",
            current ? "bg-primary/15 ring-1 ring-primary/40" : "bg-secondary"
          )}
        >
          <Zap
            className={cn("h-7 w-7", current ? "fill-primary text-primary" : "text-muted-foreground")}
          />
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
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {STREAK_BADGES.map((badge) => {
            const earned = reference >= badge.days;
            return (
              <li
                key={badge.level}
                title={`${t.names[badge.level - 1]} · ${badge.days} ${t.days}`}
                className={cn(
                  "flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold tabular-nums transition-colors",
                  earned
                    ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                    : "bg-secondary/60 text-muted-foreground/70"
                )}
              >
                <Zap className={cn("h-3 w-3", earned && "fill-primary")} />
                {badge.days}
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

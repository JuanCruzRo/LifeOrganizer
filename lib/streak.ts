/**
 * Streak badges. Each milestone unlocks a badge that is kept forever: badges
 * are earned on the best streak, not the current one, so breaking a run never
 * erases what was already achieved.
 */
export type StreakBadge = {
  /** 1-based position, also the bolt intensity step. */
  level: number;
  /** Consecutive days needed. */
  days: number;
};

export const STREAK_BADGES: StreakBadge[] = [
  { level: 1, days: 1 },
  { level: 2, days: 3 },
  { level: 3, days: 7 },
  { level: 4, days: 14 },
  { level: 5, days: 30 },
  { level: 6, days: 50 },
  { level: 7, days: 100 },
  { level: 8, days: 150 },
  { level: 9, days: 250 },
  { level: 10, days: 365 },
  { level: 11, days: 500 },
  { level: 12, days: 1000 }
];

/** Every badge unlocked by this many consecutive days. */
export function getEarnedBadges(days: number): StreakBadge[] {
  return STREAK_BADGES.filter((b) => days >= b.days);
}

/** The highest badge reached, or null before the first day. */
export function getCurrentBadge(days: number): StreakBadge | null {
  const earned = getEarnedBadges(days);
  return earned.length > 0 ? earned[earned.length - 1] : null;
}

/** The badge being worked towards, or null once every one is unlocked. */
export function getNextBadge(days: number): StreakBadge | null {
  return STREAK_BADGES.find((b) => days < b.days) ?? null;
}

/** Days left to unlock the next badge, or null when all are unlocked. */
export function getDaysToNextBadge(days: number): number | null {
  const next = getNextBadge(days);
  return next === null ? null : next.days - Math.max(0, days);
}

/** Progress from the current badge to the next one, 0 to 1. */
export function getBadgeProgress(days: number): number {
  const next = getNextBadge(days);
  if (next === null) return 1;
  const from = getCurrentBadge(days)?.days ?? 0;
  const span = next.days - from;
  if (span <= 0) return 1;
  return Math.min(1, Math.max(0, (Math.max(0, days) - from) / span));
}

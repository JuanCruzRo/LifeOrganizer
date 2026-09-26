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

/**
 * Current streak from the task list itself, so every plan can see it without
 * calling the Pro-only stats endpoint. Counts back from today while each day
 * has at least one completed task; a day with nothing ends the run.
 */
export function getStreakFromCompletions(completedAt: (string | undefined)[]): number {
  const days = new Set(
    completedAt
      .filter((value): value is string => typeof value === "string" && value.length > 0)
      .map((value) => new Date(value).toISOString().slice(0, 10))
  );
  if (days.size === 0) return 0;

  const cursor = new Date();
  let streak = 0;
  // Today not being done yet must not break a run that is still alive.
  if (!days.has(cursor.toISOString().slice(0, 10))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(cursor.toISOString().slice(0, 10))) return 0;
  }

  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

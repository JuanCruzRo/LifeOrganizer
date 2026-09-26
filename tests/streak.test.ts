import { describe, expect, it } from "vitest";
import {
  getBadgeProgress,
  getCurrentBadge,
  getDaysToNextBadge,
  getEarnedBadges,
  getNextBadge,
  STREAK_BADGES
} from "@/lib/streak";

describe("STREAK_BADGES", () => {
  it("is strictly increasing in both days and level", () => {
    for (let i = 1; i < STREAK_BADGES.length; i++) {
      expect(STREAK_BADGES[i].days).toBeGreaterThan(STREAK_BADGES[i - 1].days);
      expect(STREAK_BADGES[i].level).toBe(STREAK_BADGES[i - 1].level + 1);
    }
  });
});

describe("getEarnedBadges", () => {
  it("gives nothing before the first day", () => {
    expect(getEarnedBadges(0)).toEqual([]);
    expect(getEarnedBadges(-5)).toEqual([]);
  });

  it("unlocks exactly on the milestone day", () => {
    for (const badge of STREAK_BADGES) {
      expect(getEarnedBadges(badge.days - 1).some((b) => b.level === badge.level)).toBe(false);
      expect(getEarnedBadges(badge.days).some((b) => b.level === badge.level)).toBe(true);
    }
  });

  it("never loses a badge as the streak grows", () => {
    let previous = 0;
    for (let d = 0; d <= 400; d++) {
      const count = getEarnedBadges(d).length;
      expect(count).toBeGreaterThanOrEqual(previous);
      previous = count;
    }
  });
});

describe("getCurrentBadge / getNextBadge", () => {
  it("has no current badge and a first next badge at zero", () => {
    expect(getCurrentBadge(0)).toBeNull();
    expect(getNextBadge(0)?.days).toBe(1);
  });

  it("points at the following milestone mid-run", () => {
    expect(getCurrentBadge(10)?.days).toBe(7);
    expect(getNextBadge(10)?.days).toBe(14);
  });

  it("has no next badge once the last one is unlocked", () => {
    const last = STREAK_BADGES[STREAK_BADGES.length - 1];
    expect(getNextBadge(last.days)).toBeNull();
    expect(getDaysToNextBadge(last.days)).toBeNull();
    expect(getBadgeProgress(last.days)).toBe(1);
  });
});

describe("getDaysToNextBadge", () => {
  it("counts the days that are actually missing", () => {
    expect(getDaysToNextBadge(0)).toBe(1);
    expect(getDaysToNextBadge(8)).toBe(6);
    expect(getDaysToNextBadge(49)).toBe(1);
  });
});

describe("getBadgeProgress", () => {
  it("stays within 0 and 1 for any streak length", () => {
    for (let d = -5; d <= 400; d++) {
      const p = getBadgeProgress(d);
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(1);
    }
  });

  it("restarts at each milestone and grows inside the span", () => {
    expect(getBadgeProgress(7)).toBe(0);
    expect(getBadgeProgress(10)).toBeGreaterThan(0);
    expect(getBadgeProgress(13)).toBeLessThan(1);
  });
});

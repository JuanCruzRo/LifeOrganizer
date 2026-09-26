import { describe, expect, it } from "vitest";
import { formatDueDate, getDaysUntilDueDate, getDueDateLabel, getTodayDateValue } from "@/lib/task-date";

function dateIn(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

describe("getDaysUntilDueDate", () => {
  it("counts today as 0 and handles past and future", () => {
    expect(getDaysUntilDueDate(dateIn(0))).toBe(0);
    expect(getDaysUntilDueDate(dateIn(3))).toBe(3);
    expect(getDaysUntilDueDate(dateIn(-2))).toBe(-2);
  });

  it("does not drift across a daylight-saving boundary", () => {
    // Rounding (not flooring) keeps 23h and 25h days at whole numbers.
    for (let i = 1; i <= 60; i++) {
      expect(getDaysUntilDueDate(dateIn(i))).toBe(i);
    }
  });
});

describe("getDueDateLabel", () => {
  it("uses the Spanish wording for past, today and tomorrow", () => {
    expect(getDueDateLabel(dateIn(-1), "es")).toBe("vencida");
    expect(getDueDateLabel(dateIn(0), "es")).toBe("vence hoy");
    expect(getDueDateLabel(dateIn(1), "es")).toBe("vence mañana");
  });

  it("returns a non-empty label in every supported language", () => {
    for (const lang of ["en", "es", "pt", "fr", "de", "it", "zh", "ja", "ko", "ru", "tr", "nl", "pl"] as const) {
      expect(getDueDateLabel(dateIn(2), lang).length).toBeGreaterThan(0);
    }
  });
});

describe("formatDueDate", () => {
  it("formats a date without shifting the day", () => {
    expect(formatDueDate("2026-01-15", "es")).toContain("15");
    expect(formatDueDate("2026-01-15", "en")).toContain("15");
  });
});

describe("getTodayDateValue", () => {
  it("returns an ISO day usable by <input type=date>", () => {
    expect(getTodayDateValue()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

import { describe, expect, it } from "vitest";
import { isValidSteps, MAX_STEPS_PER_TASK, normalizeSteps } from "@/lib/task-steps";

const ok = { id: "1", text: "Open the file", done: false };

describe("isValidSteps", () => {
  it("accepts an empty list and a well-formed list", () => {
    expect(isValidSteps([])).toBe(true);
    expect(isValidSteps([ok, { id: "2", text: "Write the title", done: true }])).toBe(true);
  });

  it("rejects anything that is not an array", () => {
    for (const value of [null, undefined, "steps", 3, {}]) {
      expect(isValidSteps(value)).toBe(false);
    }
  });

  it("rejects malformed entries", () => {
    expect(isValidSteps([{ id: "1", text: "x" }])).toBe(false);
    expect(isValidSteps([{ id: "", text: "x", done: false }])).toBe(false);
    expect(isValidSteps([{ id: "1", text: "", done: false }])).toBe(false);
    expect(isValidSteps([{ id: 1, text: "x", done: false }])).toBe(false);
    expect(isValidSteps([{ id: "1", text: "x", done: "yes" }])).toBe(false);
  });

  it("rejects text beyond the limit and lists beyond the cap", () => {
    expect(isValidSteps([{ id: "1", text: "x".repeat(301), done: false }])).toBe(false);
    expect(isValidSteps(Array.from({ length: MAX_STEPS_PER_TASK + 1 }, (_, i) => ({ ...ok, id: String(i) })))).toBe(false);
  });
});

describe("normalizeSteps", () => {
  it("returns an empty list for junk instead of throwing", () => {
    for (const value of [null, undefined, "steps", 7, { id: "1" }]) {
      expect(normalizeSteps(value)).toEqual([]);
    }
  });

  it("drops malformed entries but keeps the good ones", () => {
    expect(normalizeSteps([ok, { id: "2" }, null, "x"])).toEqual([ok]);
  });

  it("caps an oversized list instead of rejecting it", () => {
    const many = Array.from({ length: 50 }, (_, i) => ({ ...ok, id: String(i) }));
    expect(normalizeSteps(many)).toHaveLength(MAX_STEPS_PER_TASK);
  });
});

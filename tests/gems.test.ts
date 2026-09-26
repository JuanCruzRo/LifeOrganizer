import { describe, expect, it } from "vitest";
import { GEMS, GEM_SHAPES, getGem } from "@/lib/gems";
import { STREAK_BADGES } from "@/lib/streak";
import { streakCopy } from "@/lib/focus-copy";
import { supportedLanguages } from "@/lib/i18n";

describe("gems and streak badges", () => {
  it("describe the same ladder", () => {
    expect(GEMS.map((g) => g.days)).toEqual(STREAK_BADGES.map((b) => b.days));
    expect(GEMS.map((g) => g.level)).toEqual(STREAK_BADGES.map((b) => b.level));
  });

  it("increase in days and level without gaps", () => {
    for (let i = 1; i < GEMS.length; i++) {
      expect(GEMS[i].days).toBeGreaterThan(GEMS[i - 1].days);
      expect(GEMS[i].level).toBe(GEMS[i - 1].level + 1);
    }
  });

  it("has a drawable shape for every gem", () => {
    for (const gem of GEMS) {
      const shape = GEM_SHAPES[gem.cut];
      expect(shape, `missing shape for ${gem.cut}`).toBeDefined();
      expect(shape.body.length).toBeGreaterThan(10);
      expect(shape.facets.length).toBeGreaterThan(0);
    }
  });

  it("uses a distinct cut for each gem, so they are told apart by shape", () => {
    expect(new Set(GEMS.map((g) => g.cut)).size).toBe(GEMS.length);
  });

  it("is reachable by level", () => {
    for (const gem of GEMS) expect(getGem(gem.level)).toBe(gem);
    expect(getGem(0)).toBeUndefined();
    expect(getGem(GEMS.length + 1)).toBeUndefined();
  });
});

describe("gem names", () => {
  it("has one name per gem in every language", () => {
    for (const lang of supportedLanguages) {
      const names = streakCopy[lang].names;
      expect(names, `missing names for ${lang}`).toHaveLength(GEMS.length);
      expect(names.every((n) => n.trim().length > 0)).toBe(true);
      expect(new Set(names).size).toBe(GEMS.length);
    }
  });
});

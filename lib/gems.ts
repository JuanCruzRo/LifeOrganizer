/**
 * One gem per streak milestone. Each gem has its own cut (the shape) and its
 * own hue, so a collection reads as distinct pieces rather than eight copies.
 * Shape carries identity; colour carries progression.
 */
export type GemCut = "round" | "pear" | "oval" | "emerald" | "marquise" | "trillion" | "hexagon" | "brilliant";

export type Gem = {
  level: number;
  days: number;
  cut: GemCut;
  /** Base hue and a lighter face, for the lit facets. */
  hue: string;
  face: string;
};

export const GEMS: Gem[] = [
  { level: 1, days: 1,   cut: "round",    hue: "#9aa6b2", face: "#d6dde4" },
  { level: 2, days: 3,   cut: "pear",     hue: "#4ec9a8", face: "#b6f0e0" },
  { level: 3, days: 7,   cut: "oval",     hue: "#00d6ab", face: "#9df5e0" },
  { level: 4, days: 14,  cut: "emerald",  hue: "#12b886", face: "#8fe8c8" },
  { level: 5, days: 30,  cut: "marquise", hue: "#3b9ae1", face: "#a9d7f7" },
  { level: 6, days: 50,  cut: "trillion", hue: "#8b6ff0", face: "#cdbdff" },
  { level: 7, days: 100, cut: "hexagon",  hue: "#e8643c", face: "#ffc0a6" },
  { level: 8, days: 365, cut: "brilliant", hue: "#f2c14e", face: "#fff0c2" }
];

/** Outline plus the facets that catch the light, drawn in a 0 0 40 40 box. */
export const GEM_SHAPES: Record<GemCut, { body: string; facets: string[] }> = {
  round: {
    body: "M20 4 L30 8 L36 18 L32 30 L20 36 L8 30 L4 18 L10 8 Z",
    facets: ["M20 4 L30 8 L20 19 Z", "M20 4 L10 8 L20 19 Z", "M20 19 L32 30 L20 36 Z", "M20 19 L8 30 L20 36 Z"]
  },
  pear: {
    body: "M20 4 L31 20 L20 36 L9 20 Z",
    facets: ["M20 4 L31 20 L20 20 Z", "M20 20 L31 20 L20 36 Z"]
  },
  oval: {
    body: "M20 3 C28 3 31 11 31 20 C31 29 28 37 20 37 C12 37 9 29 9 20 C9 11 12 3 20 3 Z",
    facets: ["M20 3 C28 3 31 11 31 20 L24 20 C24 12 23 6 20 3 Z", "M20 37 C12 37 9 29 9 20 L16 20 C16 28 17 34 20 37 Z"]
  },
  emerald: {
    body: "M13 5 L27 5 L34 12 L34 28 L27 35 L13 35 L6 28 L6 12 Z",
    facets: ["M13 5 L27 5 L30 11 L10 11 Z", "M10 11 L30 11 L30 29 L10 29 Z"]
  },
  marquise: {
    body: "M20 3 C27 10 30 15 30 20 C30 25 27 30 20 37 C13 30 10 25 10 20 C10 15 13 10 20 3 Z",
    facets: ["M20 3 C27 10 30 15 30 20 L20 20 Z", "M20 20 L30 20 C30 25 27 30 20 37 Z"]
  },
  trillion: {
    body: "M20 5 L34 30 L6 30 Z",
    facets: ["M20 5 L34 30 L20 30 Z", "M20 5 L20 30 L6 30 Z"]
  },
  hexagon: {
    body: "M20 4 L33 12 L33 28 L20 36 L7 28 L7 12 Z",
    facets: ["M20 4 L33 12 L20 20 Z", "M20 4 L7 12 L20 20 Z", "M20 20 L33 28 L20 36 Z"]
  },
  brilliant: {
    body: "M20 3 L30 10 L36 20 L20 37 L4 20 L10 10 Z",
    facets: ["M20 3 L30 10 L20 16 Z", "M20 3 L10 10 L20 16 Z", "M20 16 L36 20 L20 37 Z", "M20 16 L4 20 L20 37 Z"]
  }
};

export function getGem(level: number): Gem | undefined {
  return GEMS.find((g) => g.level === level);
}

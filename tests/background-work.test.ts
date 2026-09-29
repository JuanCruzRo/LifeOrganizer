import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { describe, expect, it } from "vitest";

/**
 * Work that outlives the response.
 *
 * On Vercel, once a response is sent the function instance is frozen and
 * anything still pending is killed mid-flight. That is invisible in
 * development — the promise still resolves because the process stays alive —
 * and in production it means the work simply never finishes. No error, no log,
 * just a feature that quietly stopped working.
 *
 * `after()` from `next/server` is the platform's promise that the work runs to
 * completion after the response is out. These tests fail the build if a bare
 * `void` creeps back into a server route.
 */

function apiRoutes(): string[] {
  return execSync("git ls-files 'app/api/**/route.ts'", { encoding: "utf8" })
    .split("\n")
    .filter(Boolean);
}

describe("background work after the response", () => {
  it("finds the API routes to check", () => {
    expect(apiRoutes().length).toBeGreaterThan(0);
  });

  it("never leaves work running on a bare `void` in an API route", () => {
    const offenders: string[] = [];

    for (const route of apiRoutes()) {
      const source = readFileSync(route, "utf8");
      // `void` at the start of a statement, not `=> void`, not `void 0`.
      const fireAndForget = source.match(/^\s*void\s+[A-Za-z_(]/gm) ?? [];
      for (const line of fireAndForget) {
        offenders.push(`${route}: ${line.trim()}`);
      }
    }

    expect(
      offenders,
      `background work started with \`void\` dies when the response is sent — use after():\n${offenders.join("\n")}`
    ).toEqual([]);
  });

  it("keeps the memory refresh inside after()", () => {
    const source = readFileSync("app/api/milo/chat/route.ts", "utf8");
    expect(source).toMatch(/import\s*\{[^}]*\bafter\b[^}]*\}\s*from\s*["']next\/server["']/);
    expect(source).toMatch(/after\(\(\)\s*=>\s*[\s\S]*?updateMemoryInBackground/);
  });
});

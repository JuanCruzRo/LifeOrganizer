import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { describe, expect, it } from "vitest";

/**
 * Guardrails for "every user has their own corner": these read the source and
 * fail if a query or a cache stops being scoped to one account.
 */

function read(path: string) {
  return readFileSync(path, "utf8");
}

function apiRoutes(): string[] {
  return execSync("git ls-files 'app/api/**/route.ts'", { encoding: "utf8" })
    .split("\n")
    .filter(Boolean);
}

describe("database access", () => {
  it("scopes every task query to the owner", () => {
    const storage = read("lib/storage.ts");
    // Every statement that reads or changes tasks must carry user_id.
    const statements = storage.match(/sql`[\s\S]*?`/g) ?? [];
    const taskStatements = statements.filter((s) => /\btasks\b/i.test(s));
    expect(taskStatements.length).toBeGreaterThan(0);
    for (const statement of taskStatements) {
      expect(statement, `unscoped task query:\n${statement}`).toMatch(/user_id/);
    }
  });

  it("keeps per-user tables keyed by user_id", () => {
    for (const path of ["lib/user-memory.ts", "lib/usage-limits.ts"]) {
      const statements = read(path).match(/sql`[\s\S]*?`/g) ?? [];
      expect(statements.length).toBeGreaterThan(0);
      for (const statement of statements) {
        expect(statement, `unscoped query in ${path}:\n${statement}`).toMatch(/user_id/);
      }
    }
  });
});

describe("API routes", () => {
  it("require an authenticated user, except the signed payment webhook", () => {
    for (const route of apiRoutes()) {
      const source = read(route);
      const guarded =
        /requireAuth(WithEmail)?\s*\(/.test(source) ||
        /WebhookSignatureValidator/.test(source);
      expect(guarded, `${route} has no identity check`).toBe(true);
    }
  });
});

describe("server-side AI caches", () => {
  it("include the user in the cache key", () => {
    // These Maps live in the server process and are shared by every request.
    for (const [path, builder] of [
      ["app/api/ai-priority/route.ts", "buildRecommendationCacheKey"],
      ["app/api/ai-task-help/route.ts", "buildTaskHelpCacheKey"]
    ] as const) {
      const source = read(path);
      const fn = source.slice(source.indexOf(`function ${builder}`));
      const body = fn.slice(0, fn.indexOf("\n}"));
      expect(body, `${builder} is not scoped per user`).toMatch(/userId/);
    }
  });
});

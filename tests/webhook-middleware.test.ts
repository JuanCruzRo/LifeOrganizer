import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Clerk's middleware re-reads the body of a request it does not treat as a
 * signed-in browser. For the payment webhook that rewrites the bytes, and the
 * provider's signature is computed over the bytes it sent — so every delivery
 * hashed something the sender never hashed and came back as forged. Real
 * payments were taken and rejected.
 *
 * Excluding the route is one entry in a matcher, which is exactly the kind of
 * thing someone tidies away later, so the actual matching behaviour is pinned
 * here rather than the spelling.
 */

const source = readFileSync("middleware.ts", "utf8");

/** The matcher strings, as Next.js compiles them. */
function matchers(): RegExp[] {
  const block = source.slice(source.indexOf("matcher"));
  const literals = [...block.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) => m[0]);
  expect(literals.length, "no matcher found in middleware.ts").toBeGreaterThan(0);
  // The file holds TypeScript string literals, so "\\." is one escaped dot.
  // Compiling the raw text instead would ask for a literal backslash before
  // every dot and quietly stop matching the static-file exclusions at all.
  return literals.map((literal) => new RegExp(`^${JSON.parse(literal)}$`));
}

const runs = (path: string) => matchers().some((re) => re.test(path));

describe("middleware matcher", () => {
  it("does not run over the payment webhook", () => {
    expect(runs("/api/subscriptions/webhook")).toBe(false);
  });

  it("still runs over the rest of the subscription API", () => {
    // Excluding the webhook must not quietly take auth() away from the routes
    // that depend on it.
    for (const path of ["/api/subscriptions/me", "/api/subscriptions/checkout", "/api/subscriptions/trial"]) {
      expect(runs(path), path).toBe(true);
    }
  });

  it("still runs over the app's own API and pages", () => {
    for (const path of ["/api/tasks", "/api/milo/chat", "/app", "/sign-in", "/"]) {
      expect(runs(path), path).toBe(true);
    }
  });

  it("keeps skipping Next.js internals and static files", () => {
    for (const path of ["/_next/static/chunks/main.js", "/icon-192.png", "/sw.js"]) {
      expect(runs(path), path).toBe(false);
    }
  });
});

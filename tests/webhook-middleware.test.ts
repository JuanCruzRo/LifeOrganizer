import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Clerk's middleware re-reads the body of a request it does not treat as a
 * signed-in browser. For the payment webhook that rewrites the bytes, and the
 * provider's signature is computed over the bytes it sent — so every delivery
 * hashed something the sender never hashed and came back as forged. Real
 * payments were taken and rejected.
 *
 * Excluding the route is one line in a matcher, which is exactly the kind of
 * thing someone tidies away later, so it is pinned here.
 */

const read = (path: string) => readFileSync(path, "utf8");

describe("middleware matcher", () => {
  const source = read("middleware.ts");

  it("excludes the payment webhook from Clerk's middleware", () => {
    expect(source).toMatch(/matcher/);
    // One guard per pattern, otherwise the other one still runs the middleware
    // over the webhook.
    const exclusions = source.match(/api\/subscriptions\/webhook/g) ?? [];
    expect(exclusions.length, "the webhook path must be excluded in both patterns").toBeGreaterThanOrEqual(3);
  });

  it("keeps the middleware on the rest of the API", () => {
    expect(source).toMatch(/\(\?:api\|trpc\)/);
  });
});

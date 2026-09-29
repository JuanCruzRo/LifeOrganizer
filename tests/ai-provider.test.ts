import { describe, expect, it, vi } from "vitest";
import { CircuitBreaker, DEFAULT_BREAKER_CONFIG } from "@/lib/ai/circuit-breaker";

const FIVE_MINUTES = 5 * 60_000;
const TWO_MINUTES = 2 * 60_000;
import {
  classifyFailure,
  parseRetryAfterHint,
  ProviderError,
  rateLimitScope
} from "@/lib/ai/types";

/**
 * These tests cover the part of the provider layer that decides whether a user
 * gets an answer: which failure is which, when a provider is quarantined, and
 * how long it stays out. None of it touches the network — the point is that the
 * decisions which decide between "an answer" and "an error" are checkable
 * without spending anyone's quota.
 */

/** A clock the breaker reads, so cooldowns can be expired on demand. */
function fakeClock(start = 1_000_000) {
  let now = start;
  return {
    now: () => now,
    advance(ms: number) {
      now += ms;
    }
  };
}

/**
 * How long the breaker says to wait. Read from the breaker rather than
 * recomputed, so a change to the backoff policy does not silently make these
 * tests assert a cooldown that no longer happens.
 */
function retryInMs(breaker: CircuitBreaker, provider: string): number {
  const health = breaker.snapshot().find((entry) => entry.provider === provider);
  if (!health) throw new Error(`no health recorded for "${provider}"`);
  return health.retryInMs;
}

describe("rateLimitScope", () => {
  it("tells a daily ceiling from a per-minute one", () => {
    // Both are 429s and both say "Rate limit reached". Only the scope differs,
    // and it changes the cooldown by two orders of magnitude.
    const daily =
      "Rate limit reached for model openai/gpt-oss-120b on tokens per day (TPD): Limit 200000, Requested 1234.";
    const perMinute =
      "Rate limit reached for model qwen/qwen3.8-27b on tokens per minute (TPM): Limit 12000, Requested 1500.";

    expect(rateLimitScope(daily)).toBe("per_day");
    expect(rateLimitScope(perMinute)).toBe("per_minute");
  });

  it("reads the per-minute wording in Groq's other formats", () => {
    expect(rateLimitScope("Rate limit reached ... on requests per minute (RPM): Limit 30")).toBe(
      "per_minute"
    );
    expect(rateLimitScope("Rate limit reached ... on requests per day (RPD): Limit 1000")).toBe(
      "per_day"
    );
  });

  it("admits when it cannot tell", () => {
    // Guessing "per_minute" would mean retrying into a budget that is gone for
    // the day, so an unreadable 429 gets the long wait.
    expect(rateLimitScope("429 Too Many Requests")).toBe("unknown");
    expect(rateLimitScope(undefined)).toBe("unknown");
  });
});

describe("classifyFailure", () => {
  it("reads a daily-budget overrun as a capacity problem", () => {
    // The exact shape Groq returns when the 200k/day ceiling is reached. This
    // is the failure that motivated the whole chain, so it is pinned literally.
    expect(
      classifyFailure({
        status: 429,
        message:
          "Rate limit reached for model openai/gpt-oss-120b on tokens per day (TPD): Limit 200000, Requested 1234."
      })
    ).toBe("rate_limited");
  });

  it("reads a per-minute throttle as the same kind of problem", () => {
    expect(classifyFailure({ status: 429 })).toBe("rate_limited");
  });

  it("reads a missing or wrong key as auth", () => {
    expect(classifyFailure({ status: 401 })).toBe("auth");
    expect(classifyFailure({ status: 403 })).toBe("auth");
  });

  it("reads a bad model name as bad_request, not as an unhealthy provider", () => {
    // Quarantining Groq because we typo'd a model name would take the only
    // working provider out of rotation over our own bug.
    expect(classifyFailure({ status: 404, message: "model not found" })).toBe("bad_request");
    expect(classifyFailure({ status: 400 })).toBe("bad_request");
  });

  it("reads a dead socket as a network failure", () => {
    // undici has no status on a dead socket, and reports it as a TypeError.
    expect(classifyFailure({ name: "TypeError", message: "fetch failed" })).toBe("network");
  });

  it("reads an aborted request as a timeout", () => {
    expect(classifyFailure({ name: "TimeoutError" })).toBe("timeout");
    expect(classifyFailure({ name: "AbortError" })).toBe("timeout");
    expect(classifyFailure({ status: 408 })).toBe("timeout");
  });

  it("reads a 5xx as a server failure", () => {
    expect(classifyFailure({ status: 500 })).toBe("server");
    expect(classifyFailure({ status: 503 })).toBe("server");
  });

  it("falls back to the message when there is no status", () => {
    expect(classifyFailure({ message: "insufficient_quota for this project" })).toBe("rate_limited");
    expect(classifyFailure({ message: "Incorrect API key provided" })).toBe("auth");
  });
});

describe("parseRetryAfterHint", () => {
  it("reads Groq's human estimate", () => {
    const ms = parseRetryAfterHint("Rate limit reached. Please try again in 9m6.48s");
    expect(ms).toBe(9 * 60_000 + 6480);
  });

  it("reads a seconds-based Retry-After style hint", () => {
    expect(parseRetryAfterHint('retry-after: 30')).toBe(30_000);
    expect(parseRetryAfterHint("Please try again in 45s")).toBe(45_000);
  });

  it("reads an hours-style hint", () => {
    expect(parseRetryAfterHint("try again in 1h5m")).toBe(65 * 60_000);
  });

  it("returns nothing rather than a wrong number", () => {
    // A bogus hint fed into the cooldown would quarantine a healthy provider.
    expect(parseRetryAfterHint("something went wrong")).toBeUndefined();
    expect(parseRetryAfterHint(undefined)).toBeUndefined();
  });
});

describe("CircuitBreaker", () => {
  it("lets traffic through while closed", () => {
    const breaker = new CircuitBreaker(undefined, fakeClock().now);
    expect(breaker.acquire("groq")).toBe("closed");
  });

  it("takes a provider out only after the configured number of failures", () => {
    const clock = fakeClock();
    const breaker = new CircuitBreaker(undefined, clock.now);

    breaker.recordFailure("groq", "rate_limited");
    // One failure is not a pattern; a single blip must not cost availability.
    expect(breaker.acquire("groq")).toBe("closed");

    breaker.recordFailure("groq", "rate_limited");
    expect(breaker.acquire("groq")).toBe("open");
  });

  it("resets the failure count on success", () => {
    const clock = fakeClock();
    const breaker = new CircuitBreaker(undefined, clock.now);

    breaker.recordFailure("groq", "rate_limited");
    breaker.recordSuccess("groq");
    breaker.recordFailure("groq", "rate_limited");

    // The streak restarted, so this is failure one again, not failure two.
    expect(breaker.acquire("groq")).toBe("closed");
  });

  it("ignores failures that are not the provider's fault", () => {
    const clock = fakeClock();
    const breaker = new CircuitBreaker(undefined, clock.now);

    // A misnamed model is our bug. Quarantining the provider would remove the
    // only working one from rotation and keep the app broken for longer.
    breaker.recordFailure("groq", "bad_request");
    breaker.recordFailure("groq", "bad_request");
    breaker.recordFailure("groq", "bad_request");

    expect(breaker.acquire("groq")).toBe("closed");
  });

  it("quarantines a bad key immediately", () => {
    const clock = fakeClock();
    const breaker = new CircuitBreaker(undefined, clock.now);

    // A revoked key will never start working on its own, so there is no reason
    // to spend the threshold's worth of requests discovering that.
    breaker.recordFailure("ollama", "auth");
    expect(breaker.acquire("ollama")).toBe("open");
  });

  it("does not quarantine a provider over two slow replies", () => {
    // This exact shape broke a full eval run: gpt-oss-120b legitimately takes
    // five seconds, two consecutive slow replies quarantined the only
    // configured provider for thirty seconds, and 68 tests failed in eighteen.
    // A slow reply is a slow reply, not an outage.
    const clock = fakeClock();
    const breaker = new CircuitBreaker(undefined, clock.now);

    breaker.recordFailure("groq", "timeout");
    breaker.recordFailure("groq", "timeout");

    expect(breaker.acquire("groq")).toBe("closed");
  });

  it("does quarantine a provider that keeps timing out", () => {
    const clock = fakeClock();
    const breaker = new CircuitBreaker(undefined, clock.now);

    for (let i = 0; i < 4; i += 1) breaker.recordFailure("groq", "timeout");
    expect(breaker.acquire("groq")).toBe("open");
  });

  it("waits seconds for a per-minute throttle and minutes for a daily one", () => {
    // Both arrive as a bare 429. Groq enforces tokens-per-minute,
    // requests-per-minute, tokens-per-day and requests-per-day separately, and
    // calls all of them "Rate limit reached", but one clears in seconds and the
    // other does not clear until the window resets.
    const perMinute = new CircuitBreaker(undefined, fakeClock().now);
    const perDay = new CircuitBreaker(undefined, fakeClock().now);

    for (const breaker of [perMinute, perDay]) {
      for (let i = 0; i < 2; i += 1) {
        breaker.recordFailure("p", "rate_limited", undefined, breaker === perMinute ? "per_minute" : "per_day");
      }
    }

    const minuteWait = perMinute.snapshot()[0].retryInMs;
    const dayWait = perDay.snapshot()[0].retryInMs;

    expect(minuteWait).toBeLessThan(TWO_MINUTES);
    expect(dayWait).toBeGreaterThanOrEqual(FIVE_MINUTES);
  });

  it("holds a rate-limited provider longer than the provider's own estimate", () => {
    const clock = fakeClock();
    const breaker = new CircuitBreaker(undefined, clock.now);

    for (let i = 0; i < DEFAULT_BREAKER_CONFIG.threshold; i += 1) {
      breaker.recordFailure("groq", "rate_limited", 9 * 60_000 + 6480);
    }

    const health = breaker.snapshot().find((p) => p.provider === "groq");
    // Groq's "9 minutes" is derived from the current burn rate. A tokens-per-day
    // limit resets on a fixed boundary, so coming back that early would just
    // collect another 429 and another wasted round trip.
    expect(health?.retryInMs).toBeGreaterThan(9 * 60_000);
  });

  it("never waits longer than the configured cap", () => {
    const clock = fakeClock();
    const breaker = new CircuitBreaker(undefined, clock.now);

    // A provider asking for an hour does not get an hour of downtime.
    for (let i = 0; i < 20; i += 1) {
      breaker.recordFailure("groq", "rate_limited", 60 * 60_000);
    }

    const health = breaker.snapshot().find((p) => p.provider === "groq");
    expect(health?.retryInMs).toBeLessThanOrEqual(DEFAULT_BREAKER_CONFIG.maxCooldownMs);
  });

  it("admits exactly one probe after the cooldown, not a flood", () => {
    const clock = fakeClock();
    const breaker = new CircuitBreaker(undefined, clock.now);

    for (let i = 0; i < DEFAULT_BREAKER_CONFIG.threshold; i += 1) {
      breaker.recordFailure("groq", "rate_limited");
    }
    expect(breaker.acquire("groq")).toBe("open");

    clock.advance(retryInMs(breaker, "groq") + 1);

    expect(breaker.acquire("groq")).toBe("half-open");
    // Everyone else keeps getting the "open" answer while the probe is out.
    expect(breaker.acquire("groq")).toBe("open");
  });

  it("closes for good when the probe succeeds", () => {
    const clock = fakeClock();
    const breaker = new CircuitBreaker(undefined, clock.now);

    for (let i = 0; i < DEFAULT_BREAKER_CONFIG.threshold; i += 1) {
      breaker.recordFailure("groq", "rate_limited");
    }
    clock.advance(retryInMs(breaker, "groq") + 1);

    expect(breaker.acquire("groq")).toBe("half-open");
    breaker.recordSuccess("groq");

    const health = breaker.snapshot().find((p) => p.provider === "groq");
    expect(health?.state).toBe("closed");
    expect(health?.consecutiveFailures).toBe(0);
    // The backoff resets too, so the next outage starts from the short cooldown
    // rather than inheriting the previous one.
    expect(health?.openCount).toBe(0);
  });

  it("grows the cooldown when the probe fails", () => {
    const clock = fakeClock();
    const breaker = new CircuitBreaker(undefined, clock.now);

    for (let i = 0; i < DEFAULT_BREAKER_CONFIG.threshold; i += 1) {
      breaker.recordFailure("groq", "rate_limited");
    }
    clock.advance(retryInMs(breaker, "groq") + 1);
    breaker.acquire("groq");
    breaker.recordFailure("groq", "rate_limited");

    const firstCooldown = retryInMs(breaker, "groq");
    expect(firstCooldown).toBeGreaterThan(DEFAULT_BREAKER_CONFIG.baseCooldownMs);
  });

  it("tracks each provider separately", () => {
    const clock = fakeClock();
    const breaker = new CircuitBreaker(undefined, clock.now);

    for (let i = 0; i < DEFAULT_BREAKER_CONFIG.threshold; i += 1) {
      breaker.recordFailure("groq", "rate_limited");
    }

    // The whole reason for a chain: one dead provider must not be a dead app.
    expect(breaker.acquire("groq")).toBe("open");
    expect(breaker.acquire("ollama")).toBe("closed");
  });

  it("releases a probe that never reported an outcome", () => {
    const clock = fakeClock();
    const breaker = new CircuitBreaker(undefined, clock.now);

    const timeoutPolicy = DEFAULT_BREAKER_CONFIG.perFailure!.timeout!;
    for (let i = 0; i < timeoutPolicy.threshold; i += 1) {
      breaker.recordFailure("groq", "timeout");
    }
    clock.advance(retryInMs(breaker, "groq") + 1);

    expect(breaker.acquire("groq")).toBe("half-open");
    // A thrown error outside the breaker path must not strand the slot, or the
    // provider would stay locked out forever after a single ambiguous attempt.
    breaker.releaseProbe("groq");
    expect(breaker.acquire("groq")).toBe("half-open");
  });

  it("reports health for operations", () => {
    const clock = fakeClock();
    const breaker = new CircuitBreaker(undefined, clock.now);

    breaker.recordSuccess("ollama");
    breaker.recordFailure("groq", "auth");

    const health = breaker.snapshot();
    expect(health.find((p) => p.provider === "ollama")).toMatchObject({
      state: "closed",
      successes: 1
    });
    expect(health.find((p) => p.provider === "groq")).toMatchObject({
      state: "open",
      lastFailureKind: "auth"
    });
  });
});

describe("ProviderError", () => {
  it("keeps the kinds of every provider that refused", () => {
    // The route has to choose between "Milo está ocupado" and a generic error
    // using this list, so the information cannot live only in the message.
    const error = new ProviderError("Todos los proveedores fallaron", {
      provider: "chain",
      kind: "rate_limited",
      kinds: ["rate_limited", "rate_limited"]
    });

    expect(error.kinds).toEqual(["rate_limited", "rate_limited"]);
  });
});

describe("provider adapters are lazily configured", () => {
  it("reports a provider with no key as unconfigured rather than throwing", async () => {
    const original = process.env.OLLAMA_API_KEY;
    delete process.env.OLLAMA_API_KEY;

    try {
      const { ollamaProvider } = await import("@/lib/ai/providers/ollama");
      // The chain filters on this before spending a round trip, so it must be a
      // cheap boolean and not an exception.
      expect(ollamaProvider.configured()).toBe(false);

      process.env.OLLAMA_API_KEY = "test-key";
      expect(ollamaProvider.configured()).toBe(true);
    } finally {
      if (original === undefined) delete process.env.OLLAMA_API_KEY;
      else process.env.OLLAMA_API_KEY = original;
    }
  });

  it("maps a 429 from an OpenAI-compatible provider onto a capacity failure", async () => {
    const original = process.env.OLLAMA_API_KEY;
    process.env.OLLAMA_API_KEY = "test-key";

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "Rate limit reached. Please try again in 60s" }), {
        status: 429
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    try {
      const { ollamaProvider } = await import("@/lib/ai/providers/ollama");
      await expect(
        ollamaProvider.complete({
          messages: [{ role: "user", content: "hola" }],
          model: "gpt-oss:20b",
          maxTokens: 100,
          temperature: 0.7,
          timeoutMs: 5000,
          tier: "fast"
        })
      ).rejects.toMatchObject({
        kind: "rate_limited",
        status: 429,
        // Carried through so the breaker does not have to re-parse the text.
        retryAfterMs: 60_000
      });
    } finally {
      vi.unstubAllGlobals();
      if (original === undefined) delete process.env.OLLAMA_API_KEY;
      else process.env.OLLAMA_API_KEY = original;
    }
  });
});

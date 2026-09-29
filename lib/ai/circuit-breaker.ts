import {
  type FailureKind,
  type RateLimitScope,
  shouldTripBreaker,
  tripsImmediately,
  type TokenUsage
} from "@/lib/ai/types";

/**
 * Per-provider quarantine with exponential backoff.
 *
 * Without this, the chain is worse than a single provider. A provider that is
 * out of budget answers 429 in about 200ms, so every chat turn would burn a
 * wasted round trip before falling through — and a client that fans out would
 * keep hammering the dead one all day. Once a provider trips, it gets skipped
 * entirely until its cooldown expires, and the one request that gets through
 * afterwards is a probe: if it fails, the cooldown grows.
 *
 * State is per JavaScript instance. On serverless that means it is best-effort:
 * warm lambdas share it, cold ones start clean. That is the right trade here —
 * a shared store would add a database round trip to the hot path to save a
 * failed HTTP call that the chain already handles.
 */

const THIRTY_SECONDS = 30_000;
const FIVE_MINUTES = 5 * 60_000;
const TEN_MINUTES = 10 * 60_000;
const TWO_MINUTES = 2 * 60_000;

/**
 * How hard to hit a provider, per kind of failure.
 *
 * The threshold and the cooldown answer different questions. The threshold asks
 * "how much evidence do I need that this provider cannot serve?", and the
 * cooldown asks "how long until it plausibly can?". A single policy for both
 * gets one of the two wrong for every failure type, and the damage is not
 * symmetric: being too eager costs a wasted request, being too slow takes a
 * working provider out of rotation while users get degraded answers.
 *
 * Two of these numbers exist because of a real incident, not theory:
 *
 *  - A timeout is weak evidence. gpt-oss-120b legitimately takes five seconds
 *    and sometimes thirty. During a full eval run, two consecutive slow
 *    responses used to quarantine the only provider for thirty seconds, which
 *    failed 68 tests in eighteen. There is no per-provider queue to protect
 *    here — the next request is just as likely to be slow — so timeouts need
 *    the highest threshold and the shortest cooldown, and mostly serve to skip
 *    ahead in the chain for that one request.
 *
 *  - A daily budget is strong evidence and needs a long wait. Groq's "try again
 *    in 9m" is derived from the current burn rate, not from when the daily
 *    window resets, so it is treated as a hint and never as permission.
 */
export type KindPolicy = {
  threshold: number;
  baseCooldownMs: number;
  maxCooldownMs: number;
};

export type BreakerConfig = {
  /** Consecutive failures before a daily or unlabelled quota is exhausted. */
  threshold: number;
  /** First cooldown after the first trip. Doubles on each subsequent trip. */
  baseCooldownMs: number;
  maxCooldownMs: number;
  /** Overrides for failures that are not an exhausted daily budget. */
  perFailure?: Partial<Record<FailureKind | "rate_limited_per_minute", KindPolicy>>;
};

export const DEFAULT_BREAKER_CONFIG: BreakerConfig = {
  threshold: 2,
  baseCooldownMs: FIVE_MINUTES,
  maxCooldownMs: TEN_MINUTES,
  perFailure: {
    // Clears in seconds once the window rolls over.
    rate_limited_per_minute: {
      threshold: 2,
      baseCooldownMs: THIRTY_SECONDS,
      maxCooldownMs: TWO_MINUTES
    },
    // One slow reply is a slow reply, not an outage.
    timeout: { threshold: 4, baseCooldownMs: THIRTY_SECONDS, maxCooldownMs: TWO_MINUTES },
    server: { threshold: 3, baseCooldownMs: THIRTY_SECONDS, maxCooldownMs: FIVE_MINUTES },
    network: { threshold: 3, baseCooldownMs: THIRTY_SECONDS, maxCooldownMs: FIVE_MINUTES }
  }
};

/** Resolve the policy that applies to one failure. */
function policyFor(
  config: BreakerConfig,
  kind: FailureKind,
  scope: RateLimitScope
): KindPolicy {
  if (kind === "rate_limited" && scope === "per_minute") {
    return (
      config.perFailure?.rate_limited_per_minute ?? {
        threshold: config.threshold,
        baseCooldownMs: config.baseCooldownMs,
        maxCooldownMs: config.maxCooldownMs
      }
    );
  }

  const override = config.perFailure?.[kind];
  if (override) return override;

  return {
    threshold: config.threshold,
    baseCooldownMs: config.baseCooldownMs,
    maxCooldownMs: config.maxCooldownMs
  };
}

type ProviderState = {
  consecutiveFailures: number;
  openUntil: number;
  /** How many times this provider has been quarantined, drives backoff. */
  openCount: number;
  /** A half-open probe is in flight; no second one may start. */
  probeInFlight: boolean;
  lastFailureKind?: FailureKind;
  lastFailureAt?: number;
  successes: number;
  failures: number;
};

export type AcquireDecision = "closed" | "half-open" | "open";

export type ProviderHealth = {
  provider: string;
  state: "closed" | "open";
  consecutiveFailures: number;
  openUntil: number | null;
  openCount: number;
  successes: number;
  failures: number;
  lastFailureKind?: FailureKind;
  /** How long until a request would be accepted again, 0 if accepting now. */
  retryInMs: number;
};

export class CircuitBreaker {
  private readonly state = new Map<string, ProviderState>();
  private readonly now: () => number;

  constructor(
    private readonly config: BreakerConfig = DEFAULT_BREAKER_CONFIG,
    now: () => number = Date.now
  ) {
    this.now = now;
  }

  /**
   * Decide whether `provider` may serve a request, reserving a probe slot when
   * the cooldown has just expired.
   */
  acquire(provider: string): AcquireDecision {
    const entry = this.state.get(provider);
    if (!entry) return "closed";

    // `openUntil === 0` is the "never quarantined" marker, not "quarantined
    // until the epoch". Without this check a provider that had one failure and
    // no trip would answer "half-open" to the first request and "open" to the
    // second — skipping a request against a provider that was never taken out
    // of rotation.
    if (entry.openUntil === 0) return "closed";

    const current = this.now();
    if (current < entry.openUntil) return "open";
    if (entry.probeInFlight) return "open";

    // Cooldown elapsed: let exactly one request through to find out whether the
    // provider recovered, instead of flooding it the moment the clock runs out.
    entry.probeInFlight = true;
    return "half-open";
  }

  recordSuccess(provider: string, _usage?: TokenUsage): void {
    const entry = this.ensure(provider);
    entry.consecutiveFailures = 0;
    entry.openUntil = 0;
    entry.openCount = 0;
    entry.probeInFlight = false;
    entry.successes += 1;
  }

  /**
   * Record a failure. `retryAfterMs` is what the provider asked for, if
   * anything; `scope` is which ceiling it hit, if it said.
   */
  recordFailure(
    provider: string,
    kind: FailureKind,
    retryAfterMs?: number,
    scope: RateLimitScope = "unknown"
  ): void {
    const entry = this.ensure(provider);
    entry.probeInFlight = false;
    entry.failures += 1;
    entry.lastFailureKind = kind;
    entry.lastFailureAt = this.now();

    if (!shouldTripBreaker(kind)) return;

    const policy = policyFor(this.config, kind, scope);

    entry.consecutiveFailures += 1;
    if (!tripsImmediately(kind) && entry.consecutiveFailures < policy.threshold) return;

    entry.openCount += 1;

    // A bad key needs an operator to add or fix an env var, so it sits out the
    // full cap rather than a 30-second cooldown that would just re-collect the
    // same 401 in front of every user.
    if (kind === "auth") {
      entry.openUntil = this.now() + policy.maxCooldownMs;
      return;
    }

    const backoff = Math.min(
      policy.baseCooldownMs * 2 ** (entry.openCount - 1),
      policy.maxCooldownMs
    );

    // A daily budget that is already spent will not have refilled in the nine
    // minutes the provider guesses at, so the provider's hint is a floor, never
    // a shortcut past our own backoff. The same applies to a per-minute window,
    // where the estimate is derived from the current burn rate.
    const cooldown = Math.min(
      Math.max(backoff, kind === "rate_limited" ? retryAfterMs ?? 0 : 0),
      policy.maxCooldownMs
    );

    entry.openUntil = this.now() + cooldown;
  }

  /** Release a probe reservation without recording an outcome. */
  releaseProbe(provider: string): void {
    const entry = this.state.get(provider);
    if (entry) entry.probeInFlight = false;
  }

  isOpen(provider: string): boolean {
    return this.acquire(provider) === "open";
  }

  snapshot(): ProviderHealth[] {
    const current = this.now();
    return [...this.state.entries()].map(([provider, entry]) => ({
      provider,
      state: current < entry.openUntil ? "open" : "closed",
      consecutiveFailures: entry.consecutiveFailures,
      openUntil: entry.openUntil || null,
      openCount: entry.openCount,
      successes: entry.successes,
      failures: entry.failures,
      lastFailureKind: entry.lastFailureKind,
      retryInMs: Math.max(0, entry.openUntil - current)
    }));
  }

  reset(): void {
    this.state.clear();
  }

  private ensure(provider: string): ProviderState {
    const existing = this.state.get(provider);
    if (existing) return existing;

    const created: ProviderState = {
      consecutiveFailures: 0,
      openUntil: 0,
      openCount: 0,
      probeInFlight: false,
      successes: 0,
      failures: 0
    };
    this.state.set(provider, created);
    return created;
  }
}

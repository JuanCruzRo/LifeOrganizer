import { describe, expect, it } from "vitest";
import { resolvePlanForStatus, resolveTrialView, type TrialRow } from "@/lib/subscription-plans";

// The webhook only ever wrote `mp_preapproval_id` through a function nobody
// called, so paying customers stayed on Free. These tests pin the plan/status
// mapping that syncSubscription relies on.

describe("resolvePlanForStatus", () => {
  it("keeps the paid plan when the subscription is authorized", () => {
    expect(resolvePlanForStatus("plus", "authorized")).toBe("plus");
    expect(resolvePlanForStatus("pro", "authorized")).toBe("pro");
  });

  it("keeps the paid plan while paused, as a grace period", () => {
    expect(resolvePlanForStatus("plus", "paused")).toBe("plus");
    expect(resolvePlanForStatus("pro", "paused")).toBe("pro");
  });

  it("downgrades to free only when cancelled", () => {
    expect(resolvePlanForStatus("plus", "cancelled")).toBe("free");
    expect(resolvePlanForStatus("pro", "cancelled")).toBe("free");
  });

  it("never escalates beyond the purchased plan", () => {
    // A cancelled Plus must not accidentally read as Pro.
    expect(resolvePlanForStatus("plus", "cancelled")).not.toBe("pro");
  });
});

describe("resolveTrialView", () => {
  const now = new Date("2026-06-15T12:00:00Z");
  const past = (days: number) => new Date(now.getTime() - days * 86_400_000);
  const future = (days: number) => new Date(now.getTime() + days * 86_400_000);

  it("keeps the plan while the trial is still running", () => {
    const row: TrialRow = { plan: "plus", trialEndsAt: future(5), mpPreapprovalId: null };
    expect(resolveTrialView(row, now)).toEqual({
      plan: "plus",
      trialAvailable: false,
      trialEnded: false
    });
  });

  it("drops to free and announces it when the trial runs out", () => {
    const row: TrialRow = { plan: "plus", trialEndsAt: past(1), mpPreapprovalId: null };
    const view = resolveTrialView(row, now);
    expect(view.plan).toBe("free");
    expect(view.trialEnded).toBe(true);
    // Already used it: a second trial is not on the table.
    expect(view.trialAvailable).toBe(false);
  });

  it("does NOT downgrade a paying Plus subscriber whose old trial date passed", () => {
    // `trial_ends_at` is never cleared on checkout, so it stays in the past
    // forever. Without the preapproval guard this paying customer read as
    // "free" fourteen days after trialling: features gone, Free badge, asked
    // to buy Plus again.
    const row: TrialRow = { plan: "plus", trialEndsAt: past(14), mpPreapprovalId: "2a8f…" };
    expect(resolveTrialView(row, now)).toEqual({
      plan: "plus",
      trialAvailable: false,
      trialEnded: false
    });
  });

  it("leaves a plain free user alone", () => {
    const row: TrialRow = { plan: "free", trialEndsAt: null, mpPreapprovalId: null };
    expect(resolveTrialView(row, now)).toEqual({
      plan: "free",
      trialAvailable: true,
      trialEnded: false
    });
  });

  it("never announces a trial for someone who never had one", () => {
    // Someone whose subscription was cancelled has plan "free" and possibly an
    // old trial date in the past. That is not a trial that just ended — it must
    // not read as "your trial ended" every time they come back.
    const row: TrialRow = { plan: "free", trialEndsAt: past(30), mpPreapprovalId: "2a8f…" };
    expect(resolveTrialView(row, now).trialEnded).toBe(false);
  });
});

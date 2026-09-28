import { describe, expect, it } from "vitest";
import { resolvePlanForStatus } from "@/lib/subscription-plans";

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

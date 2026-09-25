"use client";

import { useEffect, useState } from "react";

export type UserPlan = "free" | "plus" | "pro";

type PlanResponse = {
  plan: UserPlan;
  trialEndsAt: string | null;
};

export function useUserPlan() {
  const [plan, setPlan] = useState<UserPlan>("free");
  const [trialEndsAt, setTrialEndsAt] = useState<Date | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch("/api/subscriptions/me");
        if (!res.ok) throw new Error();
        const data = (await res.json()) as PlanResponse;
        if (!active) return;
        setPlan(data.plan);
        setTrialEndsAt(data.trialEndsAt ? new Date(data.trialEndsAt) : null);
      } catch {
        if (active) setPlan("free");
      } finally {
        if (active) setIsLoaded(true);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  const trialDaysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
    : null;

  return { plan, trialEndsAt, trialDaysLeft, isLoaded };
}

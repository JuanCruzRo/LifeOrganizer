"use client";

import { Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { UserPlan } from "@/lib/use-user-plan";

type Transition = "toPlus" | "toPro" | null;

export function PlanZapIcon({ plan }: { plan: UserPlan }) {
  const previousPlanRef = useRef<UserPlan | null>(null);
  const [transition, setTransition] = useState<Transition>(null);

  useEffect(() => {
    const prev = previousPlanRef.current;
    if (prev && prev !== plan) {
      if (prev === "free" && plan === "plus") setTransition("toPlus");
      else if (prev === "plus" && plan === "pro") setTransition("toPro");
    }
    previousPlanRef.current = plan;
  }, [plan]);

  useEffect(() => {
    if (!transition) return;
    const duration = transition === "toPro" ? 1800 : 1100;
    const timer = setTimeout(() => setTransition(null), duration);
    return () => clearTimeout(timer);
  }, [transition]);

  const showFillAnimation = transition === "toPlus";
  const isPlusOrHigher = plan === "plus" || plan === "pro";

  return (
    <span className="relative inline-flex h-3 w-3 items-center justify-center">
      {/* Base icon: hollow/gray, or solid gold for pro */}
      <Zap
        className={cn(
          "h-3 w-3",
          transition === "toPro"
            ? "animate-pulse fill-[#d4a017] text-[#d4a017]"
            : plan === "pro"
              ? "fill-[#d4a017] text-[#d4a017]"
              : "text-muted-foreground/50"
        )}
        aria-label={plan === "pro" ? "Pro" : plan === "plus" ? "Plus" : "Free"}
      />

      {/* Green fill layer for plus, animated like water rising when transitioning in */}
      {(isPlusOrHigher && plan !== "pro") || showFillAnimation ? (
        <span className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.span
            key={showFillAnimation ? "filling" : "filled"}
            className="absolute inset-0 origin-bottom"
            initial={showFillAnimation ? { scaleY: 0 } : { scaleY: 1 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          >
            <Zap className="h-3 w-3 fill-primary text-primary" />
          </motion.span>
        </span>
      ) : null}

      <AnimatePresence>
        {transition === "toPro" && (
          <>
            <motion.span
              className="pointer-events-none absolute inset-0 rounded-full bg-[#d4a017]/50"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 4, opacity: [0, 0.9, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, delay: 1, ease: "easeOut" }}
            />
            <motion.span
              className="pointer-events-none absolute -top-1 left-1/2 select-none text-base"
              style={{ originX: 0.5, originY: 0 }}
              initial={{ x: "-50%", y: -18, opacity: 0, rotate: -20 }}
              animate={{
                x: "-50%",
                y: [-18, -18, 2, -18],
                opacity: [0, 1, 1, 0],
                rotate: [-20, -20, 0, -20]
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.6, times: [0, 0.35, 0.55, 1], ease: "easeInOut" }}
            >
              👆
            </motion.span>
          </>
        )}
      </AnimatePresence>
    </span>
  );
}

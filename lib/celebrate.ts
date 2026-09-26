"use client";

/**
 * Small burst of confetti when a task or a whole checklist is completed.
 * Skipped when the user asks for reduced motion, and loaded on demand so the
 * library never lands in the initial bundle.
 */
export async function celebrate(intensity: "step" | "task" = "task") {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  try {
    const { default: confetti } = await import("canvas-confetti");
    const isTask = intensity === "task";
    confetti({
      particleCount: isTask ? 90 : 35,
      spread: isTask ? 75 : 50,
      startVelocity: isTask ? 42 : 28,
      gravity: 1.1,
      ticks: 160,
      scalar: isTask ? 1 : 0.8,
      origin: { y: 0.72 },
      colors: ["#00d6ab", "#4ce3c1", "#a7f3e4", "#ffffff"],
      disableForReducedMotion: true
    });
  } catch {
    /* the celebration is optional: never break completing a task */
  }
}

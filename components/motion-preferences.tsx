"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

// Framer Motion animations are driven by JS, so the CSS media query does not
// reach them. MotionConfig makes them respect the system setting too.
export function MotionPreferences({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

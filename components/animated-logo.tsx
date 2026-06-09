"use client";

import { useState } from "react";
import { motion } from "motion/react";

// Lucide's Zap polygon scaled ×2.5 into a 60×60 viewBox.
// Points: 13,2 → 3,14 → 12,14 → 11,22 → 21,10 → 12,10  (×2.5)
const BOLT = "M 32 5 L 8 35 L 30 35 L 28 55 L 52 25 L 30 25 Z";

type AnimatedLogoProps = {
  onComplete?: () => void;
};

export function AnimatedLogo({ onComplete }: AnimatedLogoProps) {
  const [done, setDone] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4">
      <svg viewBox="0 0 60 60" className="h-20 w-20 text-primary">
        <motion.path
          d={BOLT}
          fill="currentColor"
          style={{ transformOrigin: "30px 30px" }}
          // Scale from 0 → overshoots → settles — feels electric
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale:   [0, 1.2, 0.92, 1],
            opacity: [0, 1,   1,    1],
          }}
          transition={{
            duration: 0.55,
            times: [0, 0.42, 0.72, 1],
            ease: "easeOut",
          }}
          onAnimationComplete={() => setDone(true)}
        />
      </svg>

      {done && (
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          onAnimationComplete={onComplete}
        >
          <h1 className="text-2xl font-semibold tracking-tight">Spark</h1>
        </motion.div>
      )}
    </div>
  );
}

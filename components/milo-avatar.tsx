"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { miloFace, type MiloFace } from "@/lib/milo-face";
import { cn } from "@/lib/utils";

/**
 * Milo's face, cross-fading whenever the expression changes so the switch
 * reads as the same character reacting, not as a swapped image.
 */
export function MiloAvatar({
  face,
  size,
  className,
  alt = ""
}: {
  face: MiloFace;
  size: number;
  className?: string;
  alt?: string;
}) {
  return (
    <span
      className={cn("relative inline-block flex-shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={face}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.88 }}
          transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        >
          <Image src={miloFace(face)} alt={alt} width={size} height={size} className="h-full w-full object-contain" />
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

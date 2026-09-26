"use client";

import { GEM_SHAPES, type Gem as GemType } from "@/lib/gems";
import { cn } from "@/lib/utils";

/** A single gem. Locked ones keep the cut but lose the colour. */
export function Gem({
  gem,
  size = 40,
  earned,
  className
}: {
  gem: GemType;
  size?: number;
  earned: boolean;
  className?: string;
}) {
  const shape = GEM_SHAPES[gem.cut];
  const body = earned ? gem.hue : "hsl(var(--secondary))";
  const face = earned ? gem.face : "hsl(var(--muted-foreground))";

  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      className={cn(earned ? "" : "opacity-45", className)}
      aria-hidden="true"
    >
      <path d={shape.body} fill={body} />
      {shape.facets.map((d, i) => (
        <path key={i} d={d} fill={face} opacity={earned ? 0.3 + i * 0.12 : 0.18} />
      ))}
      <path
        d={shape.body}
        fill="none"
        stroke={earned ? gem.face : "hsl(var(--muted-foreground))"}
        strokeWidth={1.2}
        strokeLinejoin="round"
        opacity={earned ? 0.7 : 0.5}
      />
    </svg>
  );
}

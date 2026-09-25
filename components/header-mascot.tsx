"use client";

import Image from "next/image";
import { useState } from "react";
import { useAppLanguage } from "@/components/language-provider";

const MASCOT_SRC = "/milo-green.webp";

export function HeaderMascot() {
  const [hasImageError, setHasImageError] = useState(false);
  const { copy } = useAppLanguage();

  if (hasImageError) {
    return null;
  }

  return (
    <div className="relative hidden lg:flex lg:justify-end">
      <div className="header-mascot-glow absolute right-3 top-2 h-28 w-28 rounded-full xl:h-32 xl:w-32" />
      <div className="relative z-10 h-28 w-28 shrink-0 xl:h-32 xl:w-32">
        <Image
          alt={copy.header.mascotAlt}
          className="object-contain object-right-top drop-shadow-[0_18px_24px_rgba(60,64,68,0.14)]"
          fill
          onError={() => setHasImageError(true)}
          priority
          sizes="(min-width: 1280px) 128px, 112px"
          src={MASCOT_SRC}
        />
      </div>
    </div>
  );
}

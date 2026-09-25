"use client";

import { useAppLanguage } from "@/components/language-provider";
import LogoLoop from "@/components/logo-loop";
import {
  SiNextdotjs,
  SiMeta,
  SiReact,
  SiPostgresql,
  SiTailwindcss,
  SiTypescript
} from "react-icons/si";

const techLogos = [
  { node: <SiReact />, title: "React", href: "https://react.dev" },
  { node: <SiNextdotjs />, title: "Next.js", href: "https://nextjs.org" },
  { node: <SiTypescript />, title: "TypeScript", href: "https://www.typescriptlang.org" },
  { node: <SiTailwindcss />, title: "Tailwind CSS", href: "https://tailwindcss.com" },
  { node: <SiPostgresql />, title: "Neon (Postgres)", href: "https://neon.tech" },
  { node: <SiMeta />, title: "Groq + Llama", href: "https://groq.com" }
];

export function FooterLogoLoop() {
  const { copy } = useAppLanguage();

  return (
    <footer className="overflow-hidden rounded-[2rem] border border-[rgba(253,123,65,0.14)] bg-[linear-gradient(180deg,#15111d_0%,#0e0a15_100%)] px-4 py-5 shadow-[0_18px_40px_rgba(0,0,0,0.22)] sm:px-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-[rgba(255,255,255,0.46)]">
          {copy.footer.stackLabel}
        </p>
        <div className="h-px flex-1 bg-[linear-gradient(90deg,rgba(253,123,65,0.32),rgba(253,123,65,0.02))]" />
      </div>

      <div className="relative h-[88px] overflow-hidden">
        <LogoLoop
          ariaLabel="Technology partners"
          direction="left"
          fadeOut
          fadeOutColor="#0e0a15"
          gap={42}
          hoverSpeed={10}
          logoHeight={42}
          logos={techLogos}
          scaleOnHover
          speed={60}
        />
      </div>
    </footer>
  );
}

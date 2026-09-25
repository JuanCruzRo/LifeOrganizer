"use client";

import { Lock, TrendingUp, Zap } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppLanguage } from "@/components/language-provider";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Button } from "@/components/ui/button";
import { useUserPlan } from "@/lib/use-user-plan";

type StatsData = {
  completionRate: number;
  completedByWeek: { weekStart: string; count: number }[];
  byCategory: { category: string; count: number }[];
  activeStreak: number;
  totalCompleted: number;
  totalPending: number;
  encouragement: string;
};

const CATEGORY_COLORS = ["#3987e5", "#d95926", "#199e70", "#c98500", "#d55181"];

export function StatsPage() {
  const router = useRouter();
  const { copy, language } = useAppLanguage();
  const { plan, isLoaded: planLoaded } = useUserPlan();
  const [data, setData] = useState<StatsData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!planLoaded || plan !== "pro") return;
    let active = true;
    async function load() {
      try {
        const res = await fetch(`/api/stats?lang=${language === "es" ? "es" : "en"}`);
        if (!res.ok) throw new Error();
        const json = (await res.json()) as StatsData;
        if (active) setData(json);
      } catch {
        if (active) setError(true);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [planLoaded, plan, language]);

  if (planLoaded && plan !== "pro") {
    return <StatsLocked onBack={() => router.push("/")} />;
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{copy.stats.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{copy.stats.subtitle}</p>
          </div>
          <Link
            href="/"
            className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary"
          >
            {copy.stats.back}
          </Link>
        </div>

        {error && (
          <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {copy.errors.unexpected}
          </p>
        )}

        {!data && !error && (
          <div className="flex justify-center py-20 text-sm text-muted-foreground">
            {copy.stats.loading}
          </div>
        )}

        {data && (
          <div className="flex flex-col gap-5">
            {/* Milo's encouragement message */}
            <motion.div
              className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                M
              </div>
              <p className="mt-1 text-sm leading-relaxed text-foreground">{data.encouragement}</p>
            </motion.div>

            {/* KPI row */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatTile label={copy.stats.completed} value={data.totalCompleted} />
              <StatTile label={copy.stats.pending} value={data.totalPending} />
              <StatTile
                label={copy.stats.streak}
                value={data.activeStreak}
                suffix={copy.stats.days}
                icon={<Zap className="h-3.5 w-3.5 fill-primary text-primary" />}
              />
              <StatTile
                label={copy.stats.completionRate}
                value={data.completionRate}
                suffix="%"
              />
            </div>

            {/* Completion meter */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {copy.stats.completionRate}
              </p>
              <Meter value={data.completionRate} />
            </div>

            {/* Weekly trend */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {copy.stats.weeklyTrend}
              </p>
              <WeeklyTrendChart data={data.completedByWeek} />
            </div>

            {/* Category breakdown */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {copy.stats.byCategory}
              </p>
              <CategoryBars data={data.byCategory} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  suffix,
  icon
}: {
  label: string;
  value: number;
  suffix?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 flex items-center gap-1.5 text-2xl font-semibold">
        <AnimatedNumber value={value} />
        {suffix && <span className="text-sm font-normal text-muted-foreground">{suffix}</span>}
        {icon}
      </p>
    </div>
  );
}

function Meter({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-primary/15">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <span className="w-12 text-right text-sm font-semibold tabular-nums">{value}%</span>
    </div>
  );
}

function WeeklyTrendChart({ data }: { data: { weekStart: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const width = 560;
  const height = 120;
  const padding = 8;
  const stepX = (width - padding * 2) / Math.max(1, data.length - 1);

  const points = data.map((d, i) => {
    const x = padding + i * stepX;
    const y = height - padding - (d.count / max) * (height - padding * 2);
    return { x, y, count: d.count };
  });

  const linePath = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Weekly completed tasks trend">
      <path d={areaPath} fill="hsl(var(--primary))" opacity={0.1} />
      <path d={linePath} fill="none" stroke="hsl(var(--primary))" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill="hsl(var(--primary))" stroke="hsl(var(--card))" strokeWidth={2} />
      ))}
    </svg>
  );
}

function CategoryBars({ data }: { data: { category: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));

  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">—</p>;
  }

  return (
    <div className="flex flex-col gap-2.5">
      {data.map((item, i) => (
        <div key={item.category} className="flex items-center gap-3">
          <span className="w-20 flex-shrink-0 truncate text-xs text-muted-foreground">{item.category}</span>
          <div className="h-5 flex-1 overflow-hidden rounded-md bg-secondary/40">
            <motion.div
              className="h-full rounded-md"
              style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
              initial={{ width: 0 }}
              animate={{ width: `${(item.count / max) * 100}%` }}
              transition={{ duration: 0.6, delay: i * 0.05, ease: "easeOut" }}
            />
          </div>
          <span className="w-6 flex-shrink-0 text-right text-xs font-semibold tabular-nums">{item.count}</span>
        </div>
      ))}
    </div>
  );
}

function StatsLocked({ onBack }: { onBack: () => void }) {
  const { copy } = useAppLanguage();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
        <Lock className="h-6 w-6 text-muted-foreground" />
      </div>
      <h1 className="text-xl font-bold">{copy.stats.lockedTitle}</h1>
      <p className="max-w-xs text-sm text-muted-foreground">{copy.stats.lockedSubtitle}</p>
      <div className="mt-2 flex gap-2">
        <Button variant="outline" onClick={onBack}>
          {copy.stats.back}
        </Button>
        <Link href="/plans">
          <Button className="gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" />
            {copy.stats.upgradeToPro}
          </Button>
        </Link>
      </div>
    </div>
  );
}

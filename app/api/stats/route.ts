import "server-only";
import { NextResponse } from "next/server";
import { AppLanguage, supportedLanguages } from "@/lib/i18n";
import { chatWithMilo } from "@/lib/milo";
import { requireAuth, getUserPlan } from "@/lib/server-auth";
import { loadTasks } from "@/lib/storage";
import { Task } from "@/types/task";

const WEEKS_OF_HISTORY = 8;
const DAYS_OF_ACTIVITY = 14;

const LANGUAGE_NAMES: Record<AppLanguage, string> = {
  en: "English", es: "neutral Spanish (use tú, never voseo)", pt: "Brazilian Portuguese",
  fr: "French", de: "German", it: "Italian", zh: "Simplified Chinese", ja: "Japanese",
  ko: "Korean", ru: "Russian", tr: "Turkish", nl: "Dutch", pl: "Polish"
};

export async function GET(request: Request) {
  let userId: string;
  try {
    userId = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const plan = await getUserPlan(userId);
  if (plan !== "pro") {
    return NextResponse.json({ error: "Pro plan required" }, { status: 403 });
  }

  const langParam = new URL(request.url).searchParams.get("lang");
  const uiLanguage: AppLanguage = supportedLanguages.includes(langParam as AppLanguage)
    ? (langParam as AppLanguage)
    : "en";
  const tasks = await loadTasks(userId);

  const completionRate = getCompletionRate(tasks);
  const activeStreak = getActiveStreak(tasks);
  const bestStreak = getBestStreak(tasks);
  const byCategory = getByCategory(tasks);
  const totalCompleted = tasks.filter((t) => t.done).length;
  const totalPending = tasks.filter((t) => !t.done).length;

  const encouragement = await getEncouragementMessage({
    completionRate,
    activeStreak,
    totalCompleted,
    totalPending,
    topCategory: byCategory[0]?.category ?? null,
    uiLanguage
  });

  return NextResponse.json({
    completionRate,
    completedByWeek: getCompletedByWeek(tasks),
    lastDays: getLastDays(tasks),
    byCategory,
    activeStreak,
    bestStreak,
    totalCompleted,
    totalPending,
    encouragement
  });
}

async function getEncouragementMessage(params: {
  completionRate: number;
  activeStreak: number;
  totalCompleted: number;
  totalPending: number;
  topCategory: string | null;
  uiLanguage: AppLanguage;
}): Promise<string> {
  const prompt = `You are Milo, a warm personal organization assistant. Here is the user's data:
- Completed tasks: ${params.totalCompleted}
- Pending tasks: ${params.totalPending}
- Completion rate: ${params.completionRate}%
- Active day streak: ${params.activeStreak}
- Top category: ${params.topCategory ?? "none"}

Write ONE short message, max 2 sentences, reacting to these specific numbers.
Warm and honest, never generic, never cheesy, at most one emoji and usually none.
If the streak or the rate are low, encourage without blaming. If they are high, say what specifically went well.
Write it in ${LANGUAGE_NAMES[params.uiLanguage]}.
Reply with the message only, no quotes.`;

  try {
    const { content } = await chatWithMilo({ message: prompt, timeoutMs: 12000, maxTokens: 150 });
    return content.trim() || "";
  } catch {
    return "";
  }
}

/** Completed-task count per day, oldest first, for the activity strip. */
function getLastDays(tasks: Task[]): { date: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const task of tasks) {
    if (!task.done || !task.completedAt) continue;
    const key = new Date(task.completedAt).toISOString().split("T")[0];
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const days: { date: string; count: number }[] = [];
  for (let i = DAYS_OF_ACTIVITY - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    days.push({ date: key, count: counts.get(key) ?? 0 });
  }
  return days;
}

function getCompletionRate(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  const done = tasks.filter((t) => t.done).length;
  return Math.round((done / tasks.length) * 100);
}

function getCompletedByWeek(tasks: Task[]): { weekStart: string; count: number }[] {
  const weeks: { weekStart: string; count: number }[] = [];
  const now = new Date();

  for (let i = WEEKS_OF_HISTORY - 1; i >= 0; i--) {
    const weekStart = startOfWeek(new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000));
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

    const count = tasks.filter((t) => {
      if (!t.done || !t.completedAt) return false;
      const completed = new Date(t.completedAt);
      return completed >= weekStart && completed < weekEnd;
    }).length;

    weeks.push({ weekStart: weekStart.toISOString().split("T")[0], count });
  }

  return weeks;
}

function getByCategory(tasks: Task[]): { category: string; count: number; isOther?: boolean }[] {
  const counts = new Map<string, number>();
  for (const task of tasks) {
    counts.set(task.category, (counts.get(task.category) ?? 0) + 1);
  }

  const sorted = [...counts.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  const top = sorted.slice(0, 4);
  const rest = sorted.slice(4);
  const restTotal = rest.reduce((sum, c) => sum + c.count, 0);

  return restTotal > 0 ? [...top, { category: "", count: restTotal, isOther: true }] : top;
}

function getActiveStreak(tasks: Task[]): number {
  const completedDates = new Set(
    tasks
      .filter((t) => t.done && t.completedAt)
      .map((t) => new Date(t.completedAt!).toISOString().split("T")[0])
  );

  let streak = 0;
  const cursor = new Date();

  while (true) {
    const key = cursor.toISOString().split("T")[0];
    if (!completedDates.has(key)) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

/** Longest run of consecutive days with at least one completed task, ever. */
function getBestStreak(tasks: Task[]): number {
  const days = [
    ...new Set(
      tasks
        .filter((t) => t.done && t.completedAt)
        .map((t) => new Date(t.completedAt!).toISOString().split("T")[0])
    )
  ].sort();

  let best = 0;
  let run = 0;
  let previous: string | null = null;

  for (const day of days) {
    if (previous !== null && isNextDay(previous, day)) {
      run++;
    } else {
      run = 1;
    }
    if (run > best) best = run;
    previous = day;
  }

  return best;
}

function isNextDay(previous: string, current: string): boolean {
  const p = new Date(`${previous}T00:00:00Z`);
  p.setUTCDate(p.getUTCDate() + 1);
  return p.toISOString().split("T")[0] === current;
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

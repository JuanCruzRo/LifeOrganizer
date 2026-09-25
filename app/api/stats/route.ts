import "server-only";
import { NextResponse } from "next/server";
import { chatWithMilo } from "@/lib/milo";
import { requireAuth, getUserPlan } from "@/lib/server-auth";
import { loadTasks } from "@/lib/storage";
import { Task } from "@/types/task";

const WEEKS_OF_HISTORY = 8;

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

  const uiLanguage = new URL(request.url).searchParams.get("lang") === "es" ? "es" : "en";
  const tasks = await loadTasks(userId);

  const completionRate = getCompletionRate(tasks);
  const activeStreak = getActiveStreak(tasks);
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
    byCategory,
    activeStreak,
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
  uiLanguage: "en" | "es";
}): Promise<string> {
  const isSpanish = params.uiLanguage === "es";
  const prompt = isSpanish
    ? `Sos Milo, un asistente de organización personal cercano y motivador. Estos son los datos de productividad del usuario:
- Tareas completadas: ${params.totalCompleted}
- Tareas pendientes: ${params.totalPending}
- Tasa de cumplimiento: ${params.completionRate}%
- Racha de días activos seguidos: ${params.activeStreak}
- Categoría con más tareas: ${params.topCategory ?? "ninguna"}

Escribe UN mensaje corto (máximo 2 frases, sin emojis excesivos, tono cálido y motivador pero honesto, no genérico ni cursi) que reaccione a estos datos específicos. Si la racha o tasa son bajas, animá sin culpar. Si son altas, celebrá concretamente. Respondé SOLO con el mensaje, sin comillas ni explicaciones.`
    : `You are Milo, a warm and motivating personal organization assistant. Here is the user's productivity data:
- Completed tasks: ${params.totalCompleted}
- Pending tasks: ${params.totalPending}
- Completion rate: ${params.completionRate}%
- Active day streak: ${params.activeStreak}
- Top category: ${params.topCategory ?? "none"}

Write ONE short message (max 2 sentences, no excessive emojis, warm and motivating but honest tone, not generic or cheesy) reacting to this specific data. If streak or rate are low, encourage without blaming. If high, celebrate concretely. Respond ONLY with the message, no quotes or explanations.`;

  try {
    const { content } = await chatWithMilo({ message: prompt, timeoutMs: 12000 });
    return content.trim() || fallbackMessage(isSpanish);
  } catch {
    return fallbackMessage(isSpanish);
  }
}

function fallbackMessage(isSpanish: boolean): string {
  return isSpanish
    ? "Cada tarea completada suma. ¡Seguí así!"
    : "Every completed task adds up. Keep going!";
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

function getByCategory(tasks: Task[]): { category: string; count: number }[] {
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

  return restTotal > 0 ? [...top, { category: "Otras", count: restTotal }] : top;
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

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

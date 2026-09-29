import "server-only";
import { NextResponse } from "next/server";
import { chatWithMilo, refreshUserMemorySummary } from "@/lib/milo";
import { buildTaskContext } from "@/lib/milo-chat-prompt";
import { parseTaskActions } from "@/lib/task-actions";
import { requireAuth, getUserPlan } from "@/lib/server-auth";
import { consumeDailyUsage, dailyLimitResponse } from "@/lib/usage-limits";
import { bumpMessageCount, getUserMemory, saveUserMemory, shouldRefreshMemory } from "@/lib/user-memory";
import { Task, TaskInput } from "@/types/task";

const MAX_MESSAGE_LENGTH = 4000;
const MAX_TASKS = 100;

type HistoryMessage = { role: "user" | "milo"; content: string };

type MiloChatRequest = {
  message?: string;
  tasks?: Task[];
  history?: HistoryMessage[];
  pendingTaskAction?: TaskInput | null;
};

export async function POST(request: Request) {
  let userId: string;
  try { userId = await requireAuth(); }
  catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }

  const body = (await request.json()) as MiloChatRequest;
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!message) {
    return NextResponse.json({ error: "Missing message" }, { status: 400 });
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: "Message too long" }, { status: 400 });
  }
  if (Array.isArray(body.tasks) && body.tasks.length > MAX_TASKS) {
    return NextResponse.json({ error: "Too many tasks" }, { status: 400 });
  }

  const plan = await getUserPlan(userId);
  const usage = await consumeDailyUsage(userId, "milo_chat", plan);
  if (!usage.allowed) return dailyLimitResponse(usage.limit, plan);

  const canCreateTasks = plan !== "free";

  const userMemory = await getUserMemory(userId);
  const context = buildTaskContext({
    tasks: body.tasks ?? [],
    pendingTaskAction: body.pendingTaskAction ?? null,
    canCreateTasks,
    userMemory
  });
  const rawHistory = Array.isArray(body.history) ? body.history : [];
  const history = rawHistory.slice(-20).map((m) => ({
    role: (m.role === "milo" ? "assistant" : "user") as "assistant" | "user",
    content: m.content
  }));

  try {
    const { content } = await chatWithMilo({ message, context, history, isPro: plan === "pro" });
    const parsed = parseTaskActions(content);

    // This used to swallow every malformed block, so "Milo no me creo las
    // tareas" had no explanation anywhere. Now the reason is in the logs.
    if (parsed.error) {
      console.error(
        `[milo] user=${userId} task block present but unusable: ${parsed.error}`
      );
    } else if (parsed.partial) {
      console.warn(`[milo] user=${userId} reply was truncated, recovered ${parsed.taskActions.length} task(s)`);
    }

    void updateMemoryInBackground(userId, userMemory, [...history, { role: "user", content: message }, { role: "assistant", content: parsed.text }]);

    return NextResponse.json({
      response: parsed.text,
      taskActions: canCreateTasks && parsed.taskActions.length > 0 ? parsed.taskActions : null
    });
  } catch (error) {
    // The Groq plan allows 200k tokens per day for the whole account, so a
    // budget overrun is a normal operating condition, not a bug. Telling the
    // user "no se pudo conectar" when the truth is "Milo está ocupado hoy"
    // sends them to debug their own network for no reason.
    const status = typeof (error as { status?: unknown })?.status === "number"
      ? (error as { status: number }).status
      : undefined;
    const isRateLimited = status === 429;
    const isTimeout = error instanceof Error && error.name === "TimeoutError";

    console.error(`Milo chat failed (status=${status ?? "n/a"}, rateLimited=${isRateLimited})`, error);

    if (isRateLimited) {
      return NextResponse.json(
        { error: "Milo está con muchos mensajes ahora. Probá en un rato." },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: isTimeout ? "Milo tardó demasiado en responder." : "No se pudo conectar con Milo." },
      { status: 502 }
    );
  }
}

async function updateMemoryInBackground(
  userId: string,
  previousSummary: string,
  recentHistory: Array<{ role: "user" | "assistant"; content: string }>
) {
  try {
    const { count } = await bumpMessageCount(userId);
    if (!shouldRefreshMemory(count)) return;

    const updatedSummary = await refreshUserMemorySummary({
      previousSummary,
      history: recentHistory.slice(-20)
    });
    await saveUserMemory(userId, updatedSummary);
  } catch (error) {
    console.error("Failed to update user memory", error);
  }
}

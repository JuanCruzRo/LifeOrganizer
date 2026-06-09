import "server-only";
import { NextResponse } from "next/server";
import { chatWithMilo } from "@/lib/milo";
import { verifyApiAuth, getAccessTokenFromRequest, getUserPlan } from "@/lib/supabase-server";
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
  const userId = await verifyApiAuth(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ownerToken = request.headers.get("x-client-token") ?? "";
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

  const accessToken = getAccessTokenFromRequest(request);
  const plan = await getUserPlan(accessToken);

  const context = buildTaskContext(body.tasks ?? [], body.pendingTaskAction ?? null);
  const rawHistory = Array.isArray(body.history) ? body.history : [];
  const history = rawHistory.slice(-20).map((m) => ({
    role: (m.role === "milo" ? "assistant" : "user") as "assistant" | "user",
    content: m.content
  }));

  try {
    const { content } = await chatWithMilo({ message, context, history, isPro: plan === "pro" });
    const { text, taskAction } = parseTaskAction(content);
    return NextResponse.json({ response: text, taskAction: taskAction ?? null });
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === "TimeoutError";
    return NextResponse.json(
      { error: isTimeout ? "Milo tardó demasiado en responder." : "No se pudo conectar con Milo." },
      { status: 502 }
    );
  }
}

function buildTaskContext(tasks: Task[], pendingTaskAction: TaskInput | null): string {
  const today = new Date().toISOString().split("T")[0];
  const lines: string[] = [
    `Fecha de hoy: ${today}`,
    `
Reglas de honestidad (OBLIGATORIAS):
- Si no sabés algo con certeza, decilo directamente: "No tengo esa información" o "No estoy seguro de eso".
- NUNCA inventes hechos, fechas, datos, precios, instrucciones técnicas específicas, ni nombres reales.
- Si el usuario te hace una pregunta factual sobre el mundo real y no aparece en los resultados de búsqueda web, admití que no sabés.
- Es mejor decir "no sé" que dar información incorrecta.`
  ];

  const pending = tasks.filter((t) => !t.done);
  const completed = tasks.filter((t) => t.done);

  if (pending.length > 0) {
    lines.push("\nTareas pendientes del usuario:");
    for (const task of pending) {
      const desc = task.description ? ` — ${task.description}` : "";
      lines.push(
        `- [${task.priority.toUpperCase()}] ${task.title} (${task.category}) — vence: ${task.dueDate}, duración: ${task.duration}${desc}`
      );
    }
  }

  if (completed.length > 0) {
    lines.push("\nTareas completadas recientemente (historial):");
    const recent = completed
      .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""))
      .slice(0, 15);
    for (const task of recent) {
      const when = task.completedAt
        ? ` — completada el ${new Date(task.completedAt).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })}`
        : "";
      lines.push(`- ${task.title} (${task.category})${when}`);
    }
  }

  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
  const defaultDate = sevenDaysLater.toISOString().split("T")[0];

  if (pendingTaskAction) {
    lines.push(`
Tarea pendiente de confirmación del usuario: "${pendingTaskAction.title}" (${pendingTaskAction.category}).
- Si el usuario sigue hablando del mismo tema, NO la menciones. Continuá la conversación normalmente.
- Si el usuario cambia claramente de tema, recordale brevemente que tiene esa tarea pendiente de confirmar o descartar antes de continuar.`);
  }

  lines.push(`
Instrucciones para creación de tareas:
- Si el usuario pide crear, agregar o recordar una tarea, respondé normalmente y al final incluí exactamente este bloque en una nueva línea:
TASK_ACTION:{"title":"...","category":"...","description":"...","priority":"low|medium|high","duration":"short|medium|long","dueDate":"YYYY-MM-DD"}
- Usá la fecha de hoy (${today}) como base si no se menciona fecha. Por defecto usá 7 días desde hoy (${defaultDate}).
- Defaults si falta info: category="general", priority="medium", duration="medium", description="".
- Incluí TASK_ACTION solo cuando el usuario claramente quiere crear una tarea.
- No incluyas nada después del bloque TASK_ACTION.`);

  return lines.join("\n");
}

function parseTaskAction(response: string): { text: string; taskAction?: TaskInput } {
  const actionIndex = response.indexOf("TASK_ACTION:");
  if (actionIndex === -1) return { text: response };

  const text = response.slice(0, actionIndex).trim();
  const jsonStr = response.slice(actionIndex + "TASK_ACTION:".length).trim();

  try {
    const parsed = JSON.parse(jsonStr) as Partial<TaskInput>;
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

    const taskAction: TaskInput = {
      title: typeof parsed.title === "string" ? parsed.title.trim() : "",
      category: typeof parsed.category === "string" ? parsed.category.trim() : "general",
      description: typeof parsed.description === "string" ? parsed.description.trim() : "",
      priority: (["low", "medium", "high"] as const).includes(parsed.priority as TaskInput["priority"])
        ? (parsed.priority as TaskInput["priority"])
        : "medium",
      duration: (["short", "medium", "long"] as const).includes(parsed.duration as TaskInput["duration"])
        ? (parsed.duration as TaskInput["duration"])
        : "medium",
      dueDate:
        typeof parsed.dueDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(parsed.dueDate)
          ? parsed.dueDate
          : sevenDaysLater.toISOString().split("T")[0]
    };

    if (!taskAction.title) return { text: response };

    return { text, taskAction };
  } catch {
    return { text: response };
  }
}

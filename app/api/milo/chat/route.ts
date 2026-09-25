import "server-only";
import { NextResponse } from "next/server";
import { chatWithMilo, refreshUserMemorySummary } from "@/lib/milo";
import { requireAuth, getUserPlan } from "@/lib/server-auth";
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
  const canCreateTasks = plan !== "free";

  const userMemory = await getUserMemory(userId);
  const context = buildTaskContext(body.tasks ?? [], body.pendingTaskAction ?? null, canCreateTasks, userMemory);
  const rawHistory = Array.isArray(body.history) ? body.history : [];
  const history = rawHistory.slice(-20).map((m) => ({
    role: (m.role === "milo" ? "assistant" : "user") as "assistant" | "user",
    content: m.content
  }));

  try {
    const { content } = await chatWithMilo({ message, context, history, isPro: plan === "pro" });
    const { text, taskActions } = parseTaskActions(content);
    const cleanText = sanitizeResponse(text);

    void updateMemoryInBackground(userId, userMemory, [...history, { role: "user", content: message }, { role: "assistant", content: cleanText }]);

    return NextResponse.json({
      response: cleanText,
      taskActions: canCreateTasks && taskActions.length > 0 ? taskActions : null
    });
  } catch (error) {
    console.error("Milo chat failed", error);
    const isTimeout = error instanceof Error && error.name === "TimeoutError";
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

function buildTaskContext(
  tasks: Task[],
  pendingTaskAction: TaskInput | null,
  canCreateTasks: boolean,
  userMemory: string
): string {
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

  if (userMemory) {
    lines.push(`
Lo que sabés de este usuario por conversaciones anteriores:
${userMemory}
Usá esto para personalizar tus respuestas cuando sea relevante, sin mencionar explícitamente que "tenés una memoria" salvo que te pregunten.`);
  }

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

  if (canCreateTasks) {
    lines.push(`
Creación de tareas:
Podés crear una o varias tareas incluyendo al final de tu respuesta exactamente este bloque (sin nada después):
TASKS_ACTION:[{"title":"...","category":"...","description":"...","priority":"low|medium|high","duration":"short|medium|long","dueDate":"YYYY-MM-DD"}]

Para múltiples tareas (recurrentes, varios días, etc.) incluí varios objetos en el array:
TASKS_ACTION:[{"title":"Banco","dueDate":"2026-07-08",...},{"title":"Banco","dueDate":"2026-07-15",...}]

Usá TASKS_ACTION solo cuando el usuario pida explícitamente crear, agendar o recordar algo con verbos como "agendá", "creá", "recordame", "nueva tarea", "quiero agendar", "cada martes", "todos los jueves".
Para tareas recurrentes (cada semana, todos los martes, etc.) creá una tarea por cada ocurrencia para las próximas 4 semanas.
No uses TASKS_ACTION cuando el usuario haga preguntas, pida consejos, recomendaciones o información.
Fecha base: hoy (${today}). Default: ${defaultDate}. Defaults: category="general", priority="medium", duration="medium", description="".`);
  } else {
    lines.push(`
Creación de tareas:
Este usuario está en el plan Free y NO puede crear tareas desde el chat (esa función es exclusiva de los planes Plus y Pro).
Si pide crear, agendar o recordar algo con verbos como "agendá", "creá", "recordame", "nueva tarea", explicale amablemente que para crear tareas por chat necesita el plan Plus, y sugerile que puede crearla manualmente desde el botón "+" o hacer el upgrade en /plans.
Nunca generes el bloque TASKS_ACTION para este usuario.`);
  }

  return lines.join("\n");
}

function sanitizeResponse(text: string): string {
  return text
    .split("\n")
    .filter((line) => !/TASKS?_ACTION/i.test(line))
    .join("\n")
    .trim();
}

function normalizeTaskInput(parsed: Partial<TaskInput>): TaskInput | null {
  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
  const title = typeof parsed.title === "string" ? parsed.title.trim() : "";
  if (!title) return null;
  return {
    title,
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
}

function parseTaskActions(response: string): { text: string; taskActions: TaskInput[] } {
  const marker = "TASKS_ACTION:";
  const actionIndex = response.indexOf(marker);
  if (actionIndex === -1) return { text: response, taskActions: [] };

  const text = response.slice(0, actionIndex).trim();
  const jsonStr = response.slice(actionIndex + marker.length).trim();

  try {
    const parsed = JSON.parse(jsonStr) as unknown;
    const items = Array.isArray(parsed) ? parsed : [parsed];
    const taskActions = items
      .map((item) => normalizeTaskInput(item as Partial<TaskInput>))
      .filter((t): t is TaskInput => t !== null)
      .slice(0, 12);
    if (taskActions.length === 0) return { text: response, taskActions: [] };
    return { text, taskActions };
  } catch {
    return { text: response, taskActions: [] };
  }
}

import "server-only";
import { NextResponse } from "next/server";
import { Task } from "@/types/task";

const MILO_SERVER_URL = (process.env.MILO_SERVER_URL ?? "http://localhost:8000").replace(/\/$/, "");

type MiloChatRequest = {
  message?: string;
  tasks?: Task[];
};

export async function POST(request: Request) {
  const ownerToken = request.headers.get("x-client-token") ?? "";
  const body = (await request.json()) as MiloChatRequest;
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!message) {
    return NextResponse.json({ error: "Missing message" }, { status: 400 });
  }

  const context = buildTaskContext(body.tasks ?? []);

  try {
    const miloResponse = await fetch(`${MILO_SERVER_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(ownerToken ? { "x-client-token": ownerToken } : {})
      },
      body: JSON.stringify({ message, context }),
      signal: AbortSignal.timeout(30000)
    });

    if (!miloResponse.ok) {
      const err = (await miloResponse.json().catch(() => ({}))) as { error?: string };
      return NextResponse.json(
        { error: err.error ?? "Milo server error" },
        { status: 502 }
      );
    }

    const data = (await miloResponse.json()) as { response?: string };
    return NextResponse.json({ response: data.response ?? "" });
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === "TimeoutError";
    return NextResponse.json(
      { error: isTimeout ? "Milo tardó demasiado en responder." : "No se pudo conectar con Milo." },
      { status: 502 }
    );
  }
}

function buildTaskContext(tasks: Task[]): string {
  if (tasks.length === 0) return "";

  const lines = ["Tareas pendientes del usuario:"];

  for (const task of tasks) {
    const desc = task.description ? ` — ${task.description}` : "";
    lines.push(
      `- [${task.priority.toUpperCase()}] ${task.title} (${task.category}) — vence: ${task.dueDate}, duración: ${task.duration}${desc}`
    );
  }

  return lines.join("\n");
}

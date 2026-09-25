import "server-only";
import { NextResponse } from "next/server";
import { requireAuth, getUserPlan } from "@/lib/server-auth";
import {
  loadTasks,
  createTask,
  updateTask,
  setTaskDone,
  deleteTaskById,
  countUserTasks
} from "@/lib/storage";
import { Task, TaskInput } from "@/types/task";

const FREE_TASK_LIMIT = 15;

function isValidTask(v: unknown): v is Task {
  if (!v || typeof v !== "object") return false;
  const t = v as Record<string, unknown>;
  return (
    typeof t.id === "string" &&
    typeof t.title === "string" &&
    typeof t.category === "string" &&
    typeof t.description === "string" &&
    (t.priority === "low" || t.priority === "medium" || t.priority === "high") &&
    (t.duration === "short" || t.duration === "medium" || t.duration === "long") &&
    typeof t.dueDate === "string" &&
    typeof t.done === "boolean"
  );
}

// GET /api/tasks — load all tasks
export async function GET() {
  let userId: string;
  try { userId = await requireAuth(); }
  catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }

  try {
    const tasks = await loadTasks(userId);
    return NextResponse.json({ tasks });
  } catch (err) {
    console.error("loadTasks failed", err);
    return NextResponse.json({ error: "Failed to load tasks" }, { status: 500 });
  }
}

// POST /api/tasks — create a task (with free-plan limit check)
export async function POST(request: Request) {
  let userId: string;
  try { userId = await requireAuth(); }
  catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }

  const plan = await getUserPlan(userId);
  if (plan === "free") {
    const count = await countUserTasks(userId);
    if (count >= FREE_TASK_LIMIT) {
      return NextResponse.json(
        { error: "FREE_PLAN_LIMIT:task_limit_reached", limit: FREE_TASK_LIMIT },
        { status: 403 }
      );
    }
  }

  const body = (await request.json()) as unknown;
  if (!isValidTask(body)) {
    return NextResponse.json({ error: "Invalid task data" }, { status: 400 });
  }

  try {
    const created = await createTask(body, userId);
    return NextResponse.json({ task: created });
  } catch (err) {
    console.error("createTask failed", err);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

// PUT /api/tasks — update a task
export async function PUT(request: Request) {
  let userId: string;
  try { userId = await requireAuth(); }
  catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }

  const body = (await request.json()) as unknown;
  if (!isValidTask(body)) {
    return NextResponse.json({ error: "Invalid task data" }, { status: 400 });
  }

  try {
    const updated = await updateTask(body, userId);
    return NextResponse.json({ task: updated });
  } catch (err) {
    console.error("updateTask failed", err);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

// PATCH /api/tasks — toggle done status
export async function PATCH(request: Request) {
  let userId: string;
  try { userId = await requireAuth(); }
  catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }

  const body = (await request.json()) as { taskId?: string; done?: boolean };
  if (typeof body.taskId !== "string" || typeof body.done !== "boolean") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const updated = await setTaskDone(body.taskId, body.done, userId);
    return NextResponse.json({ task: updated });
  } catch (err) {
    console.error("setTaskDone failed", err);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

// DELETE /api/tasks?id=<taskId>
export async function DELETE(request: Request) {
  let userId: string;
  try { userId = await requireAuth(); }
  catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }

  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get("id");
  if (!taskId) {
    return NextResponse.json({ error: "Missing task id" }, { status: 400 });
  }

  try {
    await deleteTaskById(taskId, userId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("deleteTaskById failed", err);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}

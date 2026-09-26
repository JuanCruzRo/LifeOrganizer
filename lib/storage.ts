import "server-only";
import sql from "@/lib/db";
import { Task, TaskStep } from "@/types/task";

type TaskRow = {
  id: string;
  user_id: string;
  title: string;
  category: string;
  description: string;
  priority: Task["priority"];
  duration: Task["duration"];
  due_date: string;
  done: boolean;
  completed_at: string | null;
  steps: unknown;
};

export async function loadTasks(userId: string): Promise<Task[]> {
  const rows = await sql`
    SELECT * FROM tasks
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;
  return rows.map(normalizeTask).filter((t): t is Task => t !== null);
}

export async function createTask(task: Task, userId: string): Promise<Task> {
  const rows = await sql`
    INSERT INTO tasks (id, user_id, title, category, description, priority, duration, due_date, done, steps)
    VALUES (${task.id}, ${userId}, ${task.title}, ${task.category}, ${task.description},
            ${task.priority}, ${task.duration}, ${task.dueDate}, ${task.done},
            ${JSON.stringify(task.steps ?? [])}::jsonb)
    RETURNING *
  `;
  const created = normalizeTask(rows[0]);
  if (!created) throw new Error("Failed to create task.");
  return created;
}

export async function updateTask(task: Task, userId: string): Promise<Task> {
  const rows = await sql`
    UPDATE tasks
    SET title = ${task.title}, category = ${task.category}, description = ${task.description},
        priority = ${task.priority}, duration = ${task.duration}, due_date = ${task.dueDate},
        done = ${task.done}, steps = ${JSON.stringify(task.steps ?? [])}::jsonb
    WHERE id = ${task.id} AND user_id = ${userId}
    RETURNING *
  `;
  const updated = normalizeTask(rows[0]);
  if (!updated) throw new Error("Failed to update task.");
  return updated;
}

export async function setTaskDone(taskId: string, done: boolean, userId: string): Promise<Task> {
  const rows = await sql`
    UPDATE tasks
    SET done = ${done}, completed_at = ${done ? new Date().toISOString() : null}
    WHERE id = ${taskId} AND user_id = ${userId}
    RETURNING *
  `;
  const updated = normalizeTask(rows[0]);
  if (!updated) throw new Error("Failed to toggle task.");
  return updated;
}

export async function deleteTaskById(taskId: string, userId: string): Promise<void> {
  await sql`DELETE FROM tasks WHERE id = ${taskId} AND user_id = ${userId}`;
}

export async function countUserTasks(userId: string): Promise<number> {
  const rows = await sql`SELECT COUNT(*) as count FROM tasks WHERE user_id = ${userId}`;
  return Number(rows[0]?.count ?? 0);
}

function normalizeTask(row: unknown): Task | null {
  if (!row || typeof row !== "object") return null;
  const r = row as Partial<TaskRow>;
  if (
    typeof r.id === "string" &&
    typeof r.title === "string" &&
    typeof r.category === "string" &&
    typeof r.description === "string" &&
    (r.priority === "low" || r.priority === "medium" || r.priority === "high") &&
    (r.duration === "short" || r.duration === "medium" || r.duration === "long") &&
    typeof r.due_date === "string" &&
    typeof r.done === "boolean"
  ) {
    return {
      id: r.id,
      title: r.title,
      category: r.category,
      description: r.description,
      priority: r.priority,
      duration: r.duration,
      dueDate: r.due_date,
      done: r.done,
      ...(r.completed_at ? { completedAt: r.completed_at } : {}),
      steps: normalizeSteps(r.steps)
    };
  }
  return null;
}

function normalizeSteps(value: unknown): TaskStep[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (s): s is TaskStep =>
        !!s && typeof s === "object" &&
        typeof (s as TaskStep).id === "string" &&
        typeof (s as TaskStep).text === "string" &&
        typeof (s as TaskStep).done === "boolean"
    )
    .slice(0, 20);
}

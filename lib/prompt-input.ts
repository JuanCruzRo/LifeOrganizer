import "server-only";
import type { Task } from "@/types/task";

/**
 * Hard bounds on what the client may put in front of a paid model.
 *
 * `/api/tasks` already refuses to *store* anything longer than these, so a
 * legitimate task can never exceed them — every truncation here is of a value
 * the database would have rejected anyway.
 *
 * The AI routes are the ones that need them: they count elements (100 tasks,
 * 20 messages) but never measured a field, so one counted call could carry a
 * multi-megabyte prompt. That is paid for on the provider side and invisible to
 * the daily counters, which only count *calls*. These are the same numbers the
 * storage route uses, exported from one place so they cannot drift.
 */
export const TASK_FIELD_LIMITS = {
  id: 100,
  title: 200,
  category: 60,
  description: 2000,
  dueDate: 32
} as const;

/** Conversation sent back to Milo: capped by the caller at 20 messages. */
export const HISTORY_CONTENT_LIMIT = 2000;
export const HISTORY_MESSAGES_LIMIT = 20;

/** Clarification trail on ai-task-help, unbounded in both count and length. */
export const CLARIFICATION_LIMIT = 8;
export const CLARIFICATION_TEXT_LIMIT = 1000;

function clamp(value: unknown, max: number): string {
  return typeof value === "string" ? value.slice(0, max) : "";
}

/**
 * A task with every free-text field bounded.
 *
 * Truncated rather than rejected: dropping a task because its title is long
 * would change what Milo sees for no benefit to the user, and the first 200
 * characters of a 50KB title are all the model could use anyway.
 */
export function clampTaskForPrompt(task: unknown): Task | null {
  if (!task || typeof task !== "object") return null;
  const t = task as Record<string, unknown>;
  if (typeof t.title !== "string") return null;

  return {
    ...t,
    id: clamp(t.id, TASK_FIELD_LIMITS.id),
    title: clamp(t.title, TASK_FIELD_LIMITS.title),
    category: clamp(t.category, TASK_FIELD_LIMITS.category),
    description: clamp(t.description, TASK_FIELD_LIMITS.description),
    dueDate: clamp(t.dueDate, TASK_FIELD_LIMITS.dueDate)
  } as Task;
}

export function clampTasksForPrompt(tasks: unknown, max: number): Task[] {
  if (!Array.isArray(tasks)) return [];
  return tasks.slice(0, max).map(clampTaskForPrompt).filter((t): t is Task => t !== null);
}

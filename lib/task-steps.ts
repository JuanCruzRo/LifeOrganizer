import type { TaskStep } from "@/types/task";

export const MAX_STEPS_PER_TASK = 20;
export const MAX_STEP_TEXT = 300;

function isStep(value: unknown): value is TaskStep {
  if (!value || typeof value !== "object") return false;
  const s = value as Record<string, unknown>;
  return (
    typeof s.id === "string" && s.id.length > 0 && s.id.length <= 100 &&
    typeof s.text === "string" && s.text.length > 0 && s.text.length <= MAX_STEP_TEXT &&
    typeof s.done === "boolean"
  );
}

/** Used by the API to reject malformed input. */
export function isValidSteps(value: unknown): boolean {
  return Array.isArray(value) && value.length <= MAX_STEPS_PER_TASK && value.every(isStep);
}

/** Used when reading from the database, where old rows may hold anything. */
export function normalizeSteps(value: unknown): TaskStep[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isStep).slice(0, MAX_STEPS_PER_TASK);
}

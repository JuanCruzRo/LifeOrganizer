import { describe, expect, it } from "vitest";
import { getRecommendedTask, getTaskScore } from "@/lib/task-score";
import type { Task } from "@/types/task";

function dateIn(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function task(overrides: Partial<Task> & { id: string }): Task {
  return {
    title: overrides.id,
    category: "general",
    description: "",
    priority: "medium",
    duration: "medium",
    dueDate: dateIn(5),
    done: false,
    ...overrides
  };
}

describe("getTaskScore", () => {
  it("scores an overdue task above the same task due next week", () => {
    const overdue = task({ id: "a", dueDate: dateIn(-1) });
    const later = task({ id: "b", dueDate: dateIn(7) });
    expect(getTaskScore(overdue)).toBeGreaterThan(getTaskScore(later));
  });

  it("scores high priority above low priority, all else equal", () => {
    expect(getTaskScore(task({ id: "a", priority: "high" })))
      .toBeGreaterThan(getTaskScore(task({ id: "b", priority: "low" })));
  });

  it("gives a long task due soon more weight than a short one", () => {
    const long = task({ id: "a", duration: "long", dueDate: dateIn(2) });
    const short = task({ id: "b", duration: "short", dueDate: dateIn(2) });
    expect(getTaskScore(long)).toBeGreaterThan(getTaskScore(short));
  });
});

describe("getRecommendedTask", () => {
  it("returns null when there is nothing pending", () => {
    expect(getRecommendedTask([])).toBeNull();
    expect(getRecommendedTask([task({ id: "a", done: true })])).toBeNull();
  });

  it("ignores completed tasks even when they would score highest", () => {
    const done = task({ id: "done", done: true, priority: "high", dueDate: dateIn(-3) });
    const pending = task({ id: "pending", priority: "low", dueDate: dateIn(9) });
    expect(getRecommendedTask([done, pending])?.id).toBe("pending");
  });

  it("picks the urgent high-priority task over a far-off one", () => {
    const urgent = task({ id: "urgent", priority: "high", dueDate: dateIn(1) });
    const later = task({ id: "later", priority: "low", dueDate: dateIn(20) });
    expect(getRecommendedTask([later, urgent])?.id).toBe("urgent");
  });

  it("is deterministic: same input, same winner regardless of order", () => {
    const tasks = [
      task({ id: "a", priority: "high", dueDate: dateIn(3), duration: "long" }),
      task({ id: "b", priority: "medium", dueDate: dateIn(1), duration: "short" }),
      task({ id: "c", priority: "low", dueDate: dateIn(0), duration: "medium" })
    ];
    const winner = getRecommendedTask(tasks)?.id;
    expect(getRecommendedTask([...tasks].reverse())?.id).toBe(winner);
  });
});

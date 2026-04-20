import { Task } from "@/types/task";
import { getDaysUntilDueDate } from "@/lib/task-date";

type ScoredTask = Pick<Task, "priority" | "duration" | "dueDate">;

const priorityPoints = {
  low: 2,
  medium: 5,
  high: 8
};

const durationPoints = {
  short: 0,
  medium: 2,
  long: 5
};

export function getTaskScore(task: Pick<Task, "priority" | "duration" | "dueDate">) {
  return getTaskScoreWithContext(task, { hasCriticalTasks: false });
}

export function getRecommendedTask(tasks: Task[]) {
  const pendingTasks = tasks.filter((task) => !task.done);

  if (pendingTasks.length === 0) {
    return null;
  }

  const hasCriticalTasks = pendingTasks.some(isCriticalTask);

  const sortedTasks = [...pendingTasks].sort((leftTask, rightTask) => {
    const leftScore = getTaskScoreWithContext(leftTask, { hasCriticalTasks });
    const rightScore = getTaskScoreWithContext(rightTask, { hasCriticalTasks });

    if (rightScore !== leftScore) {
      return rightScore - leftScore;
    }

    const leftTaskDueDays = getDaysUntilDueDate(leftTask.dueDate);
    const rightTaskDueDays = getDaysUntilDueDate(rightTask.dueDate);

    if (leftTaskDueDays !== rightTaskDueDays) {
      return leftTaskDueDays - rightTaskDueDays;
    }

    if (leftTask.priority !== rightTask.priority) {
      return priorityPoints[rightTask.priority] - priorityPoints[leftTask.priority];
    }

    if (leftTask.duration !== rightTask.duration) {
      return (
        getDurationPoints(rightTask.duration, rightTaskDueDays, hasCriticalTasks) -
        getDurationPoints(leftTask.duration, leftTaskDueDays, hasCriticalTasks)
      );
    }

    return leftTask.title.localeCompare(rightTask.title);
  });

  return sortedTasks[0];
}

function getUrgencyPoints(daysUntilDueDate: number) {
  if (daysUntilDueDate <= 0) {
    return 18;
  }

  if (daysUntilDueDate === 1) {
    return 16;
  }

  if (daysUntilDueDate <= 3) {
    return 11;
  }

  if (daysUntilDueDate <= 7) {
    return 5;
  }

  return 0;
}

function getDurationPoints(
  duration: Task["duration"],
  daysUntilDueDate: number,
  hasCriticalTasks: boolean
) {
  let score = durationPoints[duration];

  if (duration === "long") {
    if (daysUntilDueDate <= 3) {
      score += 6;
    } else if (daysUntilDueDate <= 7) {
      score += 4;
    } else {
      score += 2;
    }
  }

  if (duration === "medium" && daysUntilDueDate > 7) {
    score += 1;
  }

  if (duration === "short" && daysUntilDueDate > 7 && !hasCriticalTasks) {
    score += 3;
  }

  return score;
}

function getTaskScoreWithContext(task: ScoredTask, context: { hasCriticalTasks: boolean }) {
  const daysUntilDueDate = getDaysUntilDueDate(task.dueDate);
  let score = 0;

  score += priorityPoints[task.priority];
  score += getUrgencyPoints(daysUntilDueDate);
  score += getDurationPoints(task.duration, daysUntilDueDate, context.hasCriticalTasks);

  return score;
}

function isCriticalTask(task: Pick<Task, "priority" | "duration" | "dueDate">) {
  const daysUntilDueDate = getDaysUntilDueDate(task.dueDate);

  return (
    daysUntilDueDate <= 3 ||
    task.priority === "high" ||
    (task.duration === "long" && daysUntilDueDate <= 7)
  );
}

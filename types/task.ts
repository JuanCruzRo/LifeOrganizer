export type TaskPriority = "low" | "medium" | "high";
export type TaskDuration = "short" | "medium" | "long";

export interface TaskInput {
  title: string;
  category: string;
  description: string;
  priority: TaskPriority;
  duration: TaskDuration;
  dueDate: string;
}

export interface Task extends TaskInput {
  id: string;
  done: boolean;
  completedAt?: string;
}

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

export interface TaskStep {
  id: string;
  text: string;
  done: boolean;
}

export interface Task extends TaskInput {
  id: string;
  done: boolean;
  completedAt?: string;
  // Small concrete sub-steps (AI-generated or edited by the user).
  steps?: TaskStep[];
}

import { TaskDuration, TaskPriority } from "@/types/task";

export interface AiPriorityRecommendation {
  recommendedTaskId: string;
  recommendationReason: string;
  model: string;
}

export interface AiPriorityApiResponse {
  enabled: boolean;
  recommendation: AiPriorityRecommendation | null;
  error: string | null;
}

export interface AiPriorityTaskInput {
  id: string;
  title: string;
  category: string;
  description: string;
  priority: TaskPriority;
  duration: TaskDuration;
  dueDate: string;
  systemScore: number;
  dueInDays: number;
}

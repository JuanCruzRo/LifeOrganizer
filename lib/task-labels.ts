import { AppLanguage, copy } from "@/lib/i18n";
import { Task } from "@/types/task";

export function getTaskDurationLabel(duration: Task["duration"], language: AppLanguage) {
  return copy[language].taskList.durations[duration];
}

export function getTaskPriorityLabel(priority: Task["priority"], language: AppLanguage) {
  return copy[language].taskForm.priorities[priority];
}

"use client";
import { useState } from "react";
import { CalendarView } from "@/components/calendar-view";
import type { Task } from "@/types/task";
export default function Preview() {
  const [tasks, setTasks] = useState<Task[]>([]);
  return <div className="h-dvh"><CalendarView allTasks={tasks} isMutating={false} isAiLoading={false}
    aiRecommendation={null} onAddTask={() => {}} onDeleteTask={async () => {}} onEditTask={() => {}}
    onToggleTask={async () => {}} onFocusTask={() => {}} onBreakDown={() => {}} breakingDownTaskId={null}
    onQuickAdd={async (t) => setTasks((p) => [...p, { id: String(Date.now()), title: t, category: "general", description: "", priority: "medium", duration: "short", dueDate: new Date().toISOString().slice(0,10), done: false }])} /></div>;
}

"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, CheckCircle2, Circle, Pencil, Trash2, Sparkles } from "lucide-react";
import { useAppLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { MiloLoader } from "@/components/milo-loader";
import { cn } from "@/lib/utils";
import { formatDueDate, getDueDateLabel } from "@/lib/task-date";
import { getTaskPriorityLabel } from "@/lib/task-labels";
import { AiPriorityRecommendation } from "@/types/ai-priority";
import { Task } from "@/types/task";

const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay();

  const days: { key: string; date: Date; currentMonth: boolean }[] = [];

  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push({ key: toDateKey(d), date: d, currentMonth: false });
  }
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const d = new Date(year, month, i);
    days.push({ key: toDateKey(d), date: d, currentMonth: true });
  }
  const rem = 7 - (days.length % 7);
  if (rem < 7) {
    for (let i = 1; i <= rem; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ key: toDateKey(d), date: d, currentMonth: false });
    }
  }
  return days;
}

type CalendarViewProps = {
  allTasks: Task[];
  isMutating: boolean;
  aiRecommendation: AiPriorityRecommendation | null;
  isAiLoading: boolean;
  onAddTask: () => void;
  onDeleteTask: (id: string) => Promise<void>;
  onEditTask: (id: string) => void;
  onToggleTask: (id: string) => Promise<void>;
};

export function CalendarView({
  allTasks,
  isMutating,
  aiRecommendation,
  isAiLoading,
  onAddTask,
  onDeleteTask,
  onEditTask,
  onToggleTask
}: CalendarViewProps) {
  const { language, copy } = useAppLanguage();
  const today = new Date();
  const todayKey = toDateKey(today);

  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const calDays = getCalendarDays(year, month);

  const tasksByDate = allTasks.reduce<Record<string, Task[]>>((acc, task) => {
    if (!task.dueDate) return acc;
    if (!acc[task.dueDate]) acc[task.dueDate] = [];
    acc[task.dueDate].push(task);
    return acc;
  }, {});

  const pendingCount = useMemo(() => allTasks.filter((t) => !t.done).length, [allTasks]);

  const displayedTasks = selectedKey
    ? (tasksByDate[selectedKey] ?? [])
    : [...allTasks].sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1));

  const recommendedTask = aiRecommendation
    ? allTasks.find((t) => t.id === aiRecommendation.recommendedTaskId && !t.done)
    : null;

  function prevMonth() {
    setViewDate(new Date(year, month - 1, 1));
  }
  function nextMonth() {
    setViewDate(new Date(year, month + 1, 1));
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {copy.calendar.myTasks}
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {pendingCount} {pendingCount === 1 ? "pendiente" : "pendientes"}
          </p>
        </div>
        <Button size="sm" onClick={onAddTask} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          {copy.calendar.newTask}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* AI Recommendation bar */}
        {(recommendedTask || isAiLoading) && (
          <div className="border-b border-border px-5 py-3">
            {isAiLoading ? (
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <MiloLoader />
                <span>{copy.calendar.analyzingTasks}</span>
              </div>
            ) : recommendedTask ? (
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <span className="inline-flex items-center gap-1 rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">
                    <Sparkles className="h-2.5 w-2.5" />
                    IA
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-muted-foreground">
                    {copy.calendar.todayRecommendation}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold">{recommendedTask.title}</p>
                  {aiRecommendation?.recommendationReason && (
                    <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                      {aiRecommendation.recommendationReason}
                    </p>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Calendar */}
        <div className="px-5 py-4">
          {/* Month navigation */}
          <div className="mb-3 flex items-center justify-between">
            <button
              onClick={prevMonth}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-sm font-semibold">
              {MONTHS[month]} {year}
            </p>
            <button
              onClick={nextMonth}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7">
            {WEEKDAYS.map((d, i) => (
              <div
                key={d}
                className={cn(
                  "pb-1.5 text-center text-[10px] font-semibold uppercase tracking-wider",
                  i === 0 || i === 6 ? "text-muted-foreground/60" : "text-muted-foreground"
                )}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-x-0.5 gap-y-0.5">
            {calDays.map(({ key, date, currentMonth }) => {
              const dayTasks = tasksByDate[key] ?? [];
              const isToday = key === todayKey;
              const isSelected = key === selectedKey;
              const hasHighPriority = dayTasks.some((t) => !t.done && t.priority === "high");
              const pendingCount = dayTasks.filter((t) => !t.done).length;
              const doneCount = dayTasks.filter((t) => t.done).length;

              return (
                <div key={key} className="px-0.5">
                <button
                  onClick={() => setSelectedKey(isSelected ? null : key)}
                  className={cn(
                    "relative flex h-9 w-full flex-col items-center justify-center gap-0.5 rounded-lg text-xs transition-colors",
                    currentMonth ? "text-foreground" : "text-muted-foreground/30",
                    !currentMonth && "pointer-events-none",
                    isSelected && "bg-primary text-primary-foreground",
                    !isSelected && isToday && "bg-primary/15 font-bold text-primary ring-1 ring-inset ring-primary/40",
                    !isSelected && !isToday && currentMonth && "hover:bg-secondary/60"
                  )}
                >
                  <span className="leading-none">{date.getDate()}</span>
                  {dayTasks.length > 0 && (
                    <div className="flex gap-0.5">
                      {pendingCount > 0 && (
                        <span className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          isSelected
                            ? "bg-primary-foreground"
                            : hasHighPriority
                              ? "bg-red-400"
                              : "bg-primary"
                        )} />
                      )}
                      {doneCount > 0 && (
                        <span className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          isSelected ? "bg-primary-foreground/50" : "bg-muted-foreground/60"
                        )} />
                      )}
                    </div>
                  )}
                </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Task list */}
        <div className="border-t border-border px-5 pb-6 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {selectedKey
                ? `${copy.calendar.tasksFor} ${new Date(selectedKey + "T12:00:00").toLocaleDateString(language === "es" ? "es-AR" : undefined, { day: "numeric", month: "long" })}`
                : copy.calendar.allTasks}
            </p>
            {selectedKey && (
              <button
                onClick={() => setSelectedKey(null)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {copy.calendar.viewAll}
              </button>
            )}
          </div>

          {displayedTasks.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {selectedKey ? copy.calendar.noTasksDay : copy.calendar.noTasksSaved}
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {displayedTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  language={language}
                  isMutating={isMutating}
                  isRecommended={task.id === recommendedTask?.id}
                  onToggle={() => void onToggleTask(task.id)}
                  onEdit={() => onEditTask(task.id)}
                  onDelete={() => void onDeleteTask(task.id)}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

type TaskRowProps = {
  task: Task;
  language: import("@/lib/i18n").AppLanguage;
  isMutating: boolean;
  isRecommended: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

function TaskRow({ task, language, isMutating, isRecommended, onToggle, onEdit, onDelete }: TaskRowProps) {
  return (
    <li
      className={cn(
        "group flex items-start gap-3 rounded-xl border p-3 transition-colors",
        isRecommended ? "border-primary/40 bg-primary/5" : "border-border hover:border-border/80 hover:bg-secondary/30"
      )}
    >
      <button
        onClick={onToggle}
        disabled={isMutating}
        className="mt-0.5 flex-shrink-0 text-muted-foreground transition-colors hover:text-primary disabled:opacity-50"
        aria-label={task.done ? "Marcar pendiente" : "Marcar hecho"}
      >
        {task.done
          ? <CheckCircle2 className="h-4 w-4 text-primary" />
          : <Circle className="h-4 w-4" />}
      </button>

      <div className="min-w-0 flex-1">
        <p className={cn("text-sm font-medium leading-snug", task.done && "line-through text-muted-foreground")}>
          {task.title}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground">{task.category}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">
            {getDueDateLabel(task.dueDate, language)} · {formatDueDate(task.dueDate, language)}
          </span>
          <PriorityPill priority={task.priority} />
        </div>
      </div>

      <div className="flex flex-shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={onEdit}
          disabled={isMutating}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          aria-label="Editar"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onDelete}
          disabled={isMutating}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
          aria-label="Eliminar"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </li>
  );
}

function PriorityPill({ priority }: { priority: Task["priority"] }) {
  const labels: Record<Task["priority"], string> = { high: "Alta", medium: "Media", low: "Baja" };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
        priority === "high" && "bg-red-500/15 text-red-400",
        priority === "medium" && "bg-amber-500/15 text-amber-400",
        priority === "low" && "bg-muted/60 text-muted-foreground"
      )}
    >
      {labels[priority]}
    </span>
  );
}

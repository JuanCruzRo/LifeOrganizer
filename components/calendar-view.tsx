"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Plus, CheckCircle2, Circle, Pencil, Trash2, Sparkles } from "lucide-react";
import { useAppLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { MiloLoader } from "@/components/milo-loader";
import { cn } from "@/lib/utils";
import { formatDueDate, getDueDateLabel } from "@/lib/task-date";
import { getTaskPriorityLabel } from "@/lib/task-labels";
import { AiPriorityRecommendation } from "@/types/ai-priority";
import { Task } from "@/types/task";

// Weekday / month names come from Intl so they follow the app language.
function getWeekdayLabels(language: string) {
  const fmt = new Intl.DateTimeFormat(language, { weekday: "short" });
  // 2023-01-01 was a Sunday; the grid starts on Sunday.
  return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2023, 0, 1 + i)).replace(/\.$/, ""));
}

function getMonthLabel(language: string, year: number, month: number) {
  const label = new Intl.DateTimeFormat(language, { month: "long", year: "numeric" }).format(new Date(year, month, 1));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

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
  const [calendarOpen, setCalendarOpen] = useState(true);
  const [showDone, setShowDone] = useState(false);

  // Small screens start with the calendar collapsed so the task list is visible right away.
  useEffect(() => {
    if (window.innerWidth < 1024) setCalendarOpen(false);
  }, []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const calDays = getCalendarDays(year, month);
  const weekdays = getWeekdayLabels(language);

  const tasksByDate = allTasks.reduce<Record<string, Task[]>>((acc, task) => {
    if (!task.dueDate) return acc;
    if (!acc[task.dueDate]) acc[task.dueDate] = [];
    acc[task.dueDate].push(task);
    return acc;
  }, {});

  const pendingCount = useMemo(() => allTasks.filter((t) => !t.done).length, [allTasks]);

  // Pending first (soonest due date first); completed ones after, most recent first.
  const byDueAsc = (a: Task, b: Task) => (a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0);
  const byDoneDesc = (a: Task, b: Task) =>
    (b.completedAt ?? b.dueDate).localeCompare(a.completedAt ?? a.dueDate);

  const dayTasksSelected = selectedKey ? (tasksByDate[selectedKey] ?? []) : null;
  const pendingList = (dayTasksSelected ?? allTasks).filter((t) => !t.done).sort(byDueAsc);
  const doneList = (dayTasksSelected ?? allTasks).filter((t) => t.done).sort(byDoneDesc);
  const displayedTasks = [...pendingList, ...(selectedKey || showDone ? doneList : [])];

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
            {pendingCount} {copy.taskList.pending.toLowerCase()}
          </p>
        </div>
        <Button size="sm" onClick={onAddTask} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          {copy.calendar.newTask}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* AI recommendation — the star of the screen */}
        {(recommendedTask || isAiLoading) && (
          <div className="px-5 pt-4">
            {isAiLoading ? (
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-4 text-sm text-muted-foreground">
                <MiloLoader />
                <span>{copy.calendar.analyzingTasks}</span>
              </div>
            ) : recommendedTask ? (
              <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 sm:p-5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md bg-primary/20 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-widest text-primary">
                    <Sparkles className="h-3 w-3" />
                    IA
                  </span>
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary/90">
                    {copy.calendar.todayRecommendation}
                  </p>
                </div>
                <p className="mt-3 text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
                  {recommendedTask.title}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{recommendedTask.category}</span>
                  <span>·</span>
                  <span>{getDueDateLabel(recommendedTask.dueDate, language)}</span>
                  <PriorityPill priority={recommendedTask.priority} language={language} />
                </div>
                {aiRecommendation?.recommendationReason && (
                  <p className="mt-3 text-sm leading-relaxed text-foreground/80">
                    {aiRecommendation.recommendationReason}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" disabled={isMutating} onClick={() => void onToggleTask(recommendedTask.id)} className="gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    {copy.taskList.markDone}
                  </Button>
                  <Button size="sm" variant="outline" disabled={isMutating} onClick={() => onEditTask(recommendedTask.id)}>
                    {copy.taskList.edit}
                  </Button>
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
              disabled={!calendarOpen}
              aria-label="‹"
              className={cn("rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground", !calendarOpen && "invisible")}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-sm font-semibold">
              {getMonthLabel(language, year, month)}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCalendarOpen((v) => !v)}
                aria-expanded={calendarOpen}
                aria-label={getMonthLabel(language, year, month)}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {calendarOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              <button
                onClick={nextMonth}
                disabled={!calendarOpen}
                aria-label="›"
                className={cn("rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground", !calendarOpen && "invisible")}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {calendarOpen && (<>
          {/* Weekday headers */}
          <div className="grid grid-cols-7">
            {weekdays.map((d, i) => (
              <div
                key={d}
                className={cn(
                  "pb-1.5 text-center text-[11px] font-semibold uppercase tracking-wider",
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
          </>)}
        </div>

        {/* Task list */}
        <div className="border-t border-border px-5 pb-6 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {selectedKey
                ? `${copy.calendar.tasksFor} ${new Date(selectedKey + "T12:00:00").toLocaleDateString(language, { day: "numeric", month: "long" })}`
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

          {!selectedKey && doneList.length > 0 && (
            <button
              onClick={() => setShowDone((v) => !v)}
              aria-expanded={showDone}
              className="mt-4 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
            >
              {showDone ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              {copy.taskList.completed} ({doneList.length})
            </button>
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
  const { copy } = useAppLanguage();
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
        aria-label={task.done ? copy.taskList.markPending : copy.taskList.markDone}
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
          <PriorityPill priority={task.priority} language={language} />
        </div>
      </div>

      <div className="flex flex-shrink-0 gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
        <button
          onClick={onEdit}
          disabled={isMutating}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          aria-label={copy.taskList.edit}
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onDelete}
          disabled={isMutating}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
          aria-label={copy.common.delete}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </li>
  );
}

function PriorityPill({ priority, language }: { priority: Task["priority"]; language: import("@/lib/i18n").AppLanguage }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
        priority === "high" && "bg-red-500/15 text-red-400",
        priority === "medium" && "bg-amber-500/15 text-amber-400",
        priority === "low" && "bg-muted/60 text-muted-foreground"
      )}
    >
      {getTaskPriorityLabel(priority, language)}
    </span>
  );
}

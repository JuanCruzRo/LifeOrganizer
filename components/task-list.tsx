"use client";

import { useAppLanguage } from "@/components/language-provider";
import { formatDueDate, getDueDateLabel } from "@/lib/task-date";
import { getTaskDurationLabel, getTaskPriorityLabel } from "@/lib/task-labels";
import { Task } from "@/types/task";

type TaskListProps = {
  completedTasks: Task[];
  isMutating?: boolean;
  pendingTasks: Task[];
  onDeleteTask: (taskId: string) => Promise<void>;
  onEditTask: (taskId: string) => void;
  onToggleTask: (taskId: string) => Promise<void>;
};

export function TaskList({
  completedTasks,
  isMutating = false,
  pendingTasks,
  onDeleteTask,
  onEditTask,
  onToggleTask
}: TaskListProps) {
  const { copy, language } = useAppLanguage();

  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_10px_30px_rgba(24,36,28,0.06)] backdrop-blur">
      <div className="flex flex-col gap-8">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--muted)]">
            {copy.taskList.title}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            {copy.taskList.subtitle}
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <TaskGroup
            emptyMessage={copy.taskList.noPending}
            isMutating={isMutating}
            language={language}
            tasks={pendingTasks}
            title={copy.taskList.pending}
            onDeleteTask={onDeleteTask}
            onEditTask={onEditTask}
            onToggleTask={onToggleTask}
          />
          <TaskGroup
            emptyMessage={copy.taskList.noCompleted}
            isMutating={isMutating}
            language={language}
            tasks={completedTasks}
            title={copy.taskList.completed}
            onDeleteTask={onDeleteTask}
            onEditTask={onEditTask}
            onToggleTask={onToggleTask}
          />
        </div>
      </div>
    </section>
  );
}

type TaskGroupProps = {
  emptyMessage: string;
  isMutating: boolean;
  language: "en" | "es";
  tasks: Task[];
  title: string;
  onDeleteTask: (taskId: string) => Promise<void>;
  onEditTask: (taskId: string) => void;
  onToggleTask: (taskId: string) => Promise<void>;
};

function TaskGroup({
  emptyMessage,
  isMutating,
  language,
  tasks,
  title,
  onDeleteTask,
  onEditTask,
  onToggleTask
}: TaskGroupProps) {
  const { copy } = useAppLanguage();

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white/65 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-medium text-[var(--foreground)]">
          {tasks.length}
        </span>
      </div>

      {tasks.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--muted)]">{emptyMessage}</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {tasks.map((task) => (
            <li
              className="rounded-2xl border border-[var(--border)] bg-white p-4"
              key={task.id}
            >
              <div className="flex flex-col gap-4 sm:grid sm:grid-cols-[minmax(0,1fr)_11rem] sm:items-start">
                <div className="min-w-0 pr-0 sm:pr-2">
                  <p className="text-base font-semibold">{task.title}</p>
                  {task.description ? (
                    <p className="mt-1 text-sm text-[var(--foreground)]/80">
                      {task.description}
                    </p>
                  ) : null}
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {task.category} · {getTaskPriorityLabel(task.priority, language)} ·{" "}
                    {getTaskDurationLabel(task.duration, language)} · {getDueDateLabel(task.dueDate, language)} ·{" "}
                    {formatDueDate(task.dueDate, language)}
                  </p>
                </div>

                <div className="grid w-full shrink-0 gap-2 sm:w-44">
                  <button
                    className="min-h-11 rounded-xl border border-[var(--border)] px-3 py-2 text-center text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--accent)] hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={isMutating}
                    onClick={() => onEditTask(task.id)}
                    type="button"
                  >
                    {copy.taskList.edit}
                  </button>
                  <button
                    className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--accent-soft)] px-3 py-2 text-center text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--card)] disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={isMutating}
                    onClick={() => void onToggleTask(task.id)}
                    type="button"
                  >
                    {task.done ? copy.taskList.markPending : copy.taskList.markDone}
                  </button>
                  <button
                    className="min-h-11 rounded-xl border border-[var(--accent)] px-3 py-2 text-center text-sm font-medium text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-[var(--card)] disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={isMutating}
                    onClick={() => void onDeleteTask(task.id)}
                    type="button"
                  >
                    {copy.common.delete}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

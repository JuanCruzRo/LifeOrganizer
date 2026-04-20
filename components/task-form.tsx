"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAppLanguage } from "@/components/language-provider";
import { getTodayDateValue } from "@/lib/task-date";
import { TaskDuration, TaskInput, TaskPriority } from "@/types/task";

type TaskFormProps = {
  initialValues?: TaskInput;
  isSubmitting?: boolean;
  mode?: "create" | "edit";
  onCancel?: () => void;
  onSubmitTask: (task: TaskInput) => Promise<boolean>;
};

const initialFormValues: TaskInput = {
  title: "",
  category: "",
  description: "",
  priority: "medium" as TaskPriority,
  duration: "medium" as TaskDuration,
  dueDate: ""
};

function buildFormValues(initialValues: TaskInput | undefined, todayDateValue: string): TaskInput {
  return {
    ...initialFormValues,
    ...initialValues,
    dueDate: initialValues?.dueDate ?? todayDateValue
  };
}

export function TaskForm({
  initialValues,
  isSubmitting = false,
  mode = "create",
  onCancel,
  onSubmitTask
}: TaskFormProps) {
  const { copy } = useAppLanguage();
  const todayDateValue = getTodayDateValue();
  const resolvedInitialValues = buildFormValues(initialValues, todayDateValue);
  const [title, setTitle] = useState(resolvedInitialValues.title);
  const [category, setCategory] = useState(resolvedInitialValues.category);
  const [description, setDescription] = useState(resolvedInitialValues.description);
  const [priority, setPriority] = useState<TaskPriority>(resolvedInitialValues.priority);
  const [duration, setDuration] = useState<TaskDuration>(resolvedInitialValues.duration);
  const [dueDate, setDueDate] = useState(resolvedInitialValues.dueDate);

  useEffect(() => {
    setTitle(resolvedInitialValues.title);
    setCategory(resolvedInitialValues.category);
    setDescription(resolvedInitialValues.description);
    setPriority(resolvedInitialValues.priority);
    setDuration(resolvedInitialValues.duration);
    setDueDate(resolvedInitialValues.dueDate);
  }, [
    resolvedInitialValues.category,
    resolvedInitialValues.description,
    resolvedInitialValues.dueDate,
    resolvedInitialValues.duration,
    resolvedInitialValues.priority,
    resolvedInitialValues.title
  ]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedCategory = category.trim();

    if (!trimmedTitle || !trimmedCategory || !dueDate) {
      return;
    }

    const didSave = await onSubmitTask({
      title: trimmedTitle,
      category: trimmedCategory,
      description: description.trim(),
      priority,
      duration,
      dueDate
    });

    if (didSave && mode === "create") {
      const nextValues = buildFormValues(undefined, todayDateValue);

      setTitle(nextValues.title);
      setCategory(nextValues.category);
      setDescription(nextValues.description);
      setPriority(nextValues.priority);
      setDuration(nextValues.duration);
      setDueDate(nextValues.dueDate);
    }
  }

  return (
    <section className="self-start rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_10px_30px_rgba(24,36,28,0.06)] backdrop-blur">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--muted)]">
        {mode === "edit" ? copy.taskForm.editTask : copy.taskForm.newTask}
      </p>
      <form className="mt-5 flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">{copy.taskForm.title}</span>
          <input
            className="rounded-xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
            disabled={isSubmitting}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={copy.taskForm.titlePlaceholder}
            type="text"
            value={title}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">{copy.taskForm.category}</span>
          <input
            className="rounded-xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
            disabled={isSubmitting}
            onChange={(event) => setCategory(event.target.value)}
            placeholder={copy.taskForm.categoryPlaceholder}
            type="text"
            value={category}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">{copy.taskForm.description}</span>
          <textarea
            className="min-h-28 rounded-xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
            disabled={isSubmitting}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={copy.taskForm.descriptionPlaceholder}
            value={description}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="flex min-w-0 flex-col gap-2">
            <span className="flex min-h-14 items-end text-sm font-medium">
              {copy.taskForm.priority}
            </span>
            <select
              className="min-h-13 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
              disabled={isSubmitting}
              onChange={(event) => setPriority(event.target.value as TaskPriority)}
              value={priority}
            >
              <option value="low">{copy.taskForm.priorities.low}</option>
              <option value="medium">{copy.taskForm.priorities.medium}</option>
              <option value="high">{copy.taskForm.priorities.high}</option>
            </select>
          </label>

          <label className="flex min-w-0 flex-col gap-2">
            <span className="flex min-h-14 items-end text-sm font-medium">
              {copy.taskForm.duration}
            </span>
            <select
              className="min-h-13 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
              disabled={isSubmitting}
              onChange={(event) => setDuration(event.target.value as TaskDuration)}
              value={duration}
            >
              <option value="short">{copy.taskForm.durations.short}</option>
              <option value="medium">{copy.taskForm.durations.medium}</option>
              <option value="long">{copy.taskForm.durations.long}</option>
            </select>
          </label>

          <label className="flex min-w-0 flex-col gap-2">
            <span className="flex min-h-14 items-end text-sm font-medium">
              {copy.taskForm.dueDate}
            </span>
            <input
              className="min-h-13 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
              disabled={isSubmitting}
              min={mode === "create" ? todayDateValue : undefined}
              onChange={(event) => setDueDate(event.target.value)}
              type="date"
              value={dueDate}
            />
          </label>
        </div>

        <div className="mt-2 flex flex-wrap gap-3">
          <button
            className="rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-medium text-[var(--card)] transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting
              ? mode === "edit"
                ? copy.common.saving
                : copy.common.adding
              : mode === "edit"
                ? copy.taskForm.editSubmit
                : copy.taskForm.addTask}
          </button>
          {mode === "edit" && onCancel ? (
            <button
              className="rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting}
              onClick={onCancel}
              type="button"
            >
              {copy.common.cancel}
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
}

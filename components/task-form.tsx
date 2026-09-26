"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAppLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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

    if (!trimmedTitle) {
      return;
    }

    const didSave = await onSubmitTask({
      title: trimmedTitle,
      category: trimmedCategory || "general",
      description: description.trim(),
      priority,
      duration,
      dueDate: dueDate || todayDateValue
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
    <section className="self-start rounded-2xl border border-border bg-card p-6 shadow-lg">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {mode === "edit" ? copy.taskForm.editTask : copy.taskForm.newTask}
      </p>
      <form className="mt-5 flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <Label htmlFor="task-title">{copy.taskForm.title}</Label>
          <Input
            id="task-title"
            disabled={isSubmitting}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={copy.taskForm.titlePlaceholder}
            type="text"
            value={title}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="task-category">{copy.taskForm.category}</Label>
          <Input
            id="task-category"
            disabled={isSubmitting}
            onChange={(e) => setCategory(e.target.value)}
            placeholder={copy.taskForm.categoryPlaceholder}
            type="text"
            value={category}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="task-description">{copy.taskForm.description}</Label>
          <Textarea
            id="task-description"
            className="min-h-28"
            disabled={isSubmitting}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={copy.taskForm.descriptionPlaceholder}
            value={description}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex min-w-0 flex-col gap-2">
            <Label className="flex min-h-10 items-end" htmlFor="task-priority">
              {copy.taskForm.priority}
            </Label>
            <Select
              id="task-priority"
              disabled={isSubmitting}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              value={priority}
            >
              <option value="low">{copy.taskForm.priorities.low}</option>
              <option value="medium">{copy.taskForm.priorities.medium}</option>
              <option value="high">{copy.taskForm.priorities.high}</option>
            </Select>
          </div>

          <div className="flex min-w-0 flex-col gap-2">
            <Label className="flex min-h-10 items-end" htmlFor="task-duration">
              {copy.taskForm.duration}
            </Label>
            <Select
              id="task-duration"
              disabled={isSubmitting}
              onChange={(e) => setDuration(e.target.value as TaskDuration)}
              value={duration}
            >
              <option value="short">{copy.taskForm.durations.short}</option>
              <option value="medium">{copy.taskForm.durations.medium}</option>
              <option value="long">{copy.taskForm.durations.long}</option>
            </Select>
          </div>

          <div className="flex min-w-0 flex-col gap-2">
            <Label className="flex min-h-10 items-end" htmlFor="task-due-date">
              {copy.taskForm.dueDate}
            </Label>
            <Input
              id="task-due-date"
              className="h-10"
              disabled={isSubmitting}
              min={mode === "create" ? todayDateValue : undefined}
              onChange={(e) => setDueDate(e.target.value)}
              type="date"
              value={dueDate}
            />
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-3">
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting
              ? mode === "edit"
                ? copy.common.saving
                : copy.common.adding
              : mode === "edit"
                ? copy.taskForm.editSubmit
                : copy.taskForm.addTask}
          </Button>
          {mode === "edit" && onCancel ? (
            <Button
              disabled={isSubmitting}
              onClick={onCancel}
              type="button"
              variant="outline"
            >
              {copy.common.cancel}
            </Button>
          ) : null}
        </div>
      </form>
    </section>
  );
}

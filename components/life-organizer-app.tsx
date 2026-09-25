"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { BarChart3, LogOut, Zap, X, ArrowUpRight } from "lucide-react";
import { CalendarView } from "@/components/calendar-view";
import { useAuth } from "@/components/auth-gate";
import { useAppLanguage } from "@/components/language-provider";
import { MiloChat } from "@/components/milo-chat";
import { PlanZapIcon } from "@/components/plan-zap-icon";
import { getUserDisplayName } from "@/lib/auth";
import { TaskForm } from "@/components/task-form";
import { Button } from "@/components/ui/button";
import { TextAnimate } from "@/components/ui/text-animate";
import { formatTodayLongDate } from "@/lib/task-date";
import { useUserPlan } from "@/lib/use-user-plan";
import { AiPriorityApiResponse, AiPriorityRecommendation } from "@/types/ai-priority";
import { Task, TaskInput } from "@/types/task";

const FALLBACK_STORAGE_ERROR_MESSAGE = "An unexpected error occurred.";
const FREE_PLAN_LIMIT_PREFIX = "FREE_PLAN_LIMIT:";

export function LifeOrganizerApp() {
  const { copy, language } = useAppLanguage();
  const { user, logout } = useAuth();
  const displayName = getUserDisplayName(user);
  const { plan, trialDaysLeft } = useUserPlan();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [storageError, setStorageError] = useState("");
  const [taskLimitReached, setTaskLimitReached] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<AiPriorityRecommendation | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const aiRecommendationCacheRef = useRef(new Map<string, AiPriorityRecommendation>());
  const todayLabel = formatTodayLongDate(language);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch("/api/tasks");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { tasks: Task[] };
        if (active) { setTasks(data.tasks); setStorageError(""); }
      } catch (err) {
        if (active) setStorageError(getErrorMessage(err, FALLBACK_STORAGE_ERROR_MESSAGE));
      } finally {
        if (active) setIsLoaded(true);
      }
    }
    void load();
    return () => { active = false; };
  }, []);

  const pendingTasks = useMemo(() => tasks.filter((t) => !t.done), [tasks]);

  const aiRequestTasks = useMemo(() =>
    [...pendingTasks]
      .map(({ id, title, category, description, priority, duration, dueDate }) =>
        ({ id, title, category, description, priority, duration, dueDate })
      )
      .sort((a, b) => a.id.localeCompare(b.id)),
    [pendingTasks]
  );

  const aiRequestKey = useMemo(() =>
    JSON.stringify({ language, tasks: aiRequestTasks }),
    [aiRequestTasks, language]
  );

  useEffect(() => {
    if (!isLoaded) return;
    if (pendingTasks.length === 0) { setAiRecommendation(null); setIsAiLoading(false); return; }

    const cached = aiRecommendationCacheRef.current.get(aiRequestKey);
    if (cached) { setAiRecommendation(cached); setIsAiLoading(false); return; }

    setAiRecommendation(null);
    setIsAiLoading(true);
    const ctrl = new AbortController();

    async function loadRec() {
      try {
        const res = await fetch("/api/ai-priority", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tasks: aiRequestTasks, uiLanguage: language }),
          signal: ctrl.signal
        });
        const data = (await res.json()) as AiPriorityApiResponse;
        if (data.enabled && data.recommendation) {
          aiRecommendationCacheRef.current.set(aiRequestKey, data.recommendation);
          setAiRecommendation(data.recommendation);
        } else {
          setAiRecommendation(null);
        }
      } catch {
        if (!ctrl.signal.aborted) setAiRecommendation(null);
      } finally {
        if (!ctrl.signal.aborted) setIsAiLoading(false);
      }
    }
    void loadRec();
    return () => ctrl.abort();
  }, [aiRequestKey, aiRequestTasks, isLoaded, language, pendingTasks.length]);

  const editingTask = editingTaskId ? tasks.find((t) => t.id === editingTaskId) ?? null : null;

  async function handleCreateTask(input: TaskInput) {
    setIsSyncing(true);
    try {
      const newTask: Task = { id: crypto.randomUUID(), ...input, done: false };
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask)
      });
      if (res.status === 403) {
        setTaskLimitReached(true);
        setStorageError("");
        return false;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { task: Task };
      setTasks((prev) => [data.task, ...prev]);
      setStorageError("");
      setTaskLimitReached(false);
      return true;
    } catch (err) {
      setStorageError(getErrorMessage(err, copy.errors.unexpected));
      setTaskLimitReached(false);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }

  async function handleUpdateTask(input: TaskInput) {
    if (!editingTaskId) return false;
    const current = tasks.find((t) => t.id === editingTaskId);
    if (!current) { setEditingTaskId(null); return false; }
    setIsSyncing(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...current, ...input })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { task: Task };
      setTasks((prev) => prev.map((t) => (t.id === data.task.id ? data.task : t)));
      setEditingTaskId(null);
      setShowForm(false);
      setStorageError("");
      return true;
    } catch (err) {
      setStorageError(getErrorMessage(err, copy.errors.unexpected));
      return false;
    } finally {
      setIsSyncing(false);
    }
  }

  async function handleToggleTask(taskId: string) {
    const current = tasks.find((t) => t.id === taskId);
    if (!current) return;
    setIsSyncing(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, done: !current.done })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { task: Task };
      setTasks((prev) => prev.map((t) => (t.id === data.task.id ? data.task : t)));
      setStorageError("");
    } catch (err) {
      setStorageError(getErrorMessage(err, copy.errors.unexpected));
    } finally {
      setIsSyncing(false);
    }
  }

  async function handleDeleteTask(taskId: string) {
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/tasks?id=${encodeURIComponent(taskId)}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (editingTaskId === taskId) { setEditingTaskId(null); setShowForm(false); }
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      setStorageError("");
    } catch (err) {
      setStorageError(getErrorMessage(err, copy.errors.unexpected));
    } finally {
      setIsSyncing(false);
    }
  }

  function handleAddTask() {
    setEditingTaskId(null);
    setShowForm(true);
  }

  function handleEditTask(taskId: string) {
    if (isSyncing) return;
    setEditingTaskId(taskId);
    setShowForm(true);
  }

  function handleCloseForm() {
    setEditingTaskId(null);
    setShowForm(false);
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Header */}
      <header className="flex flex-shrink-0 items-center justify-between gap-4 border-b border-border px-5 py-3">
        <div className="flex items-center gap-3">
          <div>
            <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {copy.header.title}
              <PlanZapIcon plan={plan} />
            </p>
            <h1 className="text-lg font-semibold tracking-tight"><TextAnimate text={todayLabel} /></h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {plan === "free" ? (
            <Link
              href="/plans"
              className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:border-primary/50 hover:bg-primary/20"
            >
              <Zap className="h-3 w-3" />
              {copy.headerNav.plans}
            </Link>
          ) : (
            <Link
              href="/plans"
              className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:border-primary/50 hover:bg-primary/20"
            >
              <Zap className="h-3 w-3" />
              {plan === "pro" ? "Pro" : "Plus"}
              {trialDaysLeft !== null && (
                <span className="text-primary/70">· {trialDaysLeft}d</span>
              )}
            </Link>
          )}

          {plan === "pro" && (
            <Link
              href="/stats"
              className="flex items-center gap-1.5 rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label={copy.stats.title}
              title={copy.stats.title}
            >
              <BarChart3 className="h-4 w-4" />
            </Link>
          )}

          <div className="mx-1 h-6 w-px bg-border" />

          <div className="hidden items-center gap-2.5 sm:flex">
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-xs font-semibold text-primary">
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={displayName}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                getInitials(displayName)
              )}
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs text-muted-foreground">{copy.headerNav.greeting}</span>
              <span className="text-sm font-medium text-foreground">{displayName}</span>
            </div>
          </div>

          <button
            onClick={() => void logout()}
            className="flex items-center gap-1.5 rounded-full p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            aria-label={copy.headerNav.logoutLabel}
            title={copy.headerNav.logoutLabel}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {storageError && (
        <div className="flex-shrink-0 border-b border-border bg-destructive/10 px-5 py-2 text-xs text-destructive">
          {storageError}
        </div>
      )}

      {taskLimitReached && (
        <div className="flex-shrink-0 border-b border-border bg-amber-500/10 px-5 py-2 text-xs text-amber-700 dark:text-amber-400 flex items-center justify-between gap-3">
          <span>{copy.plans.taskLimitReached}</span>
          <Link
            href="/plans"
            className="flex items-center gap-1 font-semibold underline underline-offset-2 hover:opacity-80 whitespace-nowrap"
          >
            {copy.plans.upgradeToPro}
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* Main two-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Milo chat */}
        <MiloChat tasks={tasks} onCreateTask={handleCreateTask} />

        {/* Right: Calendar + tasks */}
        <main className="flex-1 overflow-hidden">
          <CalendarView
            allTasks={tasks}
            isMutating={isSyncing}
            aiRecommendation={aiRecommendation}
            isAiLoading={isAiLoading}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleEditTask}
            onToggleTask={handleToggleTask}
          />
        </main>
      </div>

      {/* Task form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCloseForm}
              className="absolute -right-2 -top-2 z-10 h-8 w-8 rounded-full bg-secondary"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </Button>
            <TaskForm
              initialValues={editingTask ? {
                title: editingTask.title,
                category: editingTask.category,
                description: editingTask.description,
                priority: editingTask.priority,
                duration: editingTask.duration,
                dueDate: editingTask.dueDate
              } : undefined}
              isSubmitting={isSyncing}
              mode={editingTask ? "edit" : "create"}
              onCancel={handleCloseForm}
              onSubmitTask={editingTask ? handleUpdateTask : handleCreateTask}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { BarChart3, Bell, LogOut, Zap, X, ArrowUpRight, ListChecks, MessageCircle, PanelLeft } from "lucide-react";
import { CalendarView } from "@/components/calendar-view";
import { FocusMode } from "@/components/focus-mode";
import { useAuth } from "@/components/auth-gate";
import { useAppLanguage } from "@/components/language-provider";
import { MiloChat } from "@/components/milo-chat";
import { PlanZapIcon } from "@/components/plan-zap-icon";
import { getUserDisplayName } from "@/lib/auth";
import { TaskForm } from "@/components/task-form";
import { Button } from "@/components/ui/button";
import { TextAnimate } from "@/components/ui/text-animate";
import { formatTodayLongDate } from "@/lib/task-date";
import { celebrate } from "@/lib/celebrate";
import { focusCopy, reminderCopy } from "@/lib/focus-copy";
import { useReminders } from "@/lib/use-reminders";
import { useUserPlan } from "@/lib/use-user-plan";
import { cn } from "@/lib/utils";
import { AiPriorityApiResponse, AiPriorityRecommendation } from "@/types/ai-priority";
import { Task, TaskInput, TaskStep } from "@/types/task";

const FALLBACK_STORAGE_ERROR_MESSAGE = "An unexpected error occurred.";
const FREE_PLAN_LIMIT_PREFIX = "FREE_PLAN_LIMIT:";
const CHAT_OPEN_KEY = "spark-chat-open";

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
  // On small screens the tasks and the Milo chat are separate tabs; on desktop both are visible.
  const [mobileTab, setMobileTab] = useState<"tasks" | "chat">("tasks");
  const [focusTaskId, setFocusTaskId] = useState<string | null>(null);
  const [breakingDownTaskId, setBreakingDownTaskId] = useState<string | null>(null);
  // Desktop only: the chat can be put away so the screen holds one thing at a time.
  const [chatOpen, setChatOpen] = useState(true);

  useEffect(() => {
    try {
      setChatOpen(localStorage.getItem(CHAT_OPEN_KEY) !== "0");
    } catch {
      /* storage can be blocked */
    }
  }, []);

  function toggleChat(next: boolean) {
    setChatOpen(next);
    try {
      localStorage.setItem(CHAT_OPEN_KEY, next ? "1" : "0");
    } catch {
      /* storage can be blocked */
    }
  }

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

  const reminders = useReminders(tasks, language, isLoaded, user.id);
  const focusTask = focusTaskId ? tasks.find((t) => t.id === focusTaskId) ?? null : null;
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
    if (!current.done) void celebrate("task");
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

  // Persists a task and keeps local state in sync. Used by steps + focus mode.
  async function persistTask(next: Task) {
    setTasks((prev) => prev.map((t) => (t.id === next.id ? next : t)));
    try {
      const res = await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { task: Task };
      setTasks((prev) => prev.map((t) => (t.id === data.task.id ? data.task : t)));
    } catch (err) {
      setStorageError(getErrorMessage(err, copy.errors.unexpected));
    }
  }

  async function handleBreakDown(taskId: string) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || breakingDownTaskId) return;
    setBreakingDownTaskId(taskId);
    try {
      const res = await fetch("/api/ai-task-steps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, uiLanguage: language })
      });
      const data = (await res.json()) as { steps?: string[] };
      if (!res.ok || !data.steps?.length) {
        setStorageError(res.status === 429 ? focusCopy[language].limit : focusCopy[language].aiError);
        return;
      }
      const steps: TaskStep[] = data.steps.map((text) => ({ id: crypto.randomUUID(), text, done: false }));
      setStorageError("");
      await persistTask({ ...task, steps });
    } catch {
      setStorageError(focusCopy[language].aiError);
    } finally {
      setBreakingDownTaskId(null);
    }
  }

  function handleToggleStep(taskId: string, stepId: string) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task?.steps) return;
    const steps = task.steps.map((s) => (s.id === stepId ? { ...s, done: !s.done } : s));
    const justCompleted = task.steps.find((s) => s.id === stepId)?.done === false;
    if (justCompleted) void celebrate(steps.every((s) => s.done) ? "task" : "step");
    void persistTask({ ...task, steps });
  }

  // Capture with just a title: everything else gets a sensible default.
  async function handleQuickAdd(title: string) {
    await handleCreateTask({
      title,
      category: "general",
      description: "",
      priority: "medium",
      duration: "medium",
      dueDate: new Date().toISOString().slice(0, 10)
    });
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
    <div className="flex h-dvh flex-col overflow-hidden">
      {/* Header */}
      <header className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3 sm:gap-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={() => toggleChat(!chatOpen)}
            aria-expanded={chatOpen}
            aria-label={copy.milo.name}
            title={copy.milo.name}
            className="hidden flex-shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground lg:block"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {copy.header.title}
              <PlanZapIcon plan={plan} />
            </p>
            <h1 className="text-base font-semibold tracking-tight sm:text-lg"><TextAnimate text={todayLabel} /></h1>
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

          {reminders.permission !== "unsupported" && !reminders.optedIn && reminders.permission !== "denied" && (
            <button
              onClick={() => void reminders.enable()}
              className="flex items-center gap-1.5 rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label={reminderCopy[language].enable}
              title={reminderCopy[language].enable}
            >
              <Bell className="h-4 w-4" />
            </button>
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
        <div
          className={cn(
            "min-h-0 w-full overflow-hidden transition-[width] duration-300 ease-in-out lg:flex lg:flex-shrink-0",
            mobileTab === "chat" ? "flex" : "hidden",
            chatOpen ? "lg:w-[360px]" : "lg:w-0"
          )}
        >
          <div className="flex w-full lg:w-[360px] lg:flex-shrink-0">
            <MiloChat tasks={tasks} onCreateTask={handleCreateTask} />
          </div>
        </div>

        {/* Right: Calendar + tasks */}
        <main className={cn("min-w-0 flex-1 overflow-hidden lg:block", mobileTab === "tasks" ? "block" : "hidden")}>
          <CalendarView
            allTasks={tasks}
            isMutating={isSyncing}
            aiRecommendation={aiRecommendation}
            isAiLoading={isAiLoading}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleEditTask}
            onToggleTask={handleToggleTask}
            onFocusTask={setFocusTaskId}
            onBreakDown={handleBreakDown}
            breakingDownTaskId={breakingDownTaskId}
            onQuickAdd={handleQuickAdd}
          />
        </main>
      </div>

      {focusTask && (
        <FocusMode
          task={focusTask}
          isPro={plan === "pro"}
          isBreaking={breakingDownTaskId === focusTask.id}
          onClose={() => setFocusTaskId(null)}
          onBreakDown={() => void handleBreakDown(focusTask.id)}
          onToggleStep={(stepId) => handleToggleStep(focusTask.id, stepId)}
          onCompleteTask={() => { void handleToggleTask(focusTask.id); setFocusTaskId(null); }}
        />
      )}

      {/* Mobile tab bar */}
      <nav className="grid flex-shrink-0 grid-cols-2 border-t border-border bg-background lg:hidden">
        {([
          { id: "tasks", label: copy.calendar.myTasks, Icon: ListChecks },
          { id: "chat", label: copy.milo.name, Icon: MessageCircle }
        ] as const).map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setMobileTab(id)}
            aria-current={mobileTab === id ? "page" : undefined}
            className={cn(
              "flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors",
              mobileTab === id ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </button>
        ))}
      </nav>

      {/* Task form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCloseForm}
              className="absolute -right-2 -top-2 z-10 h-8 w-8 rounded-full bg-secondary"
              aria-label={copy.common.close}
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

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { LogOut, Zap, X } from "lucide-react";
import { CalendarView } from "@/components/calendar-view";
import { useAuth } from "@/components/auth-gate";
import { useAppLanguage } from "@/components/language-provider";
import { MiloChat } from "@/components/milo-chat";
import { getUserDisplayName } from "@/lib/auth";
import { TaskForm } from "@/components/task-form";
import { Button } from "@/components/ui/button";
import { formatTodayLongDate } from "@/lib/task-date";
import {
  createTask,
  deleteTaskById,
  loadTasks,
  setTaskDone,
  updateTask as persistTaskUpdate
} from "@/lib/storage";
import { getAuthToken } from "@/lib/auth";
import { AiPriorityApiResponse, AiPriorityRecommendation } from "@/types/ai-priority";
import { Task, TaskInput } from "@/types/task";

const FALLBACK_STORAGE_ERROR_MESSAGE = "An unexpected error occurred.";

export function LifeOrganizerApp() {
  const { copy, language } = useAppLanguage();
  const { user, logout } = useAuth();
  const displayName = getUserDisplayName(user);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [storageError, setStorageError] = useState("");
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
        const loaded = await loadTasks();
        if (active) { setTasks(loaded); setStorageError(""); }
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
        const authToken = await getAuthToken();
        const res = await fetch("/api/ai-priority", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authToken ? { "Authorization": `Bearer ${authToken}` } : {})
          },
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
      const created = await createTask(newTask);
      setTasks((prev) => [created, ...prev]);
      setStorageError("");
      return true;
    } catch (err) {
      setStorageError(getErrorMessage(err, copy.errors.unexpected));
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
      const updated = await persistTaskUpdate({ ...current, ...input });
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
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
      const updated = await setTaskDone(taskId, !current.done);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
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
      await deleteTaskById(taskId);
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
      <header className="flex flex-shrink-0 items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {copy.header.title}
            </p>
            <h1 className="text-lg font-semibold tracking-tight">{todayLabel}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">
            Hola, <span className="font-medium text-foreground">{displayName}</span>
          </span>
          <Link
            href="/plans"
            className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
          >
            <Zap className="h-3 w-3" />
            Planes
          </Link>
          <button
            onClick={() => void logout()}
            className="flex items-center gap-1.5 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
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

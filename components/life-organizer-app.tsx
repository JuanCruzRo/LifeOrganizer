"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FooterLogoLoop } from "@/components/footer-logo-loop";
import { HeaderMascot } from "@/components/header-mascot";
import { useAppLanguage } from "@/components/language-provider";
import { LanguageSwitcher } from "@/components/language-switcher";
import { RecommendationCard } from "@/components/recommendation-card";
import { TaskForm } from "@/components/task-form";
import { TaskList } from "@/components/task-list";
import { formatTodayLongDate } from "@/lib/task-date";
import {
  createTask,
  deleteTaskById,
  loadTasks,
  setTaskDone,
  updateTask as persistTaskUpdate
} from "@/lib/storage";
import { AiPriorityApiResponse, AiPriorityRecommendation } from "@/types/ai-priority";
import { Task, TaskInput } from "@/types/task";

const FALLBACK_STORAGE_ERROR_MESSAGE = "An unexpected error occurred.";

export function LifeOrganizerApp() {
  const { copy, language } = useAppLanguage();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [storageStatusMessage, setStorageStatusMessage] = useState("");
  const [aiRecommendation, setAiRecommendation] = useState<AiPriorityRecommendation | null>(null);
  const [aiStatusMessage, setAiStatusMessage] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const aiRecommendationCacheRef = useRef(new Map<string, AiPriorityRecommendation>());
  const todayLabel = formatTodayLongDate(language);

  useEffect(() => {
    let isActive = true;

    async function load() {
      try {
        const loadedTasks = await loadTasks();

        if (!isActive) {
          return;
        }

        setTasks(loadedTasks);
        setStorageStatusMessage("");
      } catch (error) {
        if (!isActive) {
          return;
        }

        setStorageStatusMessage(getErrorMessage(error, FALLBACK_STORAGE_ERROR_MESSAGE));
      } finally {
        if (isActive) {
          setIsLoaded(true);
        }
      }
    }

    void load();

    return () => {
      isActive = false;
    };
  }, []);

  const pendingTasks = useMemo(() => {
    return tasks.filter((task) => !task.done);
  }, [tasks]);

  const completedTasks = useMemo(() => {
    return tasks.filter((task) => task.done);
  }, [tasks]);

  const aiRequestTasks = useMemo(() => {
    return [...pendingTasks]
      .map((task) => ({
        id: task.id,
        title: task.title,
        category: task.category,
        description: task.description,
        priority: task.priority,
        duration: task.duration,
        dueDate: task.dueDate
      }))
      .sort((leftTask, rightTask) => leftTask.id.localeCompare(rightTask.id));
  }, [pendingTasks]);

  const aiRequestKey = useMemo(() => {
    return JSON.stringify({
      language,
      tasks: aiRequestTasks
    });
  }, [aiRequestTasks, language]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (pendingTasks.length === 0) {
      setAiRecommendation(null);
      setAiStatusMessage("");
      setIsAiLoading(false);
      return;
    }

    const cachedRecommendation = aiRecommendationCacheRef.current.get(aiRequestKey);

    if (cachedRecommendation) {
      setAiRecommendation(cachedRecommendation);
      setAiStatusMessage("");
      setIsAiLoading(false);
      return;
    }

    setAiRecommendation(null);
    setAiStatusMessage("");
    setIsAiLoading(true);

    const abortController = new AbortController();

    async function loadAiRecommendation() {
      try {
        const response = await fetch("/api/ai-priority", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ tasks: aiRequestTasks, uiLanguage: language }),
          signal: abortController.signal
        });

        const data = (await response.json()) as AiPriorityApiResponse;

        if (!response.ok) {
          setAiRecommendation(null);
          setAiStatusMessage(data.error ?? copy.recommendation.priorityLoadingError);
          setIsAiLoading(false);
          return;
        }

        if (data.enabled && data.recommendation) {
          aiRecommendationCacheRef.current.set(aiRequestKey, data.recommendation);
          setAiRecommendation(data.recommendation);
          setAiStatusMessage("");
          setIsAiLoading(false);
          return;
        }

        setAiRecommendation(null);
        setAiStatusMessage(data.error ?? "");
        setIsAiLoading(false);
      } catch {
        if (!abortController.signal.aborted) {
          setAiRecommendation(null);
          setAiStatusMessage(copy.recommendation.priorityLoadingError);
          setIsAiLoading(false);
        }
      }
    }

    void loadAiRecommendation();

    return () => {
      abortController.abort();
    };
  }, [aiRequestKey, aiRequestTasks, copy.recommendation.priorityLoadingError, isLoaded, language, pendingTasks.length]);

  const aiRecommendedTask = aiRecommendation
    ? tasks.find((task) => task.id === aiRecommendation.recommendedTaskId && !task.done) ?? null
    : null;

  const recommendedTask = aiRecommendedTask;
  const recommendationReason = aiRecommendedTask ? aiRecommendation?.recommendationReason ?? "" : "";
  const editingTask = editingTaskId ? tasks.find((task) => task.id === editingTaskId) ?? null : null;

  async function handleCreateTask(input: TaskInput) {
    setIsSyncing(true);

    try {
      const newTask: Task = {
        id: crypto.randomUUID(),
        title: input.title,
        category: input.category,
        description: input.description,
        priority: input.priority,
        duration: input.duration,
        dueDate: input.dueDate,
        done: false
      };
      const createdTask = await createTask(newTask);

      setTasks((currentTasks) => [createdTask, ...currentTasks]);
      setStorageStatusMessage("");
      return true;
    } catch (error) {
      setStorageStatusMessage(getErrorMessage(error, copy.errors.unexpected));
      return false;
    } finally {
      setIsSyncing(false);
    }
  }

  async function handleUpdateTask(input: TaskInput) {
    if (!editingTaskId) {
      return false;
    }

    const currentTask = tasks.find((task) => task.id === editingTaskId);

    if (!currentTask) {
      setEditingTaskId(null);
      return false;
    }

    setIsSyncing(true);

    try {
      const updatedTask = await persistTaskUpdate({
        ...currentTask,
        ...input
      });

      setTasks((currentTasks) =>
        currentTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      );
      setEditingTaskId(null);
      setStorageStatusMessage("");
      return true;
    } catch (error) {
      setStorageStatusMessage(getErrorMessage(error, copy.errors.unexpected));
      return false;
    } finally {
      setIsSyncing(false);
    }
  }

  async function handleToggleTask(taskId: string) {
    const currentTask = tasks.find((task) => task.id === taskId);

    if (!currentTask) {
      return;
    }

    setIsSyncing(true);

    try {
      const updatedTask = await setTaskDone(taskId, !currentTask.done);

      setTasks((currentTasks) =>
        currentTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      );
      setStorageStatusMessage("");
    } catch (error) {
      setStorageStatusMessage(getErrorMessage(error, copy.errors.unexpected));
    } finally {
      setIsSyncing(false);
    }
  }

  async function handleDeleteTask(taskId: string) {
    setIsSyncing(true);

    try {
      await deleteTaskById(taskId);

      if (editingTaskId === taskId) {
        setEditingTaskId(null);
      }

      setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
      setStorageStatusMessage("");
    } catch (error) {
      setStorageStatusMessage(getErrorMessage(error, copy.errors.unexpected));
    } finally {
      setIsSyncing(false);
    }
  }

  function handleStartEditingTask(taskId: string) {
    if (isSyncing) {
      return;
    }

    setEditingTaskId(taskId);
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)] px-6 py-6 shadow-[0_10px_30px_rgba(24,36,28,0.06)] backdrop-blur">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_8rem] lg:items-start xl:grid-cols-[minmax(0,1fr)_9rem]">
            <div>
              <div className="mb-4">
                <LanguageSwitcher />
              </div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--muted)]">
                {copy.header.title}
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                {todayLabel}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-base">
                {copy.header.subtitle}
              </p>
            </div>

            <HeaderMascot />
          </div>
        </header>

        {storageStatusMessage ? (
          <div className="rounded-2xl border border-[var(--border)] bg-white/70 px-4 py-3 text-sm leading-6 text-[var(--foreground)]">
            {storageStatusMessage}
          </div>
        ) : null}

        <section className="grid gap-6 lg:items-start lg:grid-cols-[1.2fr_0.8fr]">
          <RecommendationCard
            hasPendingTasks={pendingTasks.length > 0}
            isAiLoading={isAiLoading}
            recommendationReason={recommendationReason}
            recommendedTask={recommendedTask}
            statusMessage={aiStatusMessage}
          />
          <TaskForm
            initialValues={
              editingTask
                ? {
                    title: editingTask.title,
                    category: editingTask.category,
                    description: editingTask.description,
                    priority: editingTask.priority,
                    duration: editingTask.duration,
                    dueDate: editingTask.dueDate
                  }
                : undefined
            }
            isSubmitting={isSyncing}
            mode={editingTask ? "edit" : "create"}
            onCancel={() => setEditingTaskId(null)}
            onSubmitTask={editingTask ? handleUpdateTask : handleCreateTask}
          />
        </section>

        <TaskList
          completedTasks={completedTasks}
          isMutating={isSyncing}
          pendingTasks={pendingTasks}
          onDeleteTask={handleDeleteTask}
          onEditTask={handleStartEditingTask}
          onToggleTask={handleToggleTask}
        />

        <FooterLogoLoop />
      </div>
    </main>
  );
}

function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
}

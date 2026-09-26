"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle, Mic, MicOff, Send, Trash2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MiloLoader } from "@/components/milo-loader";
import { sendLabels } from "@/lib/landing-copy";
import { useAppLanguage } from "@/components/language-provider";
import { languageSpeechCodes } from "@/lib/i18n";
import { MiloAvatar } from "@/components/milo-avatar";
import { micCopy } from "@/lib/focus-copy";
import { type MiloFace } from "@/lib/milo-face";
import { formatDueDate } from "@/lib/task-date";
import { getTaskPriorityLabel } from "@/lib/task-labels";
import { useSpeechRecognition } from "@/lib/use-speech-recognition";
import { cn } from "@/lib/utils";
import { Task, TaskInput } from "@/types/task";
import { useUser } from "@clerk/nextjs";

const LAST_BRIEFING_KEY = "milo_last_briefing";
const LEGACY_SESSION_PREFIX = "milo_session_";

function renderMarkdown(text: string): React.ReactNode[] {
  return text.split("\n").map((line, i) => {
    const parts: React.ReactNode[] = [];
    let rest = line;

    // listas con - o *
    const listMatch = rest.match(/^(\s*[-*]\s+)(.*)/);
    if (listMatch) {
      rest = listMatch[2];
      parts.push(<span key="bullet" className="mr-1 text-muted-foreground">•</span>);
    }

    // negrita **text** e itálica *text*
    const segments = rest.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    for (const seg of segments) {
      if (seg.startsWith("**") && seg.endsWith("**")) {
        parts.push(<strong key={seg}>{seg.slice(2, -2)}</strong>);
      } else if (seg.startsWith("*") && seg.endsWith("*")) {
        parts.push(<em key={seg}>{seg.slice(1, -1)}</em>);
      } else {
        parts.push(seg);
      }
    }

    return <div key={i}>{parts}</div>;
  });
}

type Message = {
  role: "user" | "milo";
  content: string;
  taskActions?: TaskInput[];
  taskCreated?: boolean;
};

type PersistedMessage = Pick<Message, "role" | "content">;

type MiloCopy = {
  briefingGoodMorning: string;
  briefingGoodAfternoon: string;
  briefingGoodEvening: string;
  briefingNoPending: string;
  briefingPending: (n: number) => string;
  briefingUrgent: (n: number, names: string) => string;
  briefingCompleted: (n: number) => string;
  briefingHelp: string;
};

function getGreetingByHour(miloCopy: MiloCopy): string {
  const hour = new Date().getHours();
  // Late night (00:00-04:59) counts as "evening/night", not morning.
  if (hour >= 5 && hour < 12) return miloCopy.briefingGoodMorning;
  if (hour >= 12 && hour < 19) return miloCopy.briefingGoodAfternoon;
  return miloCopy.briefingGoodEvening;
}

function buildDailyBriefing(tasks: Task[], miloCopy: MiloCopy): string {
  const pending = tasks.filter((t) => !t.done);
  const urgent = pending.filter((t) => t.priority === "high");
  const today = new Date();
  const completedToday = tasks.filter((t) => {
    if (!t.done || !t.completedAt) return false;
    return new Date(t.completedAt).toDateString() === today.toDateString();
  });

  const lines: string[] = [getGreetingByHour(miloCopy)];

  if (pending.length === 0) {
    lines.push(miloCopy.briefingNoPending);
  } else {
    lines.push(miloCopy.briefingPending(pending.length));
    if (urgent.length > 0) {
      const urgentNames = urgent.slice(0, 2).map((t) => t.title).join(", ");
      lines.push(miloCopy.briefingUrgent(urgent.length, urgentNames + (urgent.length > 2 ? "..." : "")));
    }
  }

  if (completedToday.length > 0) {
    lines.push(miloCopy.briefingCompleted(completedToday.length));
  }

  lines.push(miloCopy.briefingHelp);
  return lines.join("\n");
}

export function MiloChat({
  tasks,
  onCreateTask
}: {
  tasks: Task[];
  onCreateTask: (input: TaskInput) => Promise<boolean>;
}) {
  const { copy, language } = useAppLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const speech = useSpeechRecognition(languageSpeechCodes[language]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const { user } = useUser();
  const userId = user?.id ?? "";
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  const briefingSentRef = useRef(false);
  const tasksLoadedRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Tarea pendiente de confirmación (la última sin confirmar ni descartar)
  const pendingTaskAction = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.taskActions && m.taskActions.length > 0 && !m.taskCreated) return m.taskActions[0];
    }
    return null;
  }, [messages]);

  const overloadedTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (t.done || t.priority !== "high") return false;
      const daysUntil = Math.ceil((new Date(t.dueDate).getTime() - Date.now()) / 86400000);
      return daysUntil <= 2;
    });
  }, [tasks]);

  const isOverloaded = overloadedTasks.length >= 3;

  const headerFace: MiloFace = speech.isListening
    ? "escuchando"
    : isLoading
      ? "pensando"
      : isOverloaded
        ? "alerta"
        : "avatar";

  // The conversation stays in memory for this session only. Milo still remembers
  // the user through the server-side summary, but old text never reappears here.
  useEffect(() => {
    if (!userId) return;
    try {
      localStorage.removeItem(LEGACY_SESSION_PREFIX + userId);
    } catch {
      /* storage can be blocked */
    }
    setSessionLoaded(true);
  }, [userId]);

  // Briefing diario
  useEffect(() => {
    if (!sessionLoaded || briefingSentRef.current) return;
    if (tasks.length === 0 && !tasksLoadedRef.current) return;
    tasksLoadedRef.current = true;

    const lastBriefing = localStorage.getItem(LAST_BRIEFING_KEY);
    const today = new Date().toISOString().split("T")[0];
    if (lastBriefing === today) return;

    briefingSentRef.current = true;
    localStorage.setItem(LAST_BRIEFING_KEY, today);
    setMessages((prev) => [...prev, { role: "milo", content: buildDailyBriefing(tasks, copy.milo) }]);
  }, [sessionLoaded, tasks]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || isLoading) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setIsLoading(true);

    try {
      const history = messages
        .filter((m) => m.role === "user" || m.role === "milo")
        .map(({ role, content }) => ({ role, content }));

      const response = await fetch("/api/milo/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, tasks, history, pendingTaskAction })
      });

      const data = (await response.json()) as {
        response?: string;
        error?: string;
        taskActions?: TaskInput[];
      };

      const newMessage: Message = {
        role: "milo",
        content: data.response ?? data.error ?? copy.milo.noConnection,
        ...(data.taskActions && data.taskActions.length > 0 ? { taskActions: data.taskActions } : {})
      };
      setMessages((prev) => [...prev, newMessage]);
    } catch {
      setMessages((prev) => [...prev, { role: "milo", content: copy.milo.noConnection }]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleConfirmTask(msgIndex: number, actions: TaskInput[]) {
    setIsCreatingTask(true);
    try {
      for (const action of actions) {
        await onCreateTask(action);
      }
      setMessages((prev) =>
        prev.map((m, i) => (i === msgIndex ? { ...m, taskActions: undefined, taskCreated: true } : m))
      );
    } finally {
      setIsCreatingTask(false);
    }
  }

  function handleDismissTask(msgIndex: number) {
    setMessages((prev) =>
      prev.map((m, i) => (i === msgIndex ? { ...m, taskActions: undefined } : m))
    );
  }

  function clearMessages() {
    setMessages([]);
  }

  return (
    <aside className="flex h-full w-full flex-col border-r border-border">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="relative flex-shrink-0">
            <MiloAvatar face={headerFace} size={36} alt="Milo" />
          </div>
          <div>
            <p className="text-sm font-semibold">{copy.milo.name}</p>
            <p className="text-xs text-muted-foreground">{copy.milo.subtitle}</p>
          </div>
        </div>
        <button
          onClick={clearMessages}
          disabled={messages.length === 0}
          className="flex items-center gap-1 rounded-md p-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-30"
          aria-label={copy.milo.clearChat}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Overload warning */}
      {isOverloaded && (
        <div className="flex-shrink-0 border-b border-border bg-destructive/10 px-4 py-2 text-xs text-destructive">
          {copy.milo.urgentWarning(overloadedTasks.length)}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && !isLoading && sessionLoaded && (
          <motion.div
            className="flex h-full items-center justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <div className="max-w-[220px] text-center">
              <MiloAvatar face="saludando" size={80} alt="Milo" className="mx-auto mb-3" />
              <p className="text-sm font-medium">{copy.milo.greeting}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {copy.milo.greetingSubtitle}
              </p>
            </div>
          </motion.div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className={cn("flex flex-col", msg.role === "user" ? "items-end" : "items-start")}
          >
            <div
              className={cn(
                "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                msg.role === "user"
                  ? "rounded-br-sm bg-primary text-primary-foreground"
                  : "rounded-bl-sm bg-secondary text-foreground"
              )}
            >
              {msg.role === "milo" ? renderMarkdown(msg.content) : msg.content}
            </div>

            {msg.taskActions && msg.taskActions.length > 0 && (
              <div className="mt-2 max-w-[85%] w-full rounded-xl border border-border bg-card p-3 space-y-2">
                <p className="text-xs font-semibold text-foreground">
                  {msg.taskActions.length === 1 ? copy.milo.createTask : `${copy.milo.createTask} (${msg.taskActions.length})`}
                </p>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {msg.taskActions.map((action, idx) => (
                    <div key={idx} className="rounded-lg bg-background/60 px-2.5 py-1.5">
                      <p className="text-sm font-medium text-foreground">{action.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {action.category} · {getTaskPriorityLabel(action.priority, language)} · {formatDueDate(action.dueDate, language)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => void handleConfirmTask(i, msg.taskActions!)}
                    disabled={isCreatingTask}
                    className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    <CheckCircle className="h-3 w-3" />
                    {copy.milo.confirm}
                  </button>
                  <button
                    onClick={() => handleDismissTask(i)}
                    disabled={isCreatingTask}
                    className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    <XCircle className="h-3 w-3" />
                    {copy.milo.dismiss}
                  </button>
                </div>
              </div>
            )}

            {msg.taskCreated && (
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <CheckCircle className="h-3 w-3 text-green-500" />
                {copy.milo.taskCreated}
              </div>
            )}
          </motion.div>
        ))}

        <AnimatePresence>
          {isLoading && (
            <motion.div
              className="flex justify-start"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="rounded-2xl rounded-bl-sm bg-secondary px-4 py-3">
                <MiloLoader />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-3">
        {speech.error && (
          <p className="mb-2 flex items-center justify-between gap-2 rounded-lg bg-destructive/10 px-2.5 py-1.5 text-xs text-destructive">
            {speech.error === "blocked" ? micCopy[language].blocked : micCopy[language].noSpeech}
            <button onClick={speech.clearError} aria-label={copy.common.close} className="opacity-70 hover:opacity-100">
              <XCircle className="h-3.5 w-3.5" />
            </button>
          </p>
        )}
        <div className="flex gap-2">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void sendMessage();
              }
            }}
            placeholder={speech.isListening ? copy.milo.listening : copy.milo.inputPlaceholder}
            disabled={isLoading || speech.isListening}
            className="h-11 flex-1 text-base sm:text-sm"
          />
          {speech.isSupported && (
            <Button
              type="button"
              onClick={() =>
                speech.isListening
                  ? speech.stop()
                  : speech.start((text) => setInput((prev) => (prev ? `${prev} ${text}` : text)))
              }
              disabled={isLoading}
              variant={speech.isListening ? "default" : "outline"}
              size="icon"
              aria-label={speech.isListening ? copy.milo.stopListening : copy.milo.startListening}
              className={cn(speech.isListening && "animate-pulse")}
            >
              {speech.isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          )}
          <Button
            onClick={() => void sendMessage()}
            disabled={isLoading || !input.trim()}
            size="icon"
            aria-label={sendLabels[language]}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}

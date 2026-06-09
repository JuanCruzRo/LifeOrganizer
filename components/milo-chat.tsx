"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle, Send, Trash2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MiloLoader } from "@/components/milo-loader";
import { cn } from "@/lib/utils";
import { Task, TaskInput } from "@/types/task";
import { getAuthToken } from "@/lib/auth";
import { supabase, getSupabaseBrowserClient } from "@/lib/supabase";

const OWNER_TOKEN_KEY = "spark-owner-token";
const LAST_BRIEFING_KEY = "milo_last_briefing";

type Message = {
  role: "user" | "milo";
  content: string;
  taskAction?: TaskInput;
  taskCreated?: boolean;
};

type PersistedMessage = Pick<Message, "role" | "content">;

function buildDailyBriefing(tasks: Task[]): string {
  const pending = tasks.filter((t) => !t.done);
  const urgent = pending.filter((t) => t.priority === "high");
  const today = new Date();
  const completedToday = tasks.filter((t) => {
    if (!t.done || !t.completedAt) return false;
    return new Date(t.completedAt).toDateString() === today.toDateString();
  });

  const lines: string[] = ["☀️ Buen día! Tu resumen de hoy:"];

  if (pending.length === 0) {
    lines.push("No tenés tareas pendientes. Buen momento para agregar algo nuevo.");
  } else {
    lines.push(`Tenés ${pending.length} tarea${pending.length !== 1 ? "s" : ""} pendiente${pending.length !== 1 ? "s" : ""}.`);
    if (urgent.length > 0) {
      const urgentNames = urgent.slice(0, 2).map((t) => t.title).join(", ");
      lines.push(`⚡ ${urgent.length} urgente${urgent.length !== 1 ? "s" : ""}: ${urgentNames}${urgent.length > 2 ? "..." : ""}.`);
    }
  }

  if (completedToday.length > 0) {
    lines.push(`✅ Hoy ya completaste ${completedToday.length} tarea${completedToday.length !== 1 ? "s" : ""}. ¡Bien!`);
  }

  lines.push("¿En qué te puedo ayudar?");
  return lines.join("\n");
}

export function MiloChat({
  tasks,
  onCreateTask
}: {
  tasks: Task[];
  onCreateTask: (input: TaskInput) => Promise<boolean>;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [ownerToken, setOwnerToken] = useState("");
  const briefingSentRef = useRef(false);
  const tasksLoadedRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Tarea pendiente de confirmación (la última sin confirmar ni descartar)
  const pendingTaskAction = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.taskAction && !m.taskCreated) return m.taskAction;
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

  // Inicializar token usando el UID del usuario autenticado
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      let token: string;
      if (user?.id) {
        token = user.id;
      } else {
        const existing = window.localStorage.getItem(OWNER_TOKEN_KEY);
        token = existing ?? `task-owner-${crypto.randomUUID()}`;
        if (!existing) window.localStorage.setItem(OWNER_TOKEN_KEY, token);
      }
      setOwnerToken(token);

      // Cargar sesión con el token correcto
      try {
        const client = getSupabaseBrowserClient(token);
        const { data } = await client
          .from("milo_sessions")
          .select("messages")
          .eq("owner_token", token)
          .single();
        if (data?.messages && Array.isArray(data.messages)) {
          setMessages(data.messages as Message[]);
        }
      } catch {
        // Sin sesión previa
      } finally {
        setSessionLoaded(true);
      }
    }
    void init();
  }, []);

  // Guardar sesión cuando cambian los mensajes
  useEffect(() => {
    if (!sessionLoaded || !ownerToken || messages.length === 0) return;
    const toSave: PersistedMessage[] = messages.map(({ role, content }) => ({ role, content }));
    const client = getSupabaseBrowserClient(ownerToken);
    void client.from("milo_sessions").upsert({
      owner_token: ownerToken,
      messages: toSave,
      updated_at: new Date().toISOString()
    });
  }, [messages, sessionLoaded, ownerToken]);

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
    setMessages((prev) => [...prev, { role: "milo", content: buildDailyBriefing(tasks) }]);
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

      const authToken = await getAuthToken();
      const response = await fetch("/api/milo/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { "Authorization": `Bearer ${authToken}` } : {}),
          ...(ownerToken ? { "x-client-token": ownerToken } : {})
        },
        body: JSON.stringify({ message: text, tasks, history, pendingTaskAction })
      });

      const data = (await response.json()) as {
        response?: string;
        error?: string;
        taskAction?: TaskInput;
      };

      const newMessage: Message = {
        role: "milo",
        content: data.response ?? data.error ?? "Sin respuesta.",
        ...(data.taskAction ? { taskAction: data.taskAction } : {})
      };
      setMessages((prev) => [...prev, newMessage]);
    } catch {
      setMessages((prev) => [...prev, { role: "milo", content: "No pude conectarme con Milo." }]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleConfirmTask(msgIndex: number, action: TaskInput) {
    setIsCreatingTask(true);
    try {
      const success = await onCreateTask(action);
      if (success) {
        setMessages((prev) =>
          prev.map((m, i) => (i === msgIndex ? { ...m, taskAction: undefined, taskCreated: true } : m))
        );
      }
    } finally {
      setIsCreatingTask(false);
    }
  }

  function handleDismissTask(msgIndex: number) {
    setMessages((prev) =>
      prev.map((m, i) => (i === msgIndex ? { ...m, taskAction: undefined } : m))
    );
  }

  async function clearMessages() {
    setMessages([]);
    if (!ownerToken) return;
    const client = getSupabaseBrowserClient(ownerToken);
    await client.from("milo_sessions").delete().eq("owner_token", ownerToken);
  }

  return (
    <aside className="flex w-full flex-col border-r border-border lg:w-[360px] lg:flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <p className="text-sm font-semibold">Milo</p>
          <p className="text-xs text-muted-foreground">Asistente personal</p>
        </div>
        <button
          onClick={() => void clearMessages()}
          disabled={messages.length === 0}
          className="flex items-center gap-1 rounded-md p-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-30"
          aria-label="Limpiar conversación"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Overload warning */}
      {isOverloaded && (
        <div className="flex-shrink-0 border-b border-border bg-destructive/10 px-4 py-2 text-xs text-destructive">
          ⚡ {overloadedTasks.length} tareas urgentes vencen en los próximos 2 días.
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && !isLoading && sessionLoaded && (
          <div className="flex h-full items-center justify-center">
            <div className="max-w-[220px] text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-lg font-bold">
                M
              </div>
              <p className="text-sm font-medium">Hola, soy Milo</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Preguntame sobre tus tareas, pedime ayuda para organizarte, o charlemos.
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
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
              {msg.content}
            </div>

            {msg.taskAction && (
              <div className="mt-2 max-w-[85%] w-full rounded-xl border border-border bg-card p-3 space-y-2">
                <p className="text-xs font-semibold text-foreground">Crear tarea</p>
                <p className="text-sm font-medium text-foreground">{msg.taskAction.title}</p>
                <p className="text-xs text-muted-foreground">
                  {msg.taskAction.category} · {msg.taskAction.priority} · vence {msg.taskAction.dueDate}
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => void handleConfirmTask(i, msg.taskAction!)}
                    disabled={isCreatingTask}
                    className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    <CheckCircle className="h-3 w-3" />
                    Confirmar
                  </button>
                  <button
                    onClick={() => handleDismissTask(i)}
                    disabled={isCreatingTask}
                    className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    <XCircle className="h-3 w-3" />
                    Descartar
                  </button>
                </div>
              </div>
            )}

            {msg.taskCreated && (
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Tarea creada
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm bg-secondary px-4 py-3">
              <MiloLoader />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-3">
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
            placeholder="Escribí un mensaje..."
            disabled={isLoading}
            className="flex-1 text-sm"
          />
          <Button
            onClick={() => void sendMessage()}
            disabled={isLoading || !input.trim()}
            size="icon"
            aria-label="Enviar"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}

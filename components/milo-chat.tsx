"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MiloLoader } from "@/components/milo-loader";
import { cn } from "@/lib/utils";
import { Task } from "@/types/task";

const OWNER_TOKEN_KEY = "spark-owner-token";

type Message = {
  role: "user" | "milo";
  content: string;
};

function getOwnerToken(): string {
  if (typeof window === "undefined") return "";
  const existing = window.localStorage.getItem(OWNER_TOKEN_KEY);
  if (existing) return existing;
  const newToken = `task-owner-${crypto.randomUUID()}`;
  window.localStorage.setItem(OWNER_TOKEN_KEY, newToken);
  return newToken;
}

export function MiloChat({ tasks }: { tasks: Task[] }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || isLoading) return;

    const ownerToken = getOwnerToken();
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/milo/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(ownerToken ? { "x-client-token": ownerToken } : {})
        },
        body: JSON.stringify({ message: text, tasks })
      });

      const data = (await response.json()) as { response?: string; error?: string };
      setMessages((prev) => [
        ...prev,
        { role: "milo", content: data.response ?? data.error ?? "Sin respuesta." }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "milo", content: "No pude conectarme con Milo." }
      ]);
    } finally {
      setIsLoading(false);
    }
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
          onClick={() => setMessages([])}
          disabled={messages.length === 0}
          className="flex items-center gap-1 rounded-md p-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-30"
          aria-label="Limpiar conversación"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
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
            className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
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
            ref={inputRef}
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

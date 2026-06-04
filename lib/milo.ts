import "server-only";
import { AppLanguage } from "@/lib/i18n";

const MILO_SERVER_URL = (process.env.MILO_SERVER_URL ?? "http://localhost:8000").replace(/\/$/, "");

type MiloChatParams = {
  message: string;
  context?: string;
  timeoutMs?: number;
};

export async function chatWithMilo({ message, context = "", timeoutMs = 30000 }: MiloChatParams) {
  const sessionToken = `__internal_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  const response = await fetch(`${MILO_SERVER_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-client-token": sessionToken
    },
    body: JSON.stringify({ message, context }),
    signal: AbortSignal.timeout(timeoutMs)
  });

  if (!response.ok) {
    const err = (await response.json().catch(() => ({}))) as { error?: string };
    throw { status: response.status, message: err.error ?? `Milo returned ${response.status}` };
  }

  const data = (await response.json()) as { response?: string };
  return {
    content: data.response ?? "",
    model: "milo"
  };
}

export function getMiloErrorMessage(error: unknown, actionLabel: string, language: AppLanguage = "en") {
  const isSpanish = language === "es";

  if (!error || typeof error !== "object") {
    return isSpanish
      ? `No se pudo generar ${actionLabel} en este momento.`
      : `Couldn't generate ${actionLabel} right now.`;
  }

  const err = error as { status?: number; message?: string; name?: string };

  if (err.name === "TimeoutError") {
    return isSpanish
      ? `Milo tardó demasiado en responder para ${actionLabel}.`
      : `Milo took too long to respond for ${actionLabel}.`;
  }

  if (err.message) {
    return isSpanish
      ? `No se pudo generar ${actionLabel}: ${err.message}`
      : `Couldn't generate ${actionLabel}: ${err.message}`;
  }

  return isSpanish
    ? `No se pudo generar ${actionLabel} en este momento.`
    : `Couldn't generate ${actionLabel} right now.`;
}

export function parseJsonObject<T>(value: string): T | null {
  const directParse = safeParseJson<T>(value);
  if (directParse) return directParse;

  const extracted = extractFirstJsonObject(value);
  if (!extracted) return null;

  return safeParseJson<T>(extracted);
}

function safeParseJson<T>(value: string) {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function extractFirstJsonObject(value: string) {
  const startIndex = value.indexOf("{");
  if (startIndex === -1) return null;

  let depth = 0;
  let inString = false;
  let isEscaped = false;

  for (let index = startIndex; index < value.length; index += 1) {
    const character = value[index];
    if (inString) {
      if (isEscaped) { isEscaped = false; continue; }
      if (character === "\\") { isEscaped = true; continue; }
      if (character === '"') { inString = false; }
      continue;
    }
    if (character === '"') { inString = true; continue; }
    if (character === "{") { depth += 1; continue; }
    if (character === "}") {
      depth -= 1;
      if (depth === 0) return value.slice(startIndex, index + 1);
    }
  }
  return null;
}

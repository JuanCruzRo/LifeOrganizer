import "server-only";
import Groq from "groq-sdk";
import { AppLanguage } from "@/lib/i18n";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const GROQ_MODEL = process.env.GROQ_MODEL ?? "qwen/qwen3.8-27b";
const GROQ_PRO_MODEL = process.env.GROQ_PRO_MODEL ?? "openai/gpt-oss-120b";
const GROQ_FALLBACK_MODEL = process.env.GROQ_FALLBACK_MODEL ?? "openai/gpt-oss-120b";

type MiloChatParams = {
  message: string;
  context?: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  timeoutMs?: number;
  isPro?: boolean;
};

export async function chatWithMilo({
  message,
  context = "",
  history = [],
  timeoutMs = 30000,
  isPro = false
}: MiloChatParams) {
  const messages: Groq.Chat.ChatCompletionMessageParam[] = [
    ...(context ? [{ role: "system" as const, content: context }] : []),
    ...history,
    { role: "user" as const, content: message }
  ];

  if (looksLikeSearchRequest(message)) {
    const results = await searchWithFallback(message, isPro);
    if (results) {
      messages[messages.length - 1] = {
        role: "user",
        content: `${message}\n\n[Resultados de búsqueda web]\n${results}`
      };
    }
  }

  const response = await createChatCompletionWithFallback(
    messages,
    timeoutMs,
    isPro ? GROQ_PRO_MODEL : GROQ_MODEL
  );

  return {
    content: response.choices[0]?.message?.content ?? "",
    model: response.model
  };
}

export async function refreshUserMemorySummary(params: {
  previousSummary: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
}): Promise<string> {
  const conversationText = params.history
    .map((m) => `${m.role === "user" ? "Usuario" : "Milo"}: ${m.content}`)
    .join("\n");

  const prompt = `Sos un sistema que mantiene una memoria compacta sobre un usuario para un asistente de organización personal llamado Milo.

Memoria actual del usuario:
${params.previousSummary || "(sin memoria previa)"}

Conversación reciente:
${conversationText}

Actualizá la memoria en 3-6 líneas cortas (bullet points), integrando lo nuevo relevante con lo que ya se sabía. Enfocate en patrones de comportamiento, preferencias, rutinas, o datos personales relevantes que ayuden a Milo a asistir mejor en el futuro (ej. "suele posponer tareas de X", "prefiere organizar de mañana", "trabaja en Y"). No incluyas información irrelevante ni detalles de tareas puntuales que ya vencieron. Si no hay nada nuevo o relevante, devolvé la memoria actual sin cambios. Respondé SOLO con la memoria actualizada, sin explicaciones ni encabezados.`;

  try {
    const response = await createChatCompletionWithFallback(
      [{ role: "user", content: prompt }],
      15000
    );
    return response.choices[0]?.message?.content?.trim() ?? params.previousSummary;
  } catch {
    return params.previousSummary;
  }
}

async function createChatCompletionWithFallback(
  messages: Groq.Chat.ChatCompletionMessageParam[],
  timeoutMs: number,
  primaryModel: string = GROQ_MODEL
) {
  try {
    return await groq.chat.completions.create(
      { model: primaryModel, messages, temperature: 0.7, max_tokens: 1024 },
      { signal: AbortSignal.timeout(timeoutMs) }
    );
  } catch (error) {
    const isRetryable = error instanceof Groq.APIError
      ? error.status === 429 || error.status === 503 || error.status === undefined
      : true;
    if (!isRetryable) throw error;

    const fallbackModel = primaryModel === GROQ_FALLBACK_MODEL ? GROQ_MODEL : GROQ_FALLBACK_MODEL;
    console.warn(`Groq model "${primaryModel}" failed, retrying with fallback "${fallbackModel}"`, error);
    return groq.chat.completions.create(
      { model: fallbackModel, messages, temperature: 0.7, max_tokens: 1024 },
      { signal: AbortSignal.timeout(timeoutMs) }
    );
  }
}

function looksLikeSearchRequest(message: string): boolean {
  const m = message.toLowerCase();
  return [
    // Pedidos explícitos de búsqueda
    "busca", "buscá", "buscar", "googlea", "googleá", "google",
    "search", "look up", "find", "busca en internet", "busca en la web",
    // Preguntas factuales
    "qué es", "que es", "qué significa", "que significa",
    "cómo se hace", "como se hace", "cómo funciona", "como funciona",
    "cómo instalar", "como instalar", "cómo configurar", "como configurar",
    "cómo se consigue", "como se consigue", "cómo obtener", "como obtener",
    "cuál es", "cual es", "cuánto cuesta", "cuanto cuesta",
    "cuánto tarda", "cuanto tarda", "cuándo sale", "cuando sale",
    "cuándo fue", "cuando fue", "cuándo es", "cuando es",
    "quién es", "quien es", "quiénes son", "quienes son",
    "dónde queda", "donde queda", "dónde está", "donde esta",
    // Temas que requieren info real
    "noticias", "novedades", "últimas noticias",
    "precio de", "costo de", "cuánto sale", "cuanto sale",
    "requisitos", "especificaciones", "specs",
    // Juegos, tecnología, cultura
    "en world of warcraft", "en wow", "en minecraft", "en fortnite",
    "en el juego", "en steam", "como conseguir",
    "existe", "es real", "es verdad", "es cierto"
  ].some((kw) => m.includes(kw));
}

async function searchWithFallback(query: string, isPro: boolean): Promise<string> {
  if (isPro) {
    const tavilyKey = process.env.TAVILY_API_KEY ?? "";
    if (tavilyKey) {
      const result = await searchTavily(query, tavilyKey);
      if (result) return result;
    }
  }
  return searchSearXNG(query);
}

async function searchTavily(query: string, apiKey: string): Promise<string> {
  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        max_results: 5,
        include_answer: true,
        search_depth: "basic"
      }),
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) return "";

    const data = (await response.json()) as {
      answer?: string;
      results?: Array<{ title: string; url: string; content: string }>;
    };

    const lines: string[] = [];
    if (data.answer) lines.push(`Resumen: ${data.answer}`);
    for (const r of (data.results ?? []).slice(0, 4)) {
      lines.push(`\n— ${r.title}\n${r.content.slice(0, 400)}`);
    }
    return lines.join("\n");
  } catch {
    return "";
  }
}

const SEARXNG_INSTANCES = [
  "https://searx.be",
  "https://searxng.world",
  "https://paulgo.io"
];

async function searchSearXNG(query: string): Promise<string> {
  for (const instance of SEARXNG_INSTANCES) {
    try {
      const url = `${instance}/search?q=${encodeURIComponent(query)}&format=json&language=auto`;
      const response = await fetch(url, {
        headers: { "Accept": "application/json" },
        signal: AbortSignal.timeout(8000)
      });

      if (!response.ok) continue;

      const data = (await response.json()) as {
        results?: Array<{ title: string; url: string; content?: string }>;
      };

      const lines: string[] = [];
      for (const r of (data.results ?? []).slice(0, 5)) {
        if (r.content) lines.push(`\n— ${r.title}\n${r.content.slice(0, 400)}`);
      }
      if (lines.length > 0) return lines.join("\n");
    } catch {
      continue;
    }
  }
  return "";
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

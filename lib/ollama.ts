import "server-only";
import { AppLanguage } from "@/lib/i18n";

const DEFAULT_OLLAMA_BASE_URL = "https://ollama.com/api";
const DEFAULT_OLLAMA_MODEL = "qwen3.5:cloud";

type OllamaMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type OllamaChatResponse = {
  done_reason?: string;
  message?: {
    content?: string;
  };
};

type OllamaChatParams = {
  format?: unknown;
  messages: OllamaMessage[];
  model?: string;
  numPredict?: number;
  temperature?: number;
  timeoutMs?: number;
};

type NormalizedOllamaError = {
  provider?: "ollama";
  status?: number;
  message?: string;
  causeMessage?: string;
  network?: boolean;
};

export async function chatWithOllama({
  format,
  messages,
  model = getOllamaModel(),
  numPredict = 400,
  temperature = 0.1,
  timeoutMs
}: OllamaChatParams) {
  const response = await fetch(buildOllamaChatUrl(), {
    method: "POST",
    headers: buildOllamaHeaders(),
    ...(typeof timeoutMs === "number" ? { signal: AbortSignal.timeout(timeoutMs) } : {}),
    body: JSON.stringify({
      model,
      stream: false,
      think: false,
      format,
      options: {
        temperature,
        num_predict: numPredict
      },
      messages
    })
  });

  if (!response.ok) {
    throw await buildOllamaError(response);
  }

  const data = (await response.json()) as OllamaChatResponse;

  return {
    content: data.message?.content ?? "",
    doneReason: data.done_reason ?? "",
    model
  };
}

export function getOllamaModel() {
  const configuredModel = process.env.OLLAMA_MODEL?.trim();

  return configuredModel || DEFAULT_OLLAMA_MODEL;
}

export function parseJsonObject<T>(value: string): T | null {
  const directParse = safeParseJson<T>(value);

  if (directParse) {
    return directParse;
  }

  const extractedJson = extractFirstJsonObject(value);

  if (!extractedJson) {
    return null;
  }

  return safeParseJson<T>(extractedJson);
}

export function normalizeOllamaError(error: unknown): NormalizedOllamaError {
  if (!error || typeof error !== "object") {
    return {};
  }

  const maybeError = error as {
    provider?: "ollama";
    status?: number;
    message?: string;
    cause?: {
      code?: string;
      message?: string;
    };
    name?: string;
    causeMessage?: string;
    network?: boolean;
  };

  const causeCode = maybeError.cause?.code;
  const causeMessage = maybeError.causeMessage ?? maybeError.cause?.message;
  const network =
    maybeError.network ||
    maybeError.message === "fetch failed" ||
    maybeError.name === "TimeoutError" ||
    maybeError.message === "The operation was aborted due to timeout" ||
    causeCode === "ENOTFOUND" ||
    causeCode === "ECONNRESET" ||
    causeCode === "ECONNREFUSED" ||
    causeCode === "ETIMEDOUT";

  return {
    provider: maybeError.provider,
    status: maybeError.status,
    message: maybeError.message,
    causeMessage,
    network
  };
}

export function getOllamaErrorMessage(
  error: unknown,
  actionLabel: string,
  language: AppLanguage = "en"
) {
  const normalizedError = normalizeOllamaError(error);
  const isSpanish = language === "es";

  if (normalizedError.status === 401 || normalizedError.status === 403) {
    return isSpanish
      ? `No se pudo generar ${actionLabel} porque la API key de Ollama Cloud no es valida o no tiene permisos.`
      : `Couldn't generate ${actionLabel} because the Ollama Cloud API key is invalid or lacks permissions.`;
  }

  if (normalizedError.status === 404) {
    return isSpanish
      ? `No se pudo generar ${actionLabel} porque el modelo configurado no esta disponible en Ollama Cloud.`
      : `Couldn't generate ${actionLabel} because the configured model isn't available in Ollama Cloud.`;
  }

  if (normalizedError.message === "Missing OLLAMA_API_KEY") {
    return isSpanish
      ? `No se pudo generar ${actionLabel} porque falta configurar \`OLLAMA_API_KEY\`.`
      : `Couldn't generate ${actionLabel} because \`OLLAMA_API_KEY\` is missing.`;
  }

  if (normalizedError.network) {
    const detail = normalizedError.causeMessage
      ? isSpanish
        ? ` Detalle: ${normalizedError.causeMessage}.`
        : ` Detail: ${normalizedError.causeMessage}.`
      : "";

    return isSpanish
      ? `No se pudo conectar con Ollama Cloud.${detail}`
      : `Couldn't connect to Ollama Cloud.${detail}`;
  }

  if (normalizedError.message) {
    return isSpanish
      ? `No se pudo generar ${actionLabel}: ${normalizedError.message}`
      : `Couldn't generate ${actionLabel}: ${normalizedError.message}`;
  }

  return isSpanish
    ? `No se pudo generar ${actionLabel} en este momento.`
    : `Couldn't generate ${actionLabel} right now.`;
}

function buildOllamaChatUrl() {
  const baseUrl = (process.env.OLLAMA_BASE_URL || DEFAULT_OLLAMA_BASE_URL).replace(/\/$/, "");

  return `${baseUrl}/chat`;
}

function buildOllamaHeaders() {
  const baseUrl = (process.env.OLLAMA_BASE_URL || DEFAULT_OLLAMA_BASE_URL).replace(/\/$/, "");
  const apiKey = process.env.OLLAMA_API_KEY?.trim();
  const isCloudHost = baseUrl.startsWith("https://ollama.com");

  if (isCloudHost && !apiKey) {
    throw {
      provider: "ollama" as const,
      message: "Missing OLLAMA_API_KEY"
    };
  }

  return {
    "Content-Type": "application/json",
    ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {})
  };
}

async function buildOllamaError(response: Response) {
  let message = `Ollama returned ${response.status}.`;

  try {
    const errorBody = (await response.json()) as {
      error?: string;
      message?: string;
    };

    if (typeof errorBody.error === "string" && errorBody.error.trim()) {
      message = errorBody.error;
    } else if (typeof errorBody.message === "string" && errorBody.message.trim()) {
      message = errorBody.message;
    }
  } catch {}

  return {
    provider: "ollama" as const,
    status: response.status,
    message
  };
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

  if (startIndex === -1) {
    return null;
  }

  let depth = 0;
  let inString = false;
  let isEscaped = false;

  for (let index = startIndex; index < value.length; index += 1) {
    const character = value[index];

    if (inString) {
      if (isEscaped) {
        isEscaped = false;
        continue;
      }

      if (character === "\\") {
        isEscaped = true;
        continue;
      }

      if (character === "\"") {
        inString = false;
      }

      continue;
    }

    if (character === "\"") {
      inString = true;
      continue;
    }

    if (character === "{") {
      depth += 1;
      continue;
    }

    if (character === "}") {
      depth -= 1;

      if (depth === 0) {
        return value.slice(startIndex, index + 1);
      }
    }
  }

  return null;
}

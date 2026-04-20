import { NextResponse } from "next/server";
import {
  buildAiPriorityInstructions,
  buildAiPriorityRepairInstructions
} from "@/lib/ai-priority-config";
import { AppLanguage } from "@/lib/i18n";
import {
  chatWithOllama,
  getOllamaErrorMessage,
  parseJsonObject
} from "@/lib/ollama";
import { getDaysUntilDueDate } from "@/lib/task-date";
import { getTaskScore } from "@/lib/task-score";
import {
  AiPriorityApiResponse,
  AiPriorityRecommendation,
  AiPriorityTaskInput
} from "@/types/ai-priority";
import { Task } from "@/types/task";

type AiPriorityRequestTask = Pick<
  Task,
  "id" | "title" | "category" | "description" | "priority" | "duration" | "dueDate"
>;

const AI_CACHE_TTL_MS = 5 * 60 * 1000;
const AI_PRIORITY_CACHE_VERSION = 3;

const aiPrioritySchema = {
  type: "object",
  properties: {
    recommendedTaskId: { type: "string" },
    recommendationReason: { type: "string" }
  },
  required: ["recommendedTaskId", "recommendationReason"],
  additionalProperties: false
} as const;

const aiRecommendationCache = new Map<
  string,
  {
    expiresAt: number;
    recommendation: AiPriorityRecommendation;
  }
>();

export async function POST(request: Request) {
  const body = (await request.json()) as {
    tasks?: AiPriorityRequestTask[];
    uiLanguage?: AppLanguage;
  };
  const pendingTasks = Array.isArray(body.tasks) ? body.tasks : [];
  const uiLanguage = body.uiLanguage === "es" ? "es" : "en";

  if (pendingTasks.length === 0) {
    return NextResponse.json<AiPriorityApiResponse>({
      enabled: true,
      recommendation: null,
      error: null
    });
  }

  const taskInputs: AiPriorityTaskInput[] = pendingTasks.map((task) => ({
    id: task.id,
    title: task.title,
    category: task.category,
    description: task.description,
    priority: task.priority,
    duration: task.duration,
    dueDate: task.dueDate,
    dueInDays: getDaysUntilDueDate(task.dueDate),
    systemScore: getTaskScore(task)
  }));

  try {
    const recommendation = await requestOllamaRecommendation(
      taskInputs,
      pendingTasks,
      uiLanguage
    );

    return NextResponse.json<AiPriorityApiResponse>({
      enabled: true,
      recommendation,
      error: null
    });
  } catch (error) {
    console.error("AI priority request failed", error);

    return NextResponse.json<AiPriorityApiResponse>(
      {
        enabled: true,
        recommendation: null,
        error: getOllamaErrorMessage(
          error,
          uiLanguage === "es" ? "la recomendacion de prioridad" : "the priority recommendation",
          uiLanguage
        )
      },
      { status: 502 }
    );
  }
}

async function requestOllamaRecommendation(
  taskInputs: AiPriorityTaskInput[],
  tasks: AiPriorityRequestTask[],
  language: AppLanguage
) {
  const cacheKey = buildRecommendationCacheKey(language, taskInputs);
  const cachedRecommendation = getCachedRecommendation(cacheKey);

  if (cachedRecommendation) {
    return cachedRecommendation;
  }

  const isSingleTask = taskInputs.length === 1;
  const validTaskIds = taskInputs.map((taskInput) => taskInput.id);
  const requestPayload = isSingleTask
    ? {
        recommendedTaskId: taskInputs[0].id,
        allowedTaskIds: validTaskIds,
        task: taskInputs[0]
      }
    : {
        allowedTaskIds: validTaskIds,
        tasks: taskInputs
      };

  const { content, model } = await chatWithOllama({
    format: aiPrioritySchema,
    temperature: 0,
    numPredict: isSingleTask ? 160 : 220,
    messages: [
      {
        role: "system",
        content: buildAiPriorityInstructions(taskInputs.length, language, validTaskIds)
      },
      {
        role: "user",
        content: JSON.stringify(requestPayload)
      }
    ]
  });

  const validRecommendation = await parseAndValidateRecommendation({
    content,
    language,
    model,
    requestPayload,
    taskInputs,
    tasks,
    validTaskIds
  });

  if (!validRecommendation) {
    throw new Error(
      language === "es"
        ? "Ollama Cloud respondio, pero no devolvio una recomendacion valida."
        : "Ollama Cloud responded, but it did not return a valid recommendation."
    );
  }

  const recommendation = {
    ...validRecommendation,
    model
  };

  setCachedRecommendation(cacheKey, recommendation);

  return recommendation;
}

async function parseAndValidateRecommendation(input: {
  content: string;
  language: AppLanguage;
  model: string;
  requestPayload: object;
  taskInputs: AiPriorityTaskInput[];
  tasks: AiPriorityRequestTask[];
  validTaskIds: string[];
}) {
  const firstPassRecommendation = validateRecommendation(
    parseJsonObject<Omit<AiPriorityRecommendation, "model">>(input.content),
    input.tasks
  );

  if (firstPassRecommendation) {
    return firstPassRecommendation;
  }

  console.warn("Invalid AI priority response received from Ollama Cloud", {
    model: input.model,
    content: input.content
  });

  const { content: repairedContent } = await chatWithOllama({
    format: aiPrioritySchema,
    temperature: 0,
    numPredict: 220,
    messages: [
      {
        role: "system",
        content: buildAiPriorityRepairInstructions(input.language, input.validTaskIds)
      },
      {
        role: "user",
        content: JSON.stringify({
          tasks: input.taskInputs,
          originalRequest: input.requestPayload,
          originalModelOutput: input.content
        })
      }
    ]
  });

  return validateRecommendation(
    parseJsonObject<Omit<AiPriorityRecommendation, "model">>(repairedContent),
    input.tasks
  );
}

function validateRecommendation(
  value: Omit<AiPriorityRecommendation, "model"> | null,
  tasks: AiPriorityRequestTask[]
): Omit<AiPriorityRecommendation, "model"> | null {
  if (!value) {
    return null;
  }

  const validTaskIds = new Set(tasks.map((task) => task.id));
  const recommendationReason =
    typeof value.recommendationReason === "string"
      ? value.recommendationReason.replace(/\s+/g, " ").trim()
      : "";

  if (
    typeof value.recommendedTaskId !== "string" ||
    !validTaskIds.has(value.recommendedTaskId) ||
    recommendationReason.length < 12
  ) {
    return null;
  }

  return {
    recommendedTaskId: value.recommendedTaskId,
    recommendationReason
  };
}

function buildRecommendationCacheKey(
  language: AppLanguage,
  taskInputs: AiPriorityTaskInput[]
) {
  return JSON.stringify({
    version: AI_PRIORITY_CACHE_VERSION,
    language,
    taskInputs
  });
}

function getCachedRecommendation(cacheKey: string) {
  const cachedEntry = aiRecommendationCache.get(cacheKey);

  if (!cachedEntry) {
    return null;
  }

  if (cachedEntry.expiresAt <= Date.now()) {
    aiRecommendationCache.delete(cacheKey);
    return null;
  }

  return cachedEntry.recommendation;
}

function setCachedRecommendation(
  cacheKey: string,
  recommendation: AiPriorityRecommendation
) {
  aiRecommendationCache.set(cacheKey, {
    expiresAt: Date.now() + AI_CACHE_TTL_MS,
    recommendation
  });
}

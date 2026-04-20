import { NextResponse } from "next/server";
import {
  buildAiTaskHelpInstructions,
  buildAiTaskHelpRepairInstructions
} from "@/lib/ai-task-help-config";
import { AppLanguage } from "@/lib/i18n";
import {
  chatWithOllama,
  getOllamaErrorMessage,
  parseJsonObject
} from "@/lib/ollama";
import { getDaysUntilDueDate } from "@/lib/task-date";
import { getTaskScore } from "@/lib/task-score";
import {
  AiTaskHelpApiResponse,
  AiTaskHelpClarification,
  AiTaskHelpResult,
  AiTaskHelpTaskInput
} from "@/types/ai-task-help";
import { Task } from "@/types/task";

type AiTaskHelpRequestTask = Pick<
  Task,
  "id" | "title" | "category" | "description" | "priority" | "duration" | "dueDate"
>;

type QuestionIntent =
  | "drink_pairing"
  | "ingredients"
  | "shopping_list"
  | "recipe_steps"
  | "time"
  | "tools"
  | "general";

const AI_CACHE_TTL_MS = 5 * 60 * 1000;
const AI_TASK_HELP_CACHE_VERSION = 8;

const aiTaskHelpSchema = {
  type: "object",
  properties: {
    status: { type: "string", enum: ["answer", "needs_clarification"] },
    understanding: { type: "string" },
    answer: { type: "string" },
    clarificationQuestion: { type: "string" },
    missingContext: {
      type: "array",
      items: { type: "string" }
    },
    actionPlan: {
      type: "array",
      items: { type: "string" }
    },
    artifactTitle: { type: "string" },
    artifact: { type: "string" }
  },
  required: [
    "status",
    "understanding",
    "answer",
    "clarificationQuestion",
    "missingContext",
    "actionPlan",
    "artifactTitle",
    "artifact"
  ],
  additionalProperties: false
} as const;

const aiTaskHelpCache = new Map<
  string,
  {
    expiresAt: number;
    result: AiTaskHelpResult;
  }
>();

export async function POST(request: Request) {
  const body = (await request.json()) as {
    task?: AiTaskHelpRequestTask;
    question?: string;
    clarificationTrail?: AiTaskHelpClarification[];
    recommendationReason?: string;
    uiLanguage?: AppLanguage;
  };
  const task = isValidTask(body.task) ? body.task : null;
  const question = typeof body.question === "string" ? body.question.trim() : "";
  const clarificationTrail = normalizeClarificationTrail(body.clarificationTrail);
  const recommendationReason =
    typeof body.recommendationReason === "string" ? body.recommendationReason.trim() : "";
  const uiLanguage = body.uiLanguage === "es" ? "es" : "en";

  if (!task || !question) {
    return NextResponse.json<AiTaskHelpApiResponse>(
      {
        enabled: true,
        result: null,
        error:
          uiLanguage === "es"
            ? "Faltan datos para pedir ayuda sobre esta tarea."
            : "Missing data to ask for help with this task."
      },
      { status: 400 }
    );
  }

  const taskInput: AiTaskHelpTaskInput = {
    id: task.id,
    title: task.title,
    category: task.category,
    description: task.description,
    priority: task.priority,
    duration: task.duration,
    dueDate: task.dueDate,
    dueInDays: getDaysUntilDueDate(task.dueDate),
    systemScore: getTaskScore(task)
  };
  const questionIntent = detectQuestionIntent(question, taskInput);

  try {
    const result = await requestTaskHelp({
      task: taskInput,
      question,
      clarificationTrail,
      recommendationReason,
      responseLanguage: uiLanguage,
      questionIntent
    });

    return NextResponse.json<AiTaskHelpApiResponse>({
      enabled: true,
      result,
      error: null
    });
  } catch (error) {
    console.error("AI task help request failed", error);

    return NextResponse.json<AiTaskHelpApiResponse>(
      {
        enabled: true,
        result: null,
        error: getOllamaErrorMessage(
          error,
          uiLanguage === "es" ? "la ayuda de IA" : "AI help",
          uiLanguage
        )
      },
      { status: 502 }
    );
  }
}

async function requestTaskHelp(input: {
  task: AiTaskHelpTaskInput;
  question: string;
  clarificationTrail: AiTaskHelpClarification[];
  recommendationReason: string;
  responseLanguage: AppLanguage;
  questionIntent: QuestionIntent;
}) {
  const cacheKey = buildTaskHelpCacheKey(input);
  const cachedResult = getCachedTaskHelp(cacheKey);

  if (cachedResult) {
    return cachedResult;
  }

  const { content, model } = await chatWithOllama({
    format: aiTaskHelpSchema,
    temperature: 0.1,
    numPredict: getTaskHelpNumPredict(input),
    messages: [
      {
        role: "system",
        content: buildAiTaskHelpInstructions(
          input.responseLanguage,
          input.questionIntent,
          input.clarificationTrail.length > 0
        )
      },
      {
        role: "user",
        content: JSON.stringify({
          task: input.task,
          recommendationReason: input.recommendationReason,
          questionIntent: input.questionIntent,
          userQuestion: input.question,
          clarificationTrail: input.clarificationTrail
        })
      }
    ]
  });

  const validResult = await parseAndValidateTaskHelpResult({
    content,
    input,
    model
  });

  if (!validResult || !isResultCompatibleWithIntent(validResult, input.questionIntent)) {
    throw new Error(
      input.responseLanguage === "es"
        ? "Ollama Cloud respondio, pero no devolvio una ayuda valida."
        : "Ollama Cloud responded, but it did not return valid help."
    );
  }

  const result = {
    ...validResult,
    model
  };

  setCachedTaskHelp(cacheKey, result);

  return result;
}

async function parseAndValidateTaskHelpResult(input: {
  content: string;
  input: {
    task: AiTaskHelpTaskInput;
    question: string;
    clarificationTrail: AiTaskHelpClarification[];
    recommendationReason: string;
    responseLanguage: AppLanguage;
    questionIntent: QuestionIntent;
  };
  model: string;
}) {
  const firstPassResult = validateTaskHelpResult(
    parseJsonObject<Omit<AiTaskHelpResult, "model">>(input.content)
  );

  if (firstPassResult) {
    return firstPassResult;
  }

  console.warn("Invalid AI task-help response received from Ollama Cloud", {
    model: input.model,
    content: input.content
  });

  const { content: repairedContent } = await chatWithOllama({
    format: aiTaskHelpSchema,
    temperature: 0,
    numPredict: getTaskHelpNumPredict(input.input),
    messages: [
      {
        role: "system",
        content: buildAiTaskHelpRepairInstructions(
          input.input.responseLanguage,
          input.input.questionIntent,
          input.input.clarificationTrail.length > 0
        )
      },
      {
        role: "user",
        content: JSON.stringify({
          task: input.input.task,
          recommendationReason: input.input.recommendationReason,
          questionIntent: input.input.questionIntent,
          userQuestion: input.input.question,
          clarificationTrail: input.input.clarificationTrail,
          originalModelOutput: input.content
        })
      }
    ]
  });

  return validateTaskHelpResult(
    parseJsonObject<Omit<AiTaskHelpResult, "model">>(repairedContent)
  );
}

function validateTaskHelpResult(
  value: Omit<AiTaskHelpResult, "model"> | null
): Omit<AiTaskHelpResult, "model"> | null {
  if (!value) {
    return null;
  }

  const normalizedStatus =
    value.status === "needs_clarification" ? "needs_clarification" : "answer";
  const understanding = normalizeText(value.understanding);
  const answer = normalizeText(value.answer);
  const clarificationQuestion = normalizeText(value.clarificationQuestion);
  const missingContext = normalizeStringArray(value.missingContext);
  const actionPlan = normalizeStringArray(value.actionPlan).slice(0, 5);
  const artifactTitle = normalizeText(value.artifactTitle);
  const artifact = normalizeText(value.artifact);

  if (!understanding || !answer) {
    return null;
  }

  if (normalizedStatus === "needs_clarification") {
    if (!clarificationQuestion) {
      return null;
    }

    return {
      status: "needs_clarification",
      understanding,
      answer,
      clarificationQuestion,
      missingContext,
      actionPlan: [],
      artifactTitle: "",
      artifact: ""
    };
  }

  if (actionPlan.length < 3 || !artifactTitle || !artifact) {
    return null;
  }

  return {
    status: "answer",
    understanding,
    answer,
    clarificationQuestion: "",
    missingContext: [],
    actionPlan,
    artifactTitle,
    artifact
  };
}

function buildTaskHelpCacheKey(input: {
  task: AiTaskHelpTaskInput;
  question: string;
  clarificationTrail: AiTaskHelpClarification[];
  recommendationReason: string;
  responseLanguage: AppLanguage;
  questionIntent: QuestionIntent;
}) {
  return JSON.stringify({
    version: AI_TASK_HELP_CACHE_VERSION,
    input
  });
}

function getTaskHelpNumPredict(input: {
  task: AiTaskHelpTaskInput;
  question: string;
  clarificationTrail: AiTaskHelpClarification[];
  recommendationReason: string;
  responseLanguage: AppLanguage;
  questionIntent: QuestionIntent;
}) {
  const contextSize =
    input.task.description.length +
    input.question.length +
    input.recommendationReason.length +
    input.clarificationTrail.reduce(
      (total, item) => total + item.question.length + item.answer.length,
      0
    );

  if (contextSize < 240) {
    return 320;
  }

  if (contextSize < 520) {
    return 420;
  }

  return 520;
}

function getCachedTaskHelp(cacheKey: string) {
  const cachedEntry = aiTaskHelpCache.get(cacheKey);

  if (!cachedEntry) {
    return null;
  }

  if (cachedEntry.expiresAt <= Date.now()) {
    aiTaskHelpCache.delete(cacheKey);
    return null;
  }

  return cachedEntry.result;
}

function setCachedTaskHelp(cacheKey: string, result: AiTaskHelpResult) {
  aiTaskHelpCache.set(cacheKey, {
    expiresAt: Date.now() + AI_CACHE_TTL_MS,
    result
  });
}

function isValidTask(value: unknown): value is AiTaskHelpRequestTask {
  if (!value || typeof value !== "object") {
    return false;
  }

  const task = value as AiTaskHelpRequestTask;

  return (
    typeof task.id === "string" &&
    typeof task.title === "string" &&
    typeof task.category === "string" &&
    typeof task.description === "string" &&
    (task.priority === "low" || task.priority === "medium" || task.priority === "high") &&
    (task.duration === "short" || task.duration === "medium" || task.duration === "long") &&
    typeof task.dueDate === "string"
  );
}

function normalizeClarificationTrail(value: unknown): AiTaskHelpClarification[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const clarification = item as AiTaskHelpClarification;
    const question =
      typeof clarification.question === "string" ? clarification.question.trim() : "";
    const answer =
      typeof clarification.answer === "string" ? clarification.answer.trim() : "";

    if (!question || !answer) {
      return [];
    }

    return [
      {
        question,
        answer
      }
    ];
  });
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function detectQuestionIntent(
  question: string,
  task: AiTaskHelpTaskInput
): QuestionIntent {
  const normalizedQuestion = question.toLowerCase();
  const context = buildTaskContextText(task, question);

  if (looksLikeDrinkQuestion(normalizedQuestion) && looksLikeFoodTask(context)) {
    return "drink_pairing";
  }

  if (looksLikeShoppingQuestion(normalizedQuestion)) {
    return "shopping_list";
  }

  if (looksLikeMaterialsQuestion(normalizedQuestion)) {
    return "ingredients";
  }

  if (looksLikeRecipeStepsQuestion(normalizedQuestion)) {
    return "recipe_steps";
  }

  if (looksLikeTimeQuestion(normalizedQuestion)) {
    return "time";
  }

  if (looksLikeToolsQuestion(normalizedQuestion)) {
    return "tools";
  }

  return "general";
}

function buildTaskContextText(task: AiTaskHelpTaskInput, question: string) {
  return [task.title, task.category, task.description, question]
    .join(" ")
    .toLowerCase();
}

function isResultCompatibleWithIntent(
  result: Omit<AiTaskHelpResult, "model">,
  questionIntent: QuestionIntent
) {
  if (questionIntent === "general") {
    return true;
  }

  const searchableText = [
    result.understanding,
    result.answer,
    result.artifactTitle,
    result.artifact,
    ...result.actionPlan
  ]
    .join(" ")
    .toLowerCase();

  if (questionIntent === "drink_pairing") {
    return containsAnyKeyword(searchableText, DRINK_RESULT_KEYWORDS);
  }

  if (questionIntent === "ingredients" || questionIntent === "shopping_list") {
    return containsAnyKeyword(searchableText, INGREDIENT_RESULT_KEYWORDS);
  }

  if (questionIntent === "recipe_steps") {
    return containsAnyKeyword(searchableText, RECIPE_STEP_RESULT_KEYWORDS);
  }

  if (questionIntent === "time") {
    return containsAnyKeyword(searchableText, TIME_RESULT_KEYWORDS);
  }

  if (questionIntent === "tools") {
    return containsAnyKeyword(searchableText, TOOL_RESULT_KEYWORDS);
  }

  return true;
}

function containsAnyKeyword(value: string, keywords: string[]) {
  return keywords.some((keyword) => value.includes(keyword));
}

function looksLikeFoodTask(value: string) {
  return FOOD_KEYWORDS.some((keyword) => value.includes(keyword));
}

function looksLikeMaterialsQuestion(value: string) {
  return MATERIALS_QUESTION_KEYWORDS.some((keyword) => value.includes(keyword));
}

function looksLikeShoppingQuestion(value: string) {
  return SHOPPING_QUESTION_KEYWORDS.some((keyword) => value.includes(keyword));
}

function looksLikeDrinkQuestion(value: string) {
  return DRINK_QUESTION_KEYWORDS.some((keyword) => value.includes(keyword));
}

function looksLikeRecipeStepsQuestion(value: string) {
  return RECIPE_STEP_QUESTION_KEYWORDS.some((keyword) => value.includes(keyword));
}

function looksLikeTimeQuestion(value: string) {
  return TIME_QUESTION_KEYWORDS.some((keyword) => value.includes(keyword));
}

function looksLikeToolsQuestion(value: string) {
  return TOOL_QUESTION_KEYWORDS.some((keyword) => value.includes(keyword));
}

const FOOD_KEYWORDS = [
  "pizza",
  "cocinar",
  "cocina",
  "receta",
  "ingrediente",
  "ingredientes",
  "comida",
  "horno",
  "masa",
  "salsa",
  "queso",
  "cook",
  "recipe",
  "ingredient",
  "ingredients",
  "meal",
  "dish",
  "bake"
];

const MATERIALS_QUESTION_KEYWORDS = [
  "que necesito",
  "que hace falta",
  "ingredientes",
  "ingredient",
  "ingredients",
  "materials",
  "materiales",
  "what do i need",
  "what is needed",
  "lista de compras",
  "shopping list",
  "resources"
];

const SHOPPING_QUESTION_KEYWORDS = [
  "shopping list",
  "lista de compras",
  "what should i buy",
  "what do i buy",
  "que compro",
  "que deberia comprar",
  "buy first"
];

const DRINK_QUESTION_KEYWORDS = [
  "drink",
  "drinks",
  "beverage",
  "beverages",
  "pairing",
  "maridaje",
  "tomar",
  "para tomar",
  "que bebida",
  "que tomar",
  "what should i drink",
  "what drink",
  "best drink"
];

const RECIPE_STEP_QUESTION_KEYWORDS = [
  "how do i make",
  "how to make",
  "como hago",
  "como preparar",
  "pasos",
  "steps",
  "recipe",
  "cook it",
  "prepararla",
  "prepararlo"
];

const TIME_QUESTION_KEYWORDS = [
  "how long",
  "cuanto tarda",
  "cuanto tiempo",
  "when should i",
  "cuando deberia",
  "timing",
  "time"
];

const TOOL_QUESTION_KEYWORDS = [
  "what do i use",
  "what tool",
  "tools",
  "tool",
  "utensil",
  "utensils",
  "con que",
  "que herramienta",
  "que necesito usar"
];

const DRINK_RESULT_KEYWORDS = [
  "drink",
  "drinks",
  "beverage",
  "cola",
  "soda",
  "water",
  "lemonade",
  "iced tea",
  "bebida",
  "gaseosa",
  "limonada",
  "agua con gas"
];

const INGREDIENT_RESULT_KEYWORDS = [
  "ingredient",
  "ingredients",
  "shopping",
  "buy",
  "dough",
  "crust",
  "sauce",
  "mozzarella",
  "queso",
  "masa",
  "salsa",
  "lista"
];

const RECIPE_STEP_RESULT_KEYWORDS = [
  "step",
  "steps",
  "preheat",
  "bake",
  "assemble",
  "cook",
  "mix",
  "hornea",
  "precalienta",
  "arma",
  "cocina"
];

const TIME_RESULT_KEYWORDS = [
  "minute",
  "minutes",
  "hour",
  "hours",
  "mins",
  "timing",
  "minuto",
  "minutos",
  "hora",
  "horas"
];

const TOOL_RESULT_KEYWORDS = [
  "oven",
  "tray",
  "pan",
  "knife",
  "board",
  "tool",
  "tools",
  "utensil",
  "horno",
  "bandeja",
  "cuchillo",
  "tabla",
  "herramienta"
];

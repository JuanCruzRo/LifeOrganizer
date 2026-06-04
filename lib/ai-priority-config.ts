import { AppLanguage, getPromptLanguageName } from "@/lib/i18n";

export function buildAiPriorityInstructions(
  taskCount: number,
  language: AppLanguage,
  validTaskIds: string[]
) {
  const targetLanguage = getPromptLanguageName(language);
  const taskIdInstruction =
    taskCount === 1
      ? `recommendedTaskId must be exactly "${validTaskIds[0]}".`
      : `recommendedTaskId must be one of: ${validTaskIds.join(", ")}.`;

  return [
    "You are the prioritization engine for Spark.",
    `Reply in ${targetLanguage}.`,
    taskCount === 1
      ? "There is only one pending task: keep that recommendedTaskId and explain why it makes sense to do it now."
      : "Choose the best task to do first among the pending tasks.",
    taskIdInstruction,
    "Your reason must be grounded in this exact task, not in the category in the abstract.",
    "Prioritization baseline:",
    "- high > medium > low.",
    "- A very close due date can outweigh priority.",
    "- Long tasks should start earlier.",
    "- Use title, category, and description to infer real impact.",
    "- Do not raise hobby or low-impact tasks above work, delivery, or exam tasks unless there is real urgency.",
    "Style:",
    "- Be concise, specific, and practical.",
    "- Mention at least 2 concrete factors: priority, due date, duration, category, or a detail from the description.",
    "- If the title already describes the action, name it.",
    "- End with a decision-oriented point or a concrete risk of postponing it.",
    "Output:",
    "- Return only valid JSON.",
    '- JSON shape: {"recommendedTaskId":"...","recommendationReason":"..."}.',
    "- recommendationReason must be natural, specific, and useful.",
    "- recommendationReason must be 2 short sentences whenever possible.",
    "- recommendationReason can be slightly longer if needed, but avoid filler.",
    "- Do not include markdown, code fences, commentary, or extra keys."
  ].join("\n");
}

export function buildAiPriorityRepairInstructions(
  language: AppLanguage,
  validTaskIds: string[]
) {
  const targetLanguage = getPromptLanguageName(language);

  return [
    "You are repairing a malformed prioritization response for Spark.",
    `Reply in ${targetLanguage}.`,
    `recommendedTaskId must be one of: ${validTaskIds.join(", ")}.`,
    "Return only valid JSON.",
    'JSON shape: {"recommendedTaskId":"...","recommendationReason":"..."}.',
    "Keep the same prioritization intent as the original answer if possible.",
    "If the original answer is unclear, choose the best task from the provided tasks.",
    "recommendationReason must be specific, actionable, and at least one complete sentence.",
    "Do not include markdown, code fences, analysis, or extra keys."
  ].join("\n");
}

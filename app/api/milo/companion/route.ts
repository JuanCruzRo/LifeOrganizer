import "server-only";
import { NextResponse } from "next/server";
import { AppLanguage, supportedLanguages } from "@/lib/i18n";
import { chatWithMilo } from "@/lib/milo";
import { requireAuth, getUserPlan } from "@/lib/server-auth";
import { consumeDailyUsage } from "@/lib/usage-limits";

const MAX_FIELD = 300;

const LANGUAGE_NAMES: Record<AppLanguage, string> = {
  en: "English", es: "neutral Spanish (use tú, never voseo)", pt: "Brazilian Portuguese",
  fr: "French", de: "German", it: "Italian", zh: "Simplified Chinese", ja: "Japanese",
  ko: "Korean", ru: "Russian", tr: "Turkish", nl: "Dutch", pl: "Polish"
};

/** Where in the session this check-in happens. */
export type CompanionMoment = "start" | "middle" | "end" | "stuck";

type Body = {
  moment?: unknown;
  taskTitle?: unknown;
  currentStep?: unknown;
  stepsDone?: unknown;
  stepsTotal?: unknown;
  minutes?: unknown;
  uiLanguage?: unknown;
};

const MOMENT_BRIEF: Record<CompanionMoment, string> = {
  start: "They are starting the session right now. Name the step and wish them a good start.",
  middle: "They are halfway through the timer. Check in briefly and remind them of the step.",
  end: "The timer just ended. Acknowledge the effort honestly, based on how many steps got done. You may mention sessionMinutes as digits (for example \"25 min\"), never spelled out in words.",
  stuck: "They just said they are stuck. Offer ONE smaller way into the same step, or suggest a 2-minute break."
};

export async function POST(request: Request) {
  let userId: string;
  try { userId = await requireAuth(); }
  catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }

  const plan = await getUserPlan(userId);
  if (plan !== "pro") {
    return NextResponse.json({ enabled: false, message: null });
  }

  const body = (await request.json().catch(() => ({}))) as Body;
  const moment: CompanionMoment =
    body.moment === "start" || body.moment === "middle" || body.moment === "end" || body.moment === "stuck"
      ? body.moment
      : "middle";
  const taskTitle = typeof body.taskTitle === "string" ? body.taskTitle.trim().slice(0, MAX_FIELD) : "";
  const currentStep = typeof body.currentStep === "string" ? body.currentStep.trim().slice(0, MAX_FIELD) : "";
  const stepsDone = Number.isFinite(body.stepsDone) ? Math.max(0, Math.min(50, Number(body.stepsDone))) : 0;
  const stepsTotal = Number.isFinite(body.stepsTotal) ? Math.max(0, Math.min(50, Number(body.stepsTotal))) : 0;
  const minutes = Number.isFinite(body.minutes) ? Math.max(1, Math.min(180, Number(body.minutes))) : 25;
  const language: AppLanguage = supportedLanguages.includes(body.uiLanguage as AppLanguage)
    ? (body.uiLanguage as AppLanguage)
    : "en";

  if (!taskTitle) return NextResponse.json({ error: "Missing task" }, { status: 400 });

  const usage = await consumeDailyUsage(userId, "milo_companion", plan);
  if (!usage.allowed) return NextResponse.json({ enabled: true, message: null, limited: true });

  const context = `You are Milo, sitting with someone while they work. This is body doubling: your job is presence, not advice.
${MOMENT_BRIEF[moment]}
Rules:
- ONE or TWO short sentences. Under 25 words in total.
- Warm and plain. Never cheerful filler, never exclamation stacking, at most one emoji and usually none.
- Do not lecture, do not list tips, do not ask more than one question.
- Never invent what they have done; use only the numbers given.
- Never say how much time has passed or how much is left: you are not told, and guessing is wrong.
- Write in ${LANGUAGE_NAMES[language]}.
Reply with the sentence only, no quotes.`;

  try {
    const { content } = await chatWithMilo({
      // The session length is only shared at the end, where it can be stated safely.
      message: JSON.stringify({
        taskTitle,
        currentStep,
        stepsDone,
        stepsTotal,
        ...(moment === "end" ? { sessionMinutes: minutes } : {})
      }),
      context,
      timeoutMs: 12000,
      maxTokens: 120
    });
    const message = content.replace(/^["'\s]+|["'\s]+$/g, "").slice(0, 300);
    return NextResponse.json({ enabled: true, message: message || null });
  } catch (error) {
    console.error("milo companion failed", error);
    return NextResponse.json({ enabled: true, message: null });
  }
}

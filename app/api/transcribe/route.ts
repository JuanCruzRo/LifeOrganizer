import "server-only";
import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { AppLanguage, supportedLanguages } from "@/lib/i18n";
import { requireAuth, getUserPlan } from "@/lib/server-auth";
import { consumeDailyUsage } from "@/lib/usage-limits";

// Groq accepts up to 25 MB; a couple of minutes of Opus is far below that.
const MAX_BYTES = 8 * 1024 * 1024;
const MODEL = process.env.GROQ_WHISPER_MODEL ?? "whisper-large-v3-turbo";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: Request) {
  let userId: string;
  try { userId = await requireAuth(); }
  catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }

  const form = await request.formData().catch(() => null);
  const file = form?.get("audio");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "MISSING_AUDIO" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "TOO_LONG" }, { status: 413 });
  }

  const langParam = form?.get("language");
  const language: AppLanguage | undefined = supportedLanguages.includes(langParam as AppLanguage)
    ? (langParam as AppLanguage)
    : undefined;

  const plan = await getUserPlan(userId);
  const usage = await consumeDailyUsage(userId, "transcribe", plan);
  if (!usage.allowed) {
    return NextResponse.json({ error: "DAILY_LIMIT_REACHED", limit: usage.limit }, { status: 429 });
  }

  try {
    const result = await groq.audio.transcriptions.create({
      file,
      model: MODEL,
      // Telling Whisper the language avoids it guessing wrong on short clips.
      ...(language ? { language } : {}),
      response_format: "json",
      temperature: 0
    });
    const text = (result.text ?? "").trim();
    return NextResponse.json({ text });
  } catch (error) {
    console.error("transcribe failed", error);
    return NextResponse.json({ error: "TRANSCRIBE_FAILED" }, { status: 502 });
  }
}

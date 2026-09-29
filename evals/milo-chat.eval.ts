import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect, afterAll } from "vitest";
import { chatWithMilo } from "@/lib/milo";
import { buildTaskContext } from "@/lib/milo-chat-prompt";
import { parseTaskActions } from "@/lib/task-actions";
import { CASES, NOW, type EvalCase } from "./milo-cases";
import type { TaskInput } from "@/types/task";

// CLI flags: --filter <substring>  --repeat <n>
const argv = process.argv.slice(2);
const flag = (name: string) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? undefined : argv[i + 1];
};

const FILTER = flag("filter") ?? process.env.EVAL_FILTER;
const REPEAT = Math.max(1, Number(flag("repeat") ?? process.env.EVAL_REPEAT ?? 1));

// The Groq plan allows 200k tokens per DAY for the whole account. A full run is
// ~70 calls at ~1.8k tokens each, so an unthrottled loop can spend the day and
// leave the live app unable to answer. Fail loudly instead of silently 429ing
// halfway through.
const RUN_BUDGET_TOKENS = 180_000;
let tokensSpent = 0;

const selected = FILTER
  ? CASES.filter((c) => c.name.toLowerCase().includes(FILTER.toLowerCase()))
  : CASES;

if (!process.env.GROQ_API_KEY) {
  describe("milo eval", () => {
    it("needs GROQ_API_KEY", () => {
      expect.fail("GROQ_API_KEY is not set. Copy .env.example to .env.local.");
    });
  });
} else {
  const transcript: Array<Record<string, unknown>> = [];

  const runCase = async (testCase: EvalCase, isPro: boolean) => {
    const now = testCase.now ?? NOW;
    const canCreateTasks = (testCase.plan ?? "pro") !== "free";
    const context = buildTaskContext({
      tasks: testCase.tasks ?? [],
      canCreateTasks,
      userMemory: testCase.userMemory ?? "",
      now
    });

    const { content } = await chatWithMilo({
      message: testCase.message,
      context,
      history: (testCase.history ?? []).map((m) => ({
        role: m.role === "milo" ? ("assistant" as const) : ("user" as const),
        content: m.content
      })),
      isPro
    });

    const parsed = parseTaskActions(content, now);
    return {
      raw: content,
      text: parsed.text,
      tasks: parsed.taskActions,
      error: parsed.error,
      usage: Math.round(context.length / 3.8) + Math.round(content.length / 3.8) + 250
    };
  };

  const fail = (msg: string) => {
    throw new Error(msg);
  };

  /**
   * Discomfort checks that apply to EVERY case, whatever it expects. These came
   * out of the first real run: the pro model told users "he creado la tarea" when
   * nothing existed yet (the user still has to confirm), it invented tasks when
   * someone only asked how they were doing, and it slipped into "¿quieres?" in an
   * app that is entirely voseo.
   */
  const GLOBAL_CHECKS: Array<{ name: string; test: (text: string) => string | null }> = [
    {
      name: "no-falsa-afirmacion",
      test: (text) => {
        const m = text.match(
          /\b(he creado|he agregado|he añadido|he agendado|listo,? (ya )?agendad[oa]|ya (te lo )?(guardé|agendé|anoté)|queda (registrada|agendada|guardada)|añadí un recordatorio|creé la tarea)\b/i
        );
        return m
          ? `told the user the task already exists ("${m[0]}"), but nothing exists until they confirm`
          : null;
      }
    },
    {
      name: "sin-tuteo",
      test: (text) => {
        const m = text.match(/\b(tienes|puedes|quieres|necesitas|elige|hazlo)\b/i);
        return m ? `used tuteo ("${m[0]}") in a voseo-only app` : null;
      }
    },
    {
      name: "sin-json-filtrado",
      test: (text) => {
        if (/"title"\s*:/.test(text)) return "raw task JSON leaked into the visible reply";
        if (/```/.test(text)) return "a code fence leaked into the visible reply";
        return null;
      }
    }
  ];

  const check = (
    testCase: EvalCase,
    out: { text: string; tasks: TaskInput[]; error: string | null }
  ) => {
    const e = testCase.expectation;
    const titles = out.tasks.map((t) => t.title.toLowerCase());
    const dates = out.tasks.map((t) => t.dueDate);

    // The block was present but unusable: this is the exact failure the report
    // came from, so it must never be tolerated silently.
    if (out.error) {
      fail(`milo emitted a TASKS_ACTION block that we could not parse: ${out.error}`);
    }

    for (const global of GLOBAL_CHECKS) {
      const problem = global.test(out.text);
      if (problem) {
        fail(`[${global.name}] ${problem}. reply: ${JSON.stringify(out.text.slice(0, 220))}`);
      }
    }

    if (e.tasks === "some") {
      if (out.tasks.length === 0) {
        fail(`expected at least one task, got none. reply: ${JSON.stringify(out.text)}`);
      }
      for (const t of e.titles ?? []) {
        if (!titles.some((title) => title.includes(t.toLowerCase()))) {
          fail(`expected a task containing "${t}", got [${titles.join(" | ")}]`);
        }
      }
      for (const d of e.dates ?? []) {
        if (!dates.includes(d)) {
          fail(`expected a task due ${d}, got [${dates.join(" | ")}]`);
        }
      }
      for (const d of e.datesOnOrBefore ?? []) {
        if (!dates.some((actual) => actual <= d)) {
          fail(`expected a task on or before ${d}, got [${dates.join(" | ")}]`);
        }
      }
      for (const weekday of e.weekdays ?? []) {
        const hit = dates.some((actual) => {
          // Parse as UTC so the weekday is read off the date string itself and
          // not shifted by the runner's timezone.
          const d = new Date(`${actual}T00:00:00Z`);
          return !Number.isNaN(d.getTime()) && d.getUTCDay() === weekday;
        });
        if (!hit) {
          const days = dates.map((a) => `${a}(${new Date(`${a}T00:00:00Z`).getUTCDay()})`);
          fail(`expected a task on weekday ${weekday}, got [${days.join(" | ")}]`);
        }
      }
    } else if (e.tasks === "none" || e.tasks === "either") {
      if (e.tasks === "none" && out.tasks.length > 0) {
        fail(`expected no tasks, got ${out.tasks.length}: [${titles.join(" | ")}]`);
      }
      if (out.text.includes("TASKS_ACTION")) {
        fail("the machine block leaked into the visible reply");
      }
      if (e.mentionsUpgrade && !/\/plans|plus|pro|upgrade/i.test(out.text)) {
        fail(`free-plan reply should mention the upgrade path. got: ${JSON.stringify(out.text)}`);
      }
    }

    if (e.maxChars && out.text.length > e.maxChars) {
      fail(`reply too long: ${out.text.length} chars, budget ${e.maxChars}`);
    }
  };

  const modelLabel = (isPro: boolean) =>
    isPro ? process.env.GROQ_PRO_MODEL ?? "pro model" : process.env.GROQ_MODEL ?? "default model";

  // Groq enforces 200k tokens per day PER MODEL. Targeting one model halves the
  // cost of a run and lets you verify the non-pro experience on its own.
  //   --model default | pro | both   (default: both)
  const MODEL_TARGET = flag("model") ?? process.env.EVAL_MODEL ?? "both";
  const targets: boolean[] =
    MODEL_TARGET === "default" ? [false] : MODEL_TARGET === "pro" ? [true] : [false, true];

  for (const testCase of selected) {
    for (const isPro of targets) {
      for (let run = 0; run < REPEAT; run++) {
        const label =
          REPEAT > 1
            ? `${testCase.name} [${modelLabel(isPro)} #${run + 1}]`
            : `${testCase.name} [${modelLabel(isPro)}]`;

        it(label, async () => {
          if (tokensSpent > RUN_BUDGET_TOKENS) {
            throw new Error(
              `eval budget guard: already spent ~${tokensSpent} of ${RUN_BUDGET_TOKENS} daily tokens. ` +
                `Re-run tomorrow, or narrow it with --filter. The live app shares this quota.`
            );
          }
          const out = await runCase(testCase, isPro);
          tokensSpent += out.usage;
          const entry: Record<string, unknown> = {
            case: testCase.name,
            model: modelLabel(isPro),
            message: testCase.message,
            raw: out.raw,
            visible: out.text,
            tasks: out.tasks,
            parseError: out.error,
            failure: null as string | null
          };
          transcript.push(entry);
          try {
            check(testCase, out);
          } catch (err) {
            const reason = err instanceof Error ? err.message : String(err);
            entry.failure = reason;
            console.error(`\n--- ${label} ---`);
            console.error(`user:  ${testCase.message}`);
            console.error(`milo:  ${out.raw}`);
            console.error(`parsed: ${out.tasks.length} task(s), error=${out.error ?? "none"}`);
            throw err;
          }
        });
      }
    }
  }

  afterAll(() => {
    console.log(
      `\n[milo eval] ~${tokensSpent.toLocaleString("es-AR")} tokens estimados de los 200.000 diarios de Groq.`
    );
    if (process.env.EVAL_TRANSCRIPT) {
      mkdirSync(resolve(process.env.EVAL_TRANSCRIPT), { recursive: true });
      writeFileSync(
        resolve(process.env.EVAL_TRANSCRIPT, "milo-eval.json"),
        JSON.stringify(transcript, null, 2)
      );
    }
  });
}

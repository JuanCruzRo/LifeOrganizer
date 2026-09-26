"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Circle, Pause, Play, Sparkles, X } from "lucide-react";
import { useAppLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { focusCopy, reminderCopy } from "@/lib/focus-copy";
import { showNotification } from "@/lib/use-reminders";
import { cn } from "@/lib/utils";
import type { Task, TaskStep } from "@/types/task";

const DURATIONS = [10, 25, 45];

type FocusModeProps = {
  task: Task;
  isBreaking: boolean;
  onClose: () => void;
  onBreakDown: () => void;
  onToggleStep: (stepId: string) => void;
  onCompleteTask: () => void;
};

// One task, one step, one timer: everything else is hidden on purpose.
export function FocusMode({ task, isBreaking, onClose, onBreakDown, onToggleStep, onCompleteTask }: FocusModeProps) {
  const { language } = useAppLanguage();
  const t = focusCopy[language];
  const [minutes, setMinutes] = useState(25);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  // Tick once per second while running.
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setRunning(false);
          setFinished(true);
          const rt = reminderCopy[language];
          showNotification(rt.focusDone, rt.focusDoneBody);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, language]);

  // Esc closes; lock page scroll behind the overlay.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeRef.current(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, []);

  // Show the countdown in the tab title so it stays visible in the background.
  useEffect(() => {
    const original = document.title;
    if (running) document.title = `${formatClock(remaining)} · ${task.title}`;
    return () => { document.title = original; };
  }, [running, remaining, task.title]);

  function pickDuration(m: number) {
    setMinutes(m);
    setRemaining(m * 60);
    setRunning(false);
    setFinished(false);
  }

  const steps: TaskStep[] = task.steps ?? [];
  const currentStep = steps.find((s) => !s.done);
  const doneCount = steps.filter((s) => s.done).length;
  const progress = 1 - remaining / (minutes * 60);

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-background/95 backdrop-blur-md" role="dialog" aria-modal="true" aria-label={t.focus}>
      <div className="flex items-center justify-between px-5 py-4">
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
          <Sparkles className="h-3.5 w-3.5" /> {t.focus}
        </span>
        <button onClick={onClose} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
          <X className="h-4 w-4" /> {t.exit}
        </button>
      </div>

      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-5 pb-10 text-center">
        <p className="text-sm text-muted-foreground">{t.justThis}</p>
        <h2 className="mt-2 text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">{task.title}</h2>

        {steps.length > 0 ? (
          <motion.div
            key={currentStep?.id ?? "all-done"}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-6 w-full rounded-2xl border border-primary/30 bg-primary/5 p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-primary/90">{doneCount}/{steps.length}</p>
            <p className="mt-2 text-lg font-medium leading-snug">{currentStep ? currentStep.text : t.taskDone}</p>
            <Button
              className="mt-4 gap-1.5"
              onClick={() => (currentStep ? onToggleStep(currentStep.id) : onCompleteTask())}
            >
              <CheckCircle2 className="h-4 w-4" />
              {currentStep ? t.stepDone : t.taskDone}
            </Button>
          </motion.div>
        ) : (
          <div className="mt-6 w-full rounded-2xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">{t.hint}</p>
            <Button className="mt-3 gap-1.5" variant="outline" disabled={isBreaking} onClick={onBreakDown}>
              <Sparkles className="h-4 w-4" />
              {isBreaking ? t.breaking : t.breakDown}
            </Button>
          </div>
        )}

        {/* Timer */}
        <div className="mt-8 flex flex-col items-center">
          <div className="relative flex h-44 w-44 items-center justify-center">
            <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
              <circle cx="50" cy="50" r="46" fill="none" strokeWidth="4" className="stroke-secondary" />
              <circle
                cx="50" cy="50" r="46" fill="none" strokeWidth="4" strokeLinecap="round"
                className="stroke-primary transition-[stroke-dashoffset] duration-1000 ease-linear"
                strokeDasharray={2 * Math.PI * 46}
                strokeDashoffset={2 * Math.PI * 46 * (1 - progress)}
              />
            </svg>
            <span className="font-display text-4xl font-semibold tabular-nums">{formatClock(remaining)}</span>
          </div>

          {finished && <p className="mt-3 text-sm font-medium text-primary">{t.timeUp}</p>}

          <div className="mt-4 flex items-center gap-2">
            {DURATIONS.map((m) => (
              <button
                key={m}
                onClick={() => pickDuration(m)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  minutes === m ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {m} {t.minutes}
              </button>
            ))}
          </div>

          <Button
            className="mt-4 gap-1.5"
            onClick={() => { if (remaining === 0) pickDuration(minutes); setFinished(false); setRunning((r) => !r); }}
          >
            {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {running ? t.pause : remaining < minutes * 60 && remaining > 0 ? t.resume : t.start}
          </Button>
        </div>

        {steps.length > 1 && (
          <ul className="mt-8 w-full space-y-1.5 text-left">
            {steps.map((s) => (
              <li key={s.id}>
                <button onClick={() => onToggleStep(s.id)} className="flex w-full items-start gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-secondary/50">
                  {s.done ? <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" /> : <Circle className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />}
                  <span className={cn(s.done && "text-muted-foreground line-through")}>{s.text}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function formatClock(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

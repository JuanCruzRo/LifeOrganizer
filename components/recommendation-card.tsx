"use client";

import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { useAppLanguage } from "@/components/language-provider";
import {
  createInitialRecommendedTaskHelpState,
  RecommendedTaskHelp,
  type RecommendedTaskHelpState
} from "@/components/recommended-task-help";
import { formatDueDate, getDueDateLabel } from "@/lib/task-date";
import { getTaskDurationLabel } from "@/lib/task-labels";
import { Task } from "@/types/task";

type RecommendationCardProps = {
  hasPendingTasks: boolean;
  isAiLoading: boolean;
  recommendationReason: string;
  recommendedTask: Task | null;
  statusMessage: string;
};

export function RecommendationCard({
  hasPendingTasks,
  isAiLoading,
  recommendationReason,
  recommendedTask,
  statusMessage
}: RecommendationCardProps) {
  const { language } = useAppLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [helpState, setHelpState] = useState<RecommendedTaskHelpState>(() =>
    createInitialRecommendedTaskHelpState()
  );

  useEffect(() => {
    if (!recommendedTask) {
      setIsExpanded(false);
    }
  }, [recommendedTask]);

  useEffect(() => {
    setHelpState(createInitialRecommendedTaskHelpState());
  }, [recommendedTask?.id, language]);

  useEffect(() => {
    if (!isExpanded) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsExpanded(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isExpanded]);

  return (
    <>
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_10px_30px_rgba(24,36,28,0.06)] backdrop-blur">
        <RecommendationCardContent
          hasPendingTasks={hasPendingTasks}
          isAiLoading={isAiLoading}
          isExpanded={false}
          onExpand={recommendedTask ? () => setIsExpanded(true) : undefined}
          helpState={helpState}
          onHelpStateChange={setHelpState}
          recommendationReason={recommendationReason}
          recommendedTask={recommendedTask}
          statusMessage={statusMessage}
        />
      </section>

      {isExpanded && recommendedTask ? (
        <div className="fixed inset-0 z-50 bg-[rgba(24,28,31,0.72)] p-4 backdrop-blur-sm sm:p-6">
          <div className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-[rgba(255,255,255,0.12)] bg-[var(--card)] shadow-[0_30px_80px_rgba(0,0,0,0.28)]">
            <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-4 sm:px-7">
              <ExpandedHeader task={recommendedTask} onClose={() => setIsExpanded(false)} />
            </div>

            <div className="overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
              <RecommendationCardContent
                hasPendingTasks={hasPendingTasks}
                isAiLoading={isAiLoading}
                isExpanded
                onExpand={undefined}
                helpState={helpState}
                onHelpStateChange={setHelpState}
                recommendationReason={recommendationReason}
                recommendedTask={recommendedTask}
                statusMessage={statusMessage}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function ExpandedHeader({ onClose, task }: { onClose: () => void; task: Task }) {
  const { copy } = useAppLanguage();

  return (
    <>
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">
          {copy.recommendation.expandedView}
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">{task.title}</h2>
      </div>
      <button
        className="rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--accent)]"
        onClick={onClose}
        type="button"
      >
        {copy.common.close}
      </button>
    </>
  );
}

type RecommendationCardContentProps = RecommendationCardProps & {
  helpState: RecommendedTaskHelpState;
  isExpanded: boolean;
  onExpand?: () => void;
  onHelpStateChange: Dispatch<SetStateAction<RecommendedTaskHelpState>>;
};

function RecommendationCardContent({
  hasPendingTasks,
  helpState,
  isAiLoading,
  isExpanded,
  onExpand,
  onHelpStateChange,
  recommendationReason,
  recommendedTask,
  statusMessage
}: RecommendationCardContentProps) {
  const { copy, language } = useAppLanguage();
  const heading = recommendedTask
    ? recommendedTask.title
    : hasPendingTasks
      ? isAiLoading
        ? copy.recommendation.awaitingAiTitle
        : copy.recommendation.unavailableTitle
      : copy.common.noPendingTasks;

  return (
    <div className={`flex flex-col ${isExpanded ? "gap-8" : "gap-6"}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className={isExpanded ? "max-w-3xl" : undefined}>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--muted)]">
            {copy.common.todayRecommendation}
          </p>
          <h2
            className={`mt-2 font-semibold tracking-tight ${
              isExpanded ? "text-4xl sm:text-5xl" : "text-2xl"
            }`}
          >
            {heading}
          </h2>
          {recommendationReason ? (
            <p
              className={`mt-3 text-[var(--muted)] ${
                isExpanded ? "max-w-3xl text-base leading-7 sm:text-lg" : "text-sm leading-6 sm:text-base"
              }`}
            >
              {recommendationReason}
            </p>
          ) : isAiLoading && hasPendingTasks ? (
            <div className="mt-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
                <span className="loading-dot" />
                <span className="loading-dot loading-dot-delay-1" />
                <span className="loading-dot loading-dot-delay-2" />
                <span className="ml-1">{copy.recommendation.buildExplanation}</span>
              </div>
              <div className="h-2.5 w-full max-w-[28rem] overflow-hidden rounded-full bg-[rgba(60,64,68,0.1)]">
                <div className="loading-shimmer h-full rounded-full" />
              </div>
            </div>
          ) : statusMessage ? (
            <p
              className={`mt-3 text-[var(--muted)] ${
                isExpanded ? "text-base leading-7 sm:text-lg" : "text-sm leading-6 sm:text-base"
              }`}
            >
              {statusMessage}
            </p>
          ) : null}
        </div>

        {onExpand ? (
          <button
            className="rounded-xl border border-[var(--border)] bg-white/55 px-4 py-3 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--accent)]"
            onClick={onExpand}
            type="button"
          >
            {copy.recommendation.openLarge}
          </button>
        ) : null}
      </div>

      <div
        className={`grid gap-4 rounded-2xl bg-[var(--accent-soft)] ${
          isExpanded ? "p-5 sm:grid-cols-4" : "p-4 sm:grid-cols-3"
        }`}
      >
        <MetaItem label={copy.recommendation.category} value={recommendedTask ? recommendedTask.category : "-"} />
        <MetaItem
          label={copy.recommendation.priority}
          value={recommendedTask ? copy.taskForm.priorities[recommendedTask.priority] : "-"}
        />
        <MetaItem
          label={copy.recommendation.duration}
          value={recommendedTask ? getTaskDurationLabel(recommendedTask.duration, language) : "-"}
        />
        {isExpanded ? (
          <MetaItem
            label={copy.recommendation.dueDate}
            value={
              recommendedTask
                ? `${getDueDateLabel(recommendedTask.dueDate, language)} · ${formatDueDate(recommendedTask.dueDate, language)}`
                : "-"
            }
          />
        ) : null}
      </div>

      {isExpanded && recommendedTask?.description ? (
        <div className="rounded-2xl border border-[var(--border)] bg-white/55 p-5">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
            {copy.recommendation.description}
          </p>
          <p className="mt-3 text-sm leading-7 text-[var(--foreground)] sm:text-base">
            {recommendedTask.description}
          </p>
        </div>
      ) : null}

      {recommendedTask ? (
        <RecommendedTaskHelp
          onStateChange={onHelpStateChange}
          recommendationReason={recommendationReason}
          state={helpState}
          task={recommendedTask}
          uiLanguage={language}
        />
      ) : null}
    </div>
  );
}

type MetaItemProps = {
  label: string;
  value: string;
};

function MetaItem({ label, value }: MetaItemProps) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-[var(--foreground)] sm:text-base">{value}</p>
    </div>
  );
}

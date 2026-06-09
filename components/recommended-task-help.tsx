"use client";

import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { useAppLanguage } from "@/components/language-provider";
import { getAuthToken } from "@/lib/auth";
import { formatAiDisplayText } from "@/lib/format-ai-display-text";
import {
  AiTaskHelpApiResponse,
  AiTaskHelpClarification,
  AiTaskHelpResult
} from "@/types/ai-task-help";
import { Task } from "@/types/task";

type RecommendedTaskHelpProps = {
  state?: RecommendedTaskHelpState;
  onStateChange?: Dispatch<SetStateAction<RecommendedTaskHelpState>>;
  recommendationReason: string;
  task: Task;
  uiLanguage: "en" | "es";
};

type HelpHistoryEntry = {
  id: string;
  primaryQuestion: string;
  clarificationTrail: AiTaskHelpClarification[];
  result: AiTaskHelpResult;
};

export type RecommendedTaskHelpState = {
  activeHistoryIndex: number;
  currentThreadId: string | null;
  isOpen: boolean;
  draft: string;
  primaryQuestion: string;
  pendingClarificationQuestion: string;
  clarificationTrail: AiTaskHelpClarification[];
  history: HelpHistoryEntry[];
  result: AiTaskHelpResult | null;
  errorMessage: string;
  isLoading: boolean;
};

export function createInitialRecommendedTaskHelpState(): RecommendedTaskHelpState {
  return {
    activeHistoryIndex: -1,
    currentThreadId: null,
    isOpen: false,
    draft: "",
    primaryQuestion: "",
    pendingClarificationQuestion: "",
    clarificationTrail: [],
    history: [],
    result: null,
    errorMessage: "",
    isLoading: false
  };
}

export function RecommendedTaskHelp({
  state: controlledState,
  onStateChange,
  recommendationReason,
  task,
  uiLanguage
}: RecommendedTaskHelpProps) {
  const { copy } = useAppLanguage();
  const [internalState, setInternalState] = useState<RecommendedTaskHelpState>(() =>
    createInitialRecommendedTaskHelpState()
  );
  const isControlled = controlledState !== undefined && onStateChange !== undefined;
  const state = controlledState ?? internalState;
  const setState = onStateChange ?? setInternalState;
  const {
    activeHistoryIndex,
    isOpen,
    draft,
    primaryQuestion,
    pendingClarificationQuestion,
    clarificationTrail,
    history,
    result,
    errorMessage,
    isLoading
  } = state;
  const selectedHistoryIndex = activeHistoryIndex >= 0 ? activeHistoryIndex : history.length - 1;
  const selectedHistoryEntry =
    selectedHistoryIndex >= 0 ? history[selectedHistoryIndex] ?? null : null;
  const isViewingLatestHistory =
    !selectedHistoryEntry || selectedHistoryIndex === history.length - 1;
  const displayedPrimaryQuestion = selectedHistoryEntry?.primaryQuestion ?? primaryQuestion;
  const displayedClarificationTrail =
    selectedHistoryEntry?.clarificationTrail ?? clarificationTrail;
  const displayedResult = selectedHistoryEntry?.result ?? result;
  const displayedPendingClarificationQuestion =
    displayedResult?.status === "needs_clarification"
      ? displayedResult.clarificationQuestion
      : isViewingLatestHistory
        ? pendingClarificationQuestion
        : "";
  const isClarificationStep = Boolean(pendingClarificationQuestion);

  useEffect(() => {
    if (!isControlled) {
      setState(createInitialRecommendedTaskHelpState());
    }
  }, [isControlled, setState, task.id]);

  async function handleSubmit() {
    const trimmedDraft = draft.trim();

    if (!trimmedDraft) {
      return;
    }

    const startsNewQuestion = !isClarificationStep && result?.status === "answer";
    const nextPrimaryQuestion =
      startsNewQuestion || !primaryQuestion ? trimmedDraft : primaryQuestion;
    const nextClarificationTrail = isClarificationStep
      ? [
          ...clarificationTrail,
          {
            question: pendingClarificationQuestion,
            answer: trimmedDraft
          }
        ]
      : startsNewQuestion
        ? []
        : clarificationTrail;

    setState((currentState) => ({
      ...currentState,
      result: startsNewQuestion ? null : currentState.result,
      errorMessage: "",
      isLoading: true
    }));

    try {
      const authToken = await getAuthToken();
      const response = await fetch("/api/ai-task-help", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { "Authorization": `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({
          task,
          question: nextPrimaryQuestion,
          clarificationTrail: nextClarificationTrail,
          recommendationReason,
          uiLanguage
        })
      });

      const data = (await response.json()) as AiTaskHelpApiResponse;

      if (!response.ok || !data.result) {
        setState((currentState) => ({
          ...currentState,
          result: null,
          errorMessage: data.error ?? copy.taskHelp.submitError,
          isLoading: false
        }));
        return;
      }

      const nextResult = data.result;

      setState((currentState) => ({
        ...currentState,
        ...buildHistoryState({
          clarificationTrail: nextClarificationTrail,
          currentThreadId: currentState.currentThreadId,
          history: currentState.history,
          primaryQuestion: nextPrimaryQuestion,
          result: nextResult,
          startsNewQuestion
        }),
        primaryQuestion: nextPrimaryQuestion,
        clarificationTrail: nextClarificationTrail,
        pendingClarificationQuestion:
          nextResult.status === "needs_clarification" ? nextResult.clarificationQuestion : "",
        result: nextResult,
        draft: "",
        errorMessage: "",
        isLoading: false
      }));
    } catch {
      setState((currentState) => ({
        ...currentState,
        result: null,
        errorMessage: copy.taskHelp.submitError,
        isLoading: false
      }));
    }
  }

  function resetFlow() {
    setState(createInitialRecommendedTaskHelpState());
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white/50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
            {copy.taskHelp.title}
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{copy.taskHelp.subtitle}</p>
        </div>
        <button
          className="rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-medium text-[var(--card)] transition hover:bg-[var(--accent-strong)]"
          onClick={() => {
            if (isOpen) {
              resetFlow();
              return;
            }

            setState((currentState) => ({
              ...currentState,
              isOpen: true
            }));
          }}
          type="button"
        >
          {isOpen ? copy.taskHelp.closeHelp : copy.taskHelp.openHelp}
        </button>
      </div>

      {isOpen ? (
        <div className="mt-4 border-t border-[var(--border)] pt-4">
          {history.length > 1 ? (
            <div className="mb-5">
              <HelpHistoryNavigator
                activeIndex={selectedHistoryIndex}
                entries={history}
                onSelectIndex={(nextIndex) =>
                  setState((currentState) => ({
                    ...currentState,
                    activeHistoryIndex: nextIndex
                  }))
                }
                uiLanguage={uiLanguage}
              />
            </div>
          ) : null}

          {displayedPrimaryQuestion ? (
            <div className="mb-4 rounded-2xl bg-[var(--accent-soft)] p-4">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
                {selectedHistoryEntry
                  ? getDisplayedThreadLabel(uiLanguage, isViewingLatestHistory)
                  : copy.taskHelp.mainQuestion}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">
                {displayedPrimaryQuestion}
              </p>
            </div>
          ) : null}

          {displayedClarificationTrail.length > 0 ? (
            <div className="mb-4 rounded-2xl border border-[var(--border)] bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
                {getDisplayedContextLabel(uiLanguage, isViewingLatestHistory, copy.taskHelp.extraContext)}
              </p>
              <div className="mt-3 flex flex-col gap-3">
                {displayedClarificationTrail.map((item, index) => (
                  <div
                    className="rounded-xl bg-[rgba(60,64,68,0.05)] px-4 py-3"
                    key={`${item.question}-${index}`}
                  >
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {formatAiDisplayText(item.question)}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {displayedResult?.status === "needs_clarification" ? (
            <div className="mb-4 rounded-2xl border border-[var(--border)] bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
                {getDisplayedPendingLabel(
                  uiLanguage,
                  isViewingLatestHistory,
                  copy.taskHelp.beforeAnswering
                )}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">
                {formatAiDisplayText(displayedResult.answer)}
              </p>
              <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-sm leading-6 text-[var(--foreground)]">
                {displayedResult.missingContext.map((item, index) => (
                  <li key={`${item}-${index}`}>{formatAiDisplayText(item)}</li>
                ))}
              </ul>
              <p className="mt-4 text-sm font-medium text-[var(--foreground)]">
                {formatAiDisplayText(displayedPendingClarificationQuestion)}
              </p>
            </div>
          ) : null}

          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-[var(--foreground)]">
                {isClarificationStep
                  ? copy.taskHelp.clarificationAnswer
                  : result?.status === "answer"
                    ? copy.taskHelp.anotherQuestion
                    : copy.taskHelp.whatDoYouNeed}
              </span>
              <textarea
                className="min-h-28 rounded-xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                onChange={(event) =>
                  setState((currentState) => ({
                    ...currentState,
                    draft: event.target.value
                  }))
                }
                placeholder={
                  isClarificationStep
                    ? copy.taskHelp.clarificationPlaceholder
                    : result?.status === "answer"
                      ? copy.taskHelp.followUpPlaceholder
                      : copy.taskHelp.initialPlaceholder
                }
                value={draft}
              />
            </label>

            <div className="flex flex-wrap gap-3">
              <button
                className="rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-medium text-[var(--card)] transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isLoading || !draft.trim()}
                onClick={handleSubmit}
                type="button"
              >
                {isLoading
                  ? copy.taskHelp.thinking
                  : isClarificationStep
                    ? copy.common.sendContext
                    : copy.common.askForHelp}
              </button>
              {(result || primaryQuestion || clarificationTrail.length > 0 || draft) && !isLoading ? (
                <button
                  className="rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--accent)]"
                  onClick={resetFlow}
                  type="button"
                >
                  {copy.common.startOver}
                </button>
              ) : null}
            </div>
          </div>

          {errorMessage ? (
            <p className="mt-4 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm leading-6 text-[var(--muted)]">
              {errorMessage}
            </p>
          ) : null}

          {displayedResult?.status === "answer" ? <ResultBlock result={displayedResult} /> : null}
        </div>
      ) : null}
    </div>
  );
}

type ResultBlockProps = {
  result: AiTaskHelpResult;
};

function ResultBlock({ result }: ResultBlockProps) {
  const { copy } = useAppLanguage();

  return (
    <div className="mt-4 flex flex-col gap-4">
      <div className="rounded-2xl bg-[var(--accent-soft)] p-4">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
          {copy.taskHelp.understanding}
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">
          {formatAiDisplayText(result.understanding)}
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-white p-4">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
          {copy.taskHelp.answer}
        </p>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--foreground)]">
          {formatAiDisplayText(result.answer)}
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-white p-4">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
          {copy.taskHelp.actionPlan}
        </p>
        <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-sm leading-6 text-[var(--foreground)]">
          {result.actionPlan.map((step, index) => (
            <li key={`${step}-${index}`}>{formatAiDisplayText(step)}</li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-white p-4">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
          {formatAiDisplayText(result.artifactTitle)}
        </p>
        <pre className="mt-3 whitespace-pre-wrap break-words rounded-xl bg-[rgba(60,64,68,0.05)] px-4 py-3 text-sm leading-6 text-[var(--foreground)]">
          {formatAiDisplayText(result.artifact)}
        </pre>
      </div>
    </div>
  );
}

type HelpHistoryNavigatorProps = {
  activeIndex: number;
  entries: HelpHistoryEntry[];
  onSelectIndex: (index: number) => void;
  uiLanguage: "en" | "es";
};

function HelpHistoryNavigator({
  activeIndex,
  entries,
  onSelectIndex,
  uiLanguage
}: HelpHistoryNavigatorProps) {
  const selectedIndex = activeIndex >= 0 ? activeIndex : entries.length - 1;
  const shouldShowLatestButton = entries.length >= 3;

  if (selectedIndex < 0) {
    return null;
  }

  return (
    <div className="rounded-[1.75rem] border border-[var(--border)] bg-[rgba(255,255,255,0.76)] p-3 sm:p-4">
      <div className="rounded-[1.5rem] border border-[rgba(255,122,36,0.18)] bg-[var(--accent)] px-3 py-3 text-[var(--card)] shadow-[0_16px_40px_rgba(255,122,36,0.24)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <HistoryPagerButton
              direction="prev"
              disabled={selectedIndex <= 0}
              onClick={() => onSelectIndex(Math.max(0, selectedIndex - 1))}
            />
            <span className="min-w-16 text-center text-sm font-semibold tabular-nums text-white/90">
              {selectedIndex + 1} / {entries.length}
            </span>
            <HistoryPagerButton
              direction="next"
              disabled={selectedIndex >= entries.length - 1}
              onClick={() => onSelectIndex(Math.min(entries.length - 1, selectedIndex + 1))}
            />
          </div>

          {shouldShowLatestButton ? (
            <button
              className="rounded-full border border-[rgba(255,255,255,0.7)] bg-[rgba(255,255,255,0.16)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--card)] transition hover:bg-[rgba(255,255,255,0.24)]"
              onClick={() => onSelectIndex(entries.length - 1)}
              type="button"
            >
              {getLatestLabel(uiLanguage)}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function HistoryPagerButton({
  direction,
  disabled,
  onClick
}: {
  direction: "next" | "prev";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(255,255,255,0.68)] bg-[rgba(255,255,255,0.14)] text-lg text-[var(--card)] transition hover:bg-[rgba(255,255,255,0.24)] disabled:cursor-not-allowed disabled:opacity-35"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {direction === "prev" ? "<" : ">"}
    </button>
  );
}

function buildHistoryState({
  clarificationTrail,
  currentThreadId,
  history,
  primaryQuestion,
  result,
  startsNewQuestion
}: {
  clarificationTrail: AiTaskHelpClarification[];
  currentThreadId: string | null;
  history: HelpHistoryEntry[];
  primaryQuestion: string;
  result: AiTaskHelpResult;
  startsNewQuestion: boolean;
}) {
  const threadId =
    startsNewQuestion || !currentThreadId ? createHelpHistoryId() : currentThreadId;
  const nextEntry: HelpHistoryEntry = {
    id: threadId,
    primaryQuestion,
    clarificationTrail,
    result
  };
  const existingIndex = history.findIndex((entry) => entry.id === threadId);
  const nextHistory =
    existingIndex === -1
      ? [...history, nextEntry]
      : history.map((entry, index) => (index === existingIndex ? nextEntry : entry));
  const nextActiveHistoryIndex =
    existingIndex === -1 ? nextHistory.length - 1 : existingIndex;

  return {
    activeHistoryIndex: nextActiveHistoryIndex,
    currentThreadId: threadId,
    history: nextHistory
  };
}

function createHelpHistoryId() {
  return `help-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getDisplayedThreadLabel(language: "en" | "es", isViewingLatestHistory: boolean) {
  if (language === "es") {
    return isViewingLatestHistory ? "Conversacion actual" : "Pedido anterior";
  }

  return isViewingLatestHistory ? "Current thread" : "Previous request";
}

function getDisplayedContextLabel(
  language: "en" | "es",
  isViewingLatestHistory: boolean,
  fallbackLabel: string
) {
  if (isViewingLatestHistory) {
    return fallbackLabel;
  }

  return language === "es" ? "Contexto de ese pedido" : "Context for that request";
}

function getDisplayedPendingLabel(
  language: "en" | "es",
  isViewingLatestHistory: boolean,
  fallbackLabel: string
) {
  if (isViewingLatestHistory) {
    return fallbackLabel;
  }

  return language === "es" ? "Pedido pendiente de aclaracion" : "Request pending clarification";
}

function getLatestLabel(language: "en" | "es") {
  return language === "es" ? "Ultimo" : "Latest";
}

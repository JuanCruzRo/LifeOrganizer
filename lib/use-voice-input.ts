"use client";

import { useCallback, useRef, useState } from "react";
import type { AppLanguage } from "@/lib/i18n";

export type VoiceError = "blocked" | "no-speech" | "too-long" | "failed" | "limit" | null;
export type VoiceState = "idle" | "recording" | "transcribing";

const MAX_SECONDS = 120;

/**
 * Records a clip with MediaRecorder and transcribes it server-side (Groq Whisper).
 * Unlike the browser's own speech API this works in Firefox and Safari too, and
 * it handles long dictation instead of cutting off at the first pause.
 */
export function useVoiceInput(language: AppLanguage) {
  const [state, setState] = useState<VoiceState>("idle");
  const [error, setError] = useState<VoiceError>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const stopTimerRef = useRef<number | null>(null);
  const onTextRef = useRef<(text: string) => void>(() => {});

  const isSupported =
    typeof window !== "undefined" &&
    typeof MediaRecorder !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia;

  const cleanup = useCallback(() => {
    if (stopTimerRef.current !== null) {
      window.clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }
    recorderRef.current?.stream.getTracks().forEach((t) => t.stop());
    recorderRef.current = null;
  }, []);

  const start = useCallback(
    async (onText: (text: string) => void) => {
      if (!isSupported) return;
      onTextRef.current = onText;
      setError(null);

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        setError("blocked");
        return;
      }

      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        cleanup();
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        chunksRef.current = [];
        if (blob.size < 1200) {
          setState("idle");
          setError("no-speech");
          return;
        }

        setState("transcribing");
        try {
          const form = new FormData();
          const ext = blob.type.includes("mp4") ? "mp4" : "webm";
          form.append("audio", blob, `dictado.${ext}`);
          form.append("language", language);

          const res = await fetch("/api/transcribe", { method: "POST", body: form });
          const data = (await res.json()) as { text?: string; error?: string };

          if (res.status === 429) setError("limit");
          else if (res.status === 413) setError("too-long");
          else if (!res.ok) setError("failed");
          else if (!data.text) setError("no-speech");
          else onTextRef.current(data.text);
        } catch {
          setError("failed");
        } finally {
          setState("idle");
        }
      };

      recorderRef.current = recorder;
      recorder.start();
      setState("recording");

      // Safety net so a forgotten recording cannot run forever.
      stopTimerRef.current = window.setTimeout(() => {
        if (recorderRef.current?.state === "recording") recorderRef.current.stop();
      }, MAX_SECONDS * 1000);
    },
    [isSupported, language, cleanup]
  );

  const stop = useCallback(() => {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    else {
      cleanup();
      setState("idle");
    }
  }, [cleanup]);

  return { isSupported, state, error, clearError: () => setError(null), start, stop };
}

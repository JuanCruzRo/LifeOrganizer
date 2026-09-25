"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Timer as TimerIcon } from "lucide-react"

type TimeFormat = "SS.MS" | "MM:SS" | "HH:MM:SS"

interface UseTimerOptions {
  format?: TimeFormat
}

export function useTimer({ format = "MM:SS" }: UseTimerOptions = {}) {
  const [elapsedMs, setElapsedMs] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const startTimeRef = useRef<number | null>(null)
  const frameRef = useRef<number | null>(null)

  const tick = useCallback(() => {
    if (startTimeRef.current !== null) {
      setElapsedMs(performance.now() - startTimeRef.current)
    }
    frameRef.current = requestAnimationFrame(tick)
  }, [])

  const start = useCallback(() => {
    startTimeRef.current = performance.now() - elapsedMs
    setIsRunning(true)
    frameRef.current = requestAnimationFrame(tick)
  }, [elapsedMs, tick])

  const stop = useCallback(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current)
    setIsRunning(false)
  }, [])

  const reset = useCallback(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current)
    startTimeRef.current = null
    setElapsedMs(0)
    setIsRunning(false)
  }, [])

  useEffect(() => {
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [])

  const totalSec = Math.floor(elapsedMs / 1000)
  const ms = Math.floor((elapsedMs % 1000) / 10)
  const seconds = totalSec % 60
  const minutes = Math.floor(totalSec / 60) % 60
  const hours = Math.floor(totalSec / 3600)

  let formattedTime: string
  if (format === "HH:MM:SS") {
    formattedTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  } else if (format === "SS.MS") {
    formattedTime = `${String(totalSec).padStart(2, "0")}.${String(ms).padStart(2, "0")}`
  } else {
    formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  }

  return { isRunning, formattedTime, elapsedMs, start, stop, reset }
}

interface TaskTimerProps {
  className?: string
}

export function TaskTimer({ className }: TaskTimerProps) {
  const { isRunning, formattedTime, elapsedMs, start, stop, reset } = useTimer()

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className ?? ""}`}>
      <button
        className="flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-medium text-[var(--card)] transition hover:bg-[var(--accent-strong)]"
        onClick={isRunning ? stop : start}
        type="button"
      >
        <TimerIcon className="h-4 w-4" />
        {isRunning ? "Pausar" : elapsedMs > 0 ? "Continuar" : "Empezar tarea"}
      </button>

      {elapsedMs > 0 && (
        <>
          <span className="font-mono text-lg tabular-nums text-[var(--foreground)]">
            {formattedTime}
          </span>
          {!isRunning && (
            <button
              className="rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--accent)]"
              onClick={reset}
              type="button"
            >
              Reset
            </button>
          )}
        </>
      )}
    </div>
  )
}

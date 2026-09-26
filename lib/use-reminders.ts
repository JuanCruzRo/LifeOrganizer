"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { reminderCopy } from "@/lib/focus-copy";
import type { AppLanguage } from "@/lib/i18n";
import type { Task } from "@/types/task";

const OPT_IN_KEY = "spark-reminders-on";
const LAST_SENT_KEY = "spark-reminders-last";
const CHECK_EVERY_MS = 60_000;

export type ReminderPermission = "unsupported" | "default" | "granted" | "denied";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function showNotification(title: string, body: string) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  try {
    new Notification(title, { body, icon: "/icon-192.png", badge: "/icon-192.png", tag: "spark" });
  } catch {
    /* some browsers only allow notifications through the service worker */
  }
}

/**
 * Daily nudge about today's and overdue tasks.
 * Note: browsers only run this while a Spark tab (or the installed app) is open.
 * It fires at most once per day per device.
 */
export function useReminders(tasks: Task[], language: AppLanguage, isLoaded: boolean) {
  const [permission, setPermission] = useState<ReminderPermission>("default");
  const [optedIn, setOptedIn] = useState(false);
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  useEffect(() => {
    if (typeof Notification === "undefined") {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission as ReminderPermission);
    try {
      setOptedIn(localStorage.getItem(OPT_IN_KEY) === "1");
    } catch {
      /* storage can be blocked */
    }
  }, []);

  const enable = useCallback(async () => {
    if (typeof Notification === "undefined") return;
    const result = await Notification.requestPermission();
    setPermission(result as ReminderPermission);
    if (result !== "granted") return;
    setOptedIn(true);
    try {
      localStorage.setItem(OPT_IN_KEY, "1");
    } catch {
      /* storage can be blocked */
    }
    const t = reminderCopy[language];
    showNotification(t.enabled, t.title);
  }, [language]);

  const disable = useCallback(() => {
    setOptedIn(false);
    try {
      localStorage.removeItem(OPT_IN_KEY);
    } catch {
      /* storage can be blocked */
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || !optedIn || permission !== "granted") return;

    function check() {
      const today = todayKey();
      try {
        if (localStorage.getItem(LAST_SENT_KEY) === today) return;
      } catch {
        return;
      }
      // Wait until the morning so the nudge does not land in the middle of the night.
      if (new Date().getHours() < 8) return;

      const pending = tasksRef.current.filter((t) => !t.done);
      const dueToday = pending.filter((t) => t.dueDate === today);
      const overdue = pending.filter((t) => t.dueDate < today);
      if (dueToday.length === 0 && overdue.length === 0) return;

      const t = reminderCopy[language];
      const parts = [
        dueToday.length > 0 ? t.dueToday(dueToday.length) : "",
        overdue.length > 0 ? t.overdue(overdue.length) : ""
      ].filter(Boolean);
      const first = dueToday[0] ?? overdue[0];

      showNotification(parts.join(" · "), first.title);
      try {
        localStorage.setItem(LAST_SENT_KEY, today);
      } catch {
        /* storage can be blocked */
      }
    }

    check();
    const id = window.setInterval(check, CHECK_EVERY_MS);
    return () => window.clearInterval(id);
  }, [isLoaded, optedIn, permission, language]);

  return { permission, optedIn, enable, disable };
}

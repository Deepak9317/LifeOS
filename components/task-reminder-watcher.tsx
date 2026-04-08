"use client";

import { useEffect, useMemo } from "react";

import { toast } from "sonner";

import type { Task } from "@/types";

const STORAGE_KEY = "lifeos-task-reminders";

function getReminderDate(task: Task) {
  return task.reminder_at ?? task.due_date;
}

function buildReminderKey(task: Task) {
  return `${task.id}:${getReminderDate(task) ?? "none"}`;
}

function readSeenReminders() {
  if (typeof window === "undefined") {
    return new Set<string>();
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? (JSON.parse(saved) as string[]) : [];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set<string>();
  }
}

function writeSeenReminders(keys: Set<string>) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(keys)));
}

export function TaskReminderWatcher({ tasks }: { tasks: Task[] }) {
  const watchedTasks = useMemo(
    () =>
      tasks.filter((task) => {
        const reminderDate = getReminderDate(task);

        return Boolean(
          !task.completed &&
            task.notify_on_site &&
            reminderDate
        );
      }),
    [tasks]
  );

  useEffect(() => {
    if (watchedTasks.length === 0) {
      return;
    }

    const maybeNotify = () => {
      const seen = readSeenReminders();
      let changed = false;

      watchedTasks.forEach((task) => {
        const reminderDate = getReminderDate(task);

        if (!reminderDate || new Date(reminderDate) > new Date()) {
          return;
        }

        const reminderKey = buildReminderKey(task);

        if (seen.has(reminderKey)) {
          return;
        }

        toast.info(`Task reminder: ${task.title}`);

        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("LifeOS task reminder", {
            body: task.title
          });
        }

        seen.add(reminderKey);
        changed = true;
      });

      if (changed) {
        writeSeenReminders(seen);
      }
    };

    maybeNotify();
    const interval = window.setInterval(maybeNotify, 30_000);

    return () => window.clearInterval(interval);
  }, [watchedTasks]);

  return null;
}

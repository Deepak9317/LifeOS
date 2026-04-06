import { clsx, type ClassValue } from "clsx";
import { format, isToday, isTomorrow, isYesterday, parseISO } from "date-fns";
import { twMerge } from "tailwind-merge";

import { PINNED_TAG, PRIORITY_ORDER } from "@/lib/constants";
import type { Note, Task, TaskPriority } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function safeDate(date?: string | null) {
  if (!date) {
    return null;
  }

  const parsed = parseISO(date);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatTaskDate(date?: string | null) {
  const parsed = safeDate(date);

  if (!parsed) {
    return "No deadline";
  }

  if (isToday(parsed)) {
    return `Today, ${format(parsed, "h:mm a")}`;
  }

  if (isTomorrow(parsed)) {
    return `Tomorrow, ${format(parsed, "h:mm a")}`;
  }

  if (isYesterday(parsed)) {
    return `Yesterday, ${format(parsed, "h:mm a")}`;
  }

  return format(parsed, "MMM d, yyyy 'at' h:mm a");
}

export function toDateTimeLocalValue(date?: string | null) {
  const parsed = safeDate(date);
  if (!parsed) {
    return "";
  }

  const year = parsed.getFullYear();
  const month = `${parsed.getMonth() + 1}`.padStart(2, "0");
  const day = `${parsed.getDate()}`.padStart(2, "0");
  const hours = `${parsed.getHours()}`.padStart(2, "0");
  const minutes = `${parsed.getMinutes()}`.padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function formatFullDate(date: string) {
  const parsed = safeDate(date);
  return parsed ? format(parsed, "MMM d, yyyy") : "Unknown";
}

export function normalizeTags(value: string | string[]) {
  const raw = Array.isArray(value) ? value : value.split(",");

  return Array.from(
    new Set(
      raw
        .map((entry) => entry.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 10)
    )
  );
}

export function isPinnedNote(note: Note) {
  return (note.tags ?? []).includes(PINNED_TAG);
}

export function mergePinnedTag(tags: string[], pinned: boolean) {
  const next = new Set(tags);
  if (pinned) {
    next.add(PINNED_TAG);
  } else {
    next.delete(PINNED_TAG);
  }
  return Array.from(next);
}

export function sortTasks(tasks: Task[]) {
  return [...tasks].sort((left, right) => {
    if (left.completed !== right.completed) {
      return left.completed ? 1 : -1;
    }

    const leftPriority = PRIORITY_ORDER.indexOf(left.priority);
    const rightPriority = PRIORITY_ORDER.indexOf(right.priority);

    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }

    const leftDate = safeDate(left.due_date)?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const rightDate = safeDate(right.due_date)?.getTime() ?? Number.MAX_SAFE_INTEGER;

    if (leftDate !== rightDate) {
      return leftDate - rightDate;
    }

    return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
  });
}

export function sortNotes(notes: Note[]) {
  return [...notes].sort(
    (left, right) =>
      new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
  );
}

export function isTaskDueToday(task: Task) {
  const parsed = safeDate(task.due_date);
  return parsed ? isToday(parsed) : false;
}

export function summarizeTaskState(tasks: Task[]) {
  return {
    total: tasks.length,
    completed: tasks.filter((task) => task.completed).length,
    pending: tasks.filter((task) => !task.completed).length,
    today: tasks.filter((task) => isTaskDueToday(task) && !task.completed).length
  };
}

export function priorityLabel(priority: TaskPriority) {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

export async function readJson<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => null)) as { error?: string } & T | null;

  if (!response.ok) {
    throw new Error(body?.error ?? "Something went wrong.");
  }

  return (body ?? {}) as T;
}

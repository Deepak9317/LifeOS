import type { TaskPriority } from "@/types";

export const PINNED_TAG = "pinned";

export const PRIORITY_ORDER: TaskPriority[] = ["high", "medium", "low"];

export const PRIORITY_STYLES: Record<TaskPriority, string> = {
  low: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20",
  medium: "bg-amber-500/10 text-amber-700 ring-amber-500/20",
  high: "bg-rose-500/10 text-rose-700 ring-rose-500/20"
};

export const WORLD_TIMEZONES = [
  { key: "IST", label: "India", timeZone: "Asia/Kolkata", offset: "UTC+5:30" },
  { key: "EST", label: "New York", timeZone: "America/New_York", offset: "UTC-5/-4" },
  { key: "PST", label: "Los Angeles", timeZone: "America/Los_Angeles", offset: "UTC-8/-7" },
  { key: "GMT", label: "London", timeZone: "Etc/GMT", offset: "UTC+0" }
] as const;

export const DEFAULT_WORLD_CLOCKS = WORLD_TIMEZONES.map((entry) => entry.key);

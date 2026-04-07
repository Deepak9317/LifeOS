import type { TaskPriority } from "@/types";

export const APP_VERSION = "1.0.4";

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
  { key: "MT", label: "Denver", timeZone: "America/Denver", offset: "UTC-7/-6" },
  { key: "GMT", label: "London", timeZone: "Europe/London", offset: "UTC+0/+1" },
  { key: "BER", label: "Berlin", timeZone: "Europe/Berlin", offset: "UTC+1/+2" },
  { key: "SGT", label: "Singapore", timeZone: "Asia/Singapore", offset: "UTC+8" },
  { key: "AEST", label: "Sydney", timeZone: "Australia/Sydney", offset: "UTC+10/+11" }
] as const;

export const DEFAULT_WORLD_CLOCKS = ["IST", "EST", "PST", "GMT"] as const;

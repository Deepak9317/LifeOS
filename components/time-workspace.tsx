"use client";

import { ClockConverter } from "@/components/clock-converter";
import { TaskCalendar } from "@/components/task-calendar";
import { WorldClock } from "@/components/world-clock";
import type { Task } from "@/types";

export function TimeWorkspace({ tasks }: { tasks: Task[] }) {
  return (
    <div className="space-y-6 p-1">
      <section className="animate-fade-up rounded-[2rem] border border-white/90 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(240,249,255,0.92),rgba(236,254,255,0.92))] px-6 py-8 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.18)]">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">Time</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">Calendar and clocks</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Keep scheduling, timezone checks, and task timing tools together in one dedicated section.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.92fr)]">
        <TaskCalendar tasks={tasks} />
        <ClockConverter />
      </div>

      <WorldClock />
    </div>
  );
}

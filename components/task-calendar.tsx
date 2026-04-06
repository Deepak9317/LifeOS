"use client";

import { useState } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, isSameMonth, isToday } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PRIORITY_STYLES } from "@/lib/constants";
import { buildCalendarDays, isTaskDueOnDate, priorityLabel, safeDate } from "@/lib/utils";
import type { Task } from "@/types";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function TaskCalendar({ tasks, compact = false }: { tasks: Task[]; compact?: boolean }) {
  const [month, setMonth] = useState(() => new Date());

  const days = buildCalendarDays(month);

  return (
    <Card className="card-hover animate-fade-up space-y-5 border-violet-100 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(247,245,255,0.96))] [animation-delay:60ms]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-700">Calendar</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">Tasks calendar</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))} size="sm" variant="secondary">
            <ChevronLeft className="size-4" />
          </Button>
          <Button onClick={() => setMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))} size="sm" variant="secondary">
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-slate-950">{format(month, "MMMM yyyy")}</h3>
        <Badge className="bg-violet-500/10 text-violet-700 ring-violet-500/15">
          {tasks.filter((task) => task.due_date && isSameMonth(safeDate(task.due_date) ?? new Date(0), month)).length} due
        </Badge>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {WEEKDAYS.map((day) => (
          <p key={day} className="px-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {day}
          </p>
        ))}
        {days.map((day) => {
          const dayTasks = tasks.filter((task) => isTaskDueOnDate(task, day)).slice(0, compact ? 2 : 3);

          return (
            <div
              key={day.toISOString()}
              className={`min-h-28 rounded-[1.3rem] border p-2.5 transition ${
                isSameMonth(day, month)
                  ? "border-violet-100 bg-white/80"
                  : "border-transparent bg-white/35"
              } ${isToday(day) ? "shadow-[0_0_0_2px_rgba(139,92,246,0.18)]" : ""}`}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span
                  className={`inline-flex size-7 items-center justify-center rounded-full text-sm font-semibold ${
                    isToday(day) ? "bg-violet-600 text-white" : "text-slate-700"
                  }`}
                >
                  {format(day, "d")}
                </span>
                {dayTasks.length > 0 ? (
                  <span className="text-[11px] font-semibold text-slate-500">{dayTasks.length}</span>
                ) : null}
              </div>
              <div className="space-y-1.5">
                {dayTasks.map((task) => (
                  <div key={task.id} className="rounded-xl bg-violet-50/90 px-2 py-1.5">
                    <p className="line-clamp-1 text-xs font-semibold text-slate-900">{task.title}</p>
                    <p className={`mt-1 inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-semibold ring-1 ${PRIORITY_STYLES[task.priority]}`}>
                      {priorityLabel(task.priority)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

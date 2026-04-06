"use client";

import { useEffect, useState } from "react";

import {
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  NotebookPen,
  Sparkles,
  Target
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { BudgetManager } from "@/components/budget-manager";
import { ClockConverter } from "@/components/clock-converter";
import { NoteForm } from "@/components/note-form";
import { ReminderPanel } from "@/components/reminder-panel";
import { SetupNotice } from "@/components/setup-notice";
import { TaskCalendar } from "@/components/task-calendar";
import { TaskForm } from "@/components/task-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { WorldClock } from "@/components/world-clock";
import { PRIORITY_STYLES } from "@/lib/constants";
import {
  formatFullDate,
  formatTaskDate,
  isPinnedNote,
  isTaskDueToday,
  priorityLabel,
  readJson,
  sortNotes,
  sortTasks,
  summarizeTaskState
} from "@/lib/utils";
import type { Note, SetupIssue, Task } from "@/types";

type DashboardViewProps = {
  tasks: Task[];
  notes: Note[];
  setupIssue?: SetupIssue | null;
};

export function DashboardView({
  tasks: initialTasks,
  notes: initialNotes,
  setupIssue = null
}: DashboardViewProps) {
  const [tasks, setTasks] = useState<Task[]>(sortTasks(initialTasks));
  const [notes, setNotes] = useState<Note[]>(sortNotes(initialNotes));
  const [togglingTaskId, setTogglingTaskId] = useState<string | null>(null);

  useEffect(() => {
    setTasks(sortTasks(initialTasks));
  }, [initialTasks]);

  useEffect(() => {
    setNotes(sortNotes(initialNotes));
  }, [initialNotes]);

  const summary = summarizeTaskState(tasks);
  const todaysTasks = tasks.filter((task) => isTaskDueToday(task) && !task.completed).slice(0, 4);
  const upcomingTasks = tasks.filter((task) => !task.completed).slice(0, 6);
  const recentNotes = notes.slice(0, 4);
  const pinnedNote = notes.find(isPinnedNote) ?? notes[0] ?? null;

  const upsertTask = (task: Task) => {
    setTasks((current) => sortTasks([task, ...current.filter((entry) => entry.id !== task.id)]));
  };

  const upsertNote = (note: Note) => {
    setNotes((current) => sortNotes([note, ...current.filter((entry) => entry.id !== note.id)]));
  };

  const toggleTask = async (task: Task) => {
    setTogglingTaskId(task.id);

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          completed: !task.completed
        })
      });

      const data = await readJson<{ task: Task }>(response);
      upsertTask(data.task);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update task.");
    } finally {
      setTogglingTaskId(null);
    }
  };

  return (
    <div className="space-y-6 p-1">
      <section className="animate-fade-up overflow-hidden rounded-[2rem] border border-white/90 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(236,254,255,0.92)_45%,rgba(240,253,244,0.92))] px-6 py-6 shadow-[0_28px_80px_-42px_rgba(15,23,42,0.25)] sm:px-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_420px]">
          <div className="space-y-4">
            <Badge className="bg-slate-950/5 text-slate-700 ring-slate-950/8">
              <Sparkles className="mr-1 size-3.5 text-teal-600" />
              LifeOS dashboard
            </Badge>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Calm control for your day
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Tasks, reminders, clocks, and money snapshots in one compact workspace.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#0f766e,#14b8a6)] px-4 text-sm font-semibold text-white shadow-[0_18px_32px_-18px_rgba(20,184,166,0.75)] transition hover:brightness-105"
                href="/focus"
              >
                Focus mode
                <ArrowRight className="size-4" />
              </Link>
              <Link
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/85 px-4 text-sm font-semibold text-slate-900 transition hover:bg-white"
                href="/tasks"
              >
                Open tasks
              </Link>
            </div>
          </div>

          {setupIssue ? null : (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="animate-soft-pulse rounded-[1.6rem] bg-white/85 p-4 ring-1 ring-cyan-100">
                <p className="text-sm text-slate-500">Today</p>
                <p className="mt-3 text-3xl font-bold text-slate-950">{summary.today}</p>
              </div>
              <div className="animate-soft-pulse rounded-[1.6rem] bg-white/85 p-4 ring-1 ring-emerald-100 [animation-delay:80ms]">
                <p className="text-sm text-slate-500">Completed</p>
                <p className="mt-3 text-3xl font-bold text-slate-950">{summary.completed}</p>
              </div>
              <div className="rounded-[1.6rem] bg-white/85 p-4 ring-1 ring-amber-100">
                <p className="text-sm text-slate-500">Open tasks</p>
                <p className="mt-3 text-3xl font-bold text-slate-950">{summary.pending}</p>
              </div>
              <div className="rounded-[1.6rem] bg-white/85 p-4 ring-1 ring-violet-100">
                <p className="text-sm text-slate-500">Notes</p>
                <p className="mt-3 text-3xl font-bold text-slate-950">{notes.length}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {setupIssue ? <SetupNotice issue={setupIssue} /> : null}

      {setupIssue ? null : (
        <>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
            <Card className="card-hover animate-fade-up space-y-5 border-cyan-100 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(240,249,255,0.94))] [animation-delay:40ms]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
                    Today
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-950">Task runway</h2>
                </div>
                <Link
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                  href="/tasks"
                >
                  Task board
                  <ArrowRight className="size-4" />
                </Link>
              </div>

              {todaysTasks.length === 0 ? (
                <EmptyState
                  actionLabel="Create a task"
                  description="You have a clear runway today. Add a task to start shaping the day."
                  icon={Target}
                  onAction={() => {
                    document.getElementById("task-title")?.focus();
                  }}
                  title="Nothing due today"
                />
              ) : (
                <div className="space-y-3">
                  {todaysTasks.map((task) => (
                    <button
                      key={task.id}
                      className="flex w-full items-start gap-4 rounded-[1.4rem] bg-white/85 px-4 py-4 text-left ring-1 ring-cyan-100 transition hover:-translate-y-0.5 hover:ring-cyan-200"
                      onClick={() => toggleTask(task)}
                      type="button"
                    >
                      <span className="mt-1 inline-flex size-6 items-center justify-center rounded-full border border-cyan-100 bg-cyan-50">
                        {task.completed ? (
                          <CheckCircle2 className="size-4 text-teal-600" />
                        ) : togglingTaskId === task.id ? (
                          <span className="size-2 rounded-full bg-teal-600" />
                        ) : null}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-slate-900">{task.title}</p>
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${PRIORITY_STYLES[task.priority]}`}
                          >
                            {priorityLabel(task.priority)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">{formatTaskDate(task.due_date)}</p>
                        {task.description ? (
                          <p className="mt-2 line-clamp-2 text-sm text-slate-700">{task.description}</p>
                        ) : null}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </Card>

            <ReminderPanel tasks={upcomingTasks} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.95fr)]">
            <TaskCalendar tasks={tasks} />
            <div className="grid gap-6">
              <ClockConverter />
              <BudgetManager />
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(380px,0.95fr)]">
            <WorldClock />
            <Card className="card-hover animate-fade-up space-y-5 border-violet-100 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(248,245,255,0.95))] [animation-delay:180ms]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-700">
                    Notes
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-950">Recent notes</h2>
                </div>
                <Link
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                  href="/notes"
                >
                  Open notes
                  <ArrowRight className="size-4" />
                </Link>
              </div>

              {recentNotes.length === 0 ? (
                <EmptyState
                  description="Capture ideas, meeting notes, and decisions as they happen."
                  icon={NotebookPen}
                  title="No notes yet"
                />
              ) : (
                <div className="space-y-3">
                  {recentNotes.map((note) => (
                    <article key={note.id} className="rounded-[1.4rem] bg-white/85 p-4 ring-1 ring-violet-100">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-base font-semibold text-slate-900">
                            {note.title || "Untitled note"}
                          </h3>
                          <p className="mt-1 text-xs text-slate-500">{formatFullDate(note.created_at)}</p>
                        </div>
                        {isPinnedNote(note) ? (
                          <Badge className="bg-amber-400/15 text-amber-700 ring-amber-400/20">Pinned</Badge>
                        ) : null}
                      </div>
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-700">
                        {note.content || "No content yet."}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(340px,0.9fr)]">
            <TaskForm compact onSaved={(task) => upsertTask(task)} />
            <NoteForm compact onSaved={(note) => upsertNote(note)} />
            <Card className="card-hover animate-fade-up space-y-4 border-amber-100 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(255,250,235,0.95))] [animation-delay:210ms]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">
                    Focus
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-950">Pinned note</h2>
                </div>
                <CircleDollarSign className="size-5 text-amber-500/70" />
              </div>
              {pinnedNote ? (
                <div className="rounded-[1.5rem] bg-white/85 p-5 ring-1 ring-amber-100">
                  <p className="text-sm text-slate-500">{isPinnedNote(pinnedNote) ? "Focus ready" : "Latest note"}</p>
                  <h3 className="mt-2 text-xl font-bold text-slate-950">
                    {pinnedNote.title || "Untitled note"}
                  </h3>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {pinnedNote.content || "Pin a note from Notes to keep the right context close."}
                  </p>
                  <Link
                    className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#0f766e,#14b8a6)] px-4 text-sm font-semibold text-white shadow-[0_18px_32px_-18px_rgba(20,184,166,0.7)] transition hover:brightness-105"
                    href="/focus"
                  >
                    Open focus mode
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              ) : (
                <EmptyState
                  description="Pin a note from the Notes workspace to keep context visible while you work."
                  icon={Target}
                  title="No pinned note yet"
                />
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

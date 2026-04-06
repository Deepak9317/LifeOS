"use client";

import { useEffect, useState } from "react";

import { ArrowRight, CheckCircle2, NotebookPen, Sparkles, Target } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { NoteForm } from "@/components/note-form";
import { TaskForm } from "@/components/task-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import type { Note, Task } from "@/types";

type DashboardViewProps = {
  tasks: Task[];
  notes: Note[];
};

export function DashboardView({ tasks: initialTasks, notes: initialNotes }: DashboardViewProps) {
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
  const todaysTasks = tasks.filter((task) => isTaskDueToday(task) && !task.completed).slice(0, 5);
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
    <div className="space-y-8 p-1">
      <section className="overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-8 text-white shadow-[0_30px_100px_-40px_rgba(15,23,42,0.85)] sm:px-8">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_420px]">
          <div className="space-y-5">
            <Badge className="bg-white/10 text-white ring-white/10">
              <Sparkles className="mr-1 size-3.5" />
              Personal productivity dashboard
            </Badge>
            <div className="space-y-3">
              <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
                Run the day from one calm, high-signal workspace.
              </h1>
              <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
                LifeOS keeps tasks, notes, focus time, and global context in one place so your
                next move is always obvious.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                href="/focus"
              >
                Enter Focus Mode
                <ArrowRight className="size-4" />
              </Link>
              <Link
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
                href="/tasks"
              >
                Review tasks
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border-white/10 bg-white/10 text-white">
              <p className="text-sm text-slate-300">Due today</p>
              <p className="mt-4 text-4xl font-bold">{summary.today}</p>
              <p className="mt-2 text-sm text-slate-300">Tasks that want your attention now.</p>
            </Card>
            <Card className="border-white/10 bg-white/10 text-white">
              <p className="text-sm text-slate-300">Completed</p>
              <p className="mt-4 text-4xl font-bold">{summary.completed}</p>
              <p className="mt-2 text-sm text-slate-300">Closed loops and finished work.</p>
            </Card>
            <Card className="border-white/10 bg-white/10 text-white">
              <p className="text-sm text-slate-300">Open tasks</p>
              <p className="mt-4 text-4xl font-bold">{summary.pending}</p>
              <p className="mt-2 text-sm text-slate-300">What is still in motion.</p>
            </Card>
            <Card className="border-white/10 bg-white/10 text-white">
              <p className="text-sm text-slate-300">Notes saved</p>
              <p className="mt-4 text-4xl font-bold">{notes.length}</p>
              <p className="mt-2 text-sm text-slate-300">Fresh context whenever you need it.</p>
            </Card>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(340px,0.95fr)]">
        <Card className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-600">
                Today&apos;s tasks
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">The work that matters today</h2>
            </div>
            <Link
              className="inline-flex h-9 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
              href="/tasks"
            >
              Open full task board
              <ArrowRight className="size-4" />
            </Link>
          </div>

          {todaysTasks.length === 0 ? (
            <EmptyState
              actionLabel="Create a task"
              description="Nothing is due today yet. Add a task below or browse your full queue."
              icon={Target}
              onAction={() => {
                document.getElementById("task-title")?.focus();
              }}
              title="Your schedule is clear"
            />
          ) : (
            <div className="space-y-3">
              {todaysTasks.map((task) => (
                <button
                  key={task.id}
                  className="flex w-full items-start gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50/80 px-4 py-4 text-left transition hover:border-teal-300 hover:bg-teal-50/50"
                  onClick={() => toggleTask(task)}
                  type="button"
                >
                  <span className="mt-1 inline-flex size-6 items-center justify-center rounded-full border border-slate-300 bg-white">
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
                    <p className="mt-2 text-sm text-slate-500">{formatTaskDate(task.due_date)}</p>
                    {task.description ? (
                      <p className="mt-2 line-clamp-2 text-sm text-slate-600">{task.description}</p>
                    ) : null}
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>

        <WorldClock />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <TaskForm compact onSaved={(task) => upsertTask(task)} />
        <NoteForm compact onSaved={(note) => upsertNote(note)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.9fr)]">
        <Card className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-600">
                Recent notes
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">Context you can revisit fast</h2>
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
              description="The first strong idea deserves a home. Start with a quick note."
              icon={NotebookPen}
              title="No notes yet"
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {recentNotes.map((note) => (
                <article
                  key={note.id}
                  className="rounded-[1.75rem] border border-slate-200 bg-slate-50/80 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {note.title || "Untitled note"}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">{formatFullDate(note.created_at)}</p>
                    </div>
                    {isPinnedNote(note) ? (
                      <Badge className="bg-amber-400/15 text-amber-700 ring-amber-400/20">Pinned</Badge>
                    ) : null}
                  </div>
                  <p className="mt-4 line-clamp-4 text-sm text-slate-600">
                    {note.content || "No content yet."}
                  </p>
                  {(note.tags ?? []).length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(note.tags ?? []).slice(0, 4).map((tag) => (
                        <Badge
                          key={tag}
                          className="bg-slate-950/5 text-slate-700 ring-slate-950/10"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </Card>

        <Card className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-600">
            Focus preview
          </p>
          <h2 className="text-2xl font-bold text-slate-950">One pinned note keeps your intent visible</h2>
          {pinnedNote ? (
            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-6 text-white">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-300">Pinned note</p>
                  <h3 className="mt-1 text-2xl font-bold">{pinnedNote.title || "Untitled note"}</h3>
                </div>
                <Badge className="bg-white/10 text-white ring-white/10">
                  {isPinnedNote(pinnedNote) ? "Focus ready" : "Latest note"}
                </Badge>
              </div>
              <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-slate-200">
                {pinnedNote.content || "Add details inside Notes to make this a richer focus brief."}
              </p>
              <Link
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                href="/focus"
              >
                Open Focus Mode
                <ArrowRight className="size-4" />
              </Link>
            </div>
          ) : (
            <EmptyState
              description="Pin a note from the Notes workspace to keep it visible while you focus."
              icon={Target}
              title="No pinned note yet"
            />
          )}
        </Card>
      </div>
    </div>
  );
}

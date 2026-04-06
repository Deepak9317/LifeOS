"use client";

import { useEffect, useState } from "react";

import { CheckCircle2, Focus, Pin } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PRIORITY_STYLES } from "@/lib/constants";
import {
  formatTaskDate,
  isPinnedNote,
  isTaskDueToday,
  priorityLabel,
  readJson,
  sortNotes,
  sortTasks
} from "@/lib/utils";
import type { Note, Task } from "@/types";

export function FocusMode({
  tasks: initialTasks,
  notes: initialNotes
}: {
  tasks: Task[];
  notes: Note[];
}) {
  const [tasks, setTasks] = useState<Task[]>(sortTasks(initialTasks));
  const [notes, setNotes] = useState<Note[]>(sortNotes(initialNotes));
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  useEffect(() => {
    setTasks(sortTasks(initialTasks));
  }, [initialTasks]);

  useEffect(() => {
    setNotes(sortNotes(initialNotes));
  }, [initialNotes]);

  const todaysTasks = tasks.filter((task) => isTaskDueToday(task));
  const pinnedNote = notes.find(isPinnedNote) ?? notes[0] ?? null;

  const toggleTask = async (task: Task) => {
    setUpdatingTaskId(task.id);

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
      setTasks((current) => sortTasks([data.task, ...current.filter((entry) => entry.id !== task.id)]));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update task.");
    } finally {
      setUpdatingTaskId(null);
    }
  };

  return (
    <div className="space-y-8 p-1">
      <section className="rounded-[2.5rem] bg-slate-950 px-6 py-10 text-white shadow-[0_40px_120px_-60px_rgba(15,23,42,0.8)] sm:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <Badge className="bg-white/10 text-white ring-white/10">
              <Focus className="mr-1 size-3.5" />
              Focus Mode
            </Badge>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Focus</h1>
              <p className="max-w-2xl text-base text-slate-200 sm:text-lg">Today&apos;s tasks and one pinned note.</p>
            </div>
          </div>
          <Link
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-white px-4 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            href="/"
          >
            Back to dashboard
          </Link>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.95fr)]">
        <Card className="space-y-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-600">
                Today&apos;s tasks
              </p>
              <h2 className="mt-2 text-3xl font-bold text-slate-950">Today</h2>
            </div>

          {todaysTasks.length === 0 ? (
            <EmptyState
              description="You have no tasks due today. This is a clean runway."
              icon={Focus}
              title="Nothing to execute right now"
            />
          ) : (
            <div className="space-y-3">
              {todaysTasks.map((task) => (
                <button
                  key={task.id}
                  className="flex w-full items-start gap-4 rounded-[1.75rem] border border-slate-200 bg-slate-50/80 px-5 py-5 text-left transition hover:border-teal-300 hover:bg-teal-50/50"
                  onClick={() => toggleTask(task)}
                  type="button"
                >
                  <span className="mt-1 inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white">
                    {task.completed ? (
                      <CheckCircle2 className="size-4 text-teal-600" />
                    ) : updatingTaskId === task.id ? (
                      <span className="size-2 rounded-full bg-teal-600" />
                    ) : null}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold text-slate-900">{task.title}</p>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${PRIORITY_STYLES[task.priority]}`}
                      >
                        {priorityLabel(task.priority)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{formatTaskDate(task.due_date)}</p>
                    {task.description ? (
                      <p className="mt-3 text-sm leading-6 text-slate-700">{task.description}</p>
                    ) : null}
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-600">
                Pinned note
              </p>
              <h2 className="mt-2 text-3xl font-bold text-slate-950">Pinned note</h2>
            </div>
            <Badge className="bg-amber-400/15 text-amber-700 ring-amber-400/20">
              <Pin className="mr-1 size-3.5" />
              {pinnedNote && isPinnedNote(pinnedNote) ? "Pinned" : "Latest"}
            </Badge>
          </div>

          {pinnedNote ? (
            <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white">
              <h3 className="text-2xl font-bold">{pinnedNote.title || "Untitled note"}</h3>
              <p className="mt-2 text-sm text-slate-300">{new Date(pinnedNote.created_at).toLocaleString()}</p>
              <div className="mt-6 whitespace-pre-wrap text-sm leading-7 text-slate-200">
                {pinnedNote.content || "Add content to this note in the Notes workspace to make Focus Mode even more useful."}
              </div>
              {(pinnedNote.tags ?? []).length > 0 ? (
                <div className="mt-6 flex flex-wrap gap-2">
                  {(pinnedNote.tags ?? []).map((tag) => (
                    <Badge key={tag} className="bg-white/10 text-white ring-white/10">
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <EmptyState
              description="Pin a note from the Notes page so Focus Mode always shows the right context."
              icon={Pin}
              title="No note is pinned yet"
            />
          )}
        </Card>
      </div>
    </div>
  );
}

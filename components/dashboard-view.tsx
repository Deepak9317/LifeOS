"use client";

import { useEffect, useMemo, useState } from "react";

import {
  ArrowRight,
  CheckSquare,
  CircleAlert,
  Clock3,
  Focus,
  NotebookPen,
  PlusCircle,
  Sparkles
} from "lucide-react";
import Link from "next/link";

import { NoteForm } from "@/components/note-form";
import { SetupNotice } from "@/components/setup-notice";
import { TaskForm } from "@/components/task-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { isPinnedNote, safeDate, sortNotes, sortTasks, summarizeTaskState } from "@/lib/utils";
import type { Note, SetupIssue, Task } from "@/types";

type DashboardViewProps = {
  tasks: Task[];
  notes: Note[];
  setupIssue?: SetupIssue | null;
};

type QuickAction = "task" | "note" | "focus" | null;

function estimateFocusMinutes(tasks: Task[]) {
  return tasks.filter((task) => task.completed).length * 25;
}

function formatMinutes(totalMinutes: number) {
  if (totalMinutes >= 60) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  }

  return `${totalMinutes}m`;
}

export function DashboardView({
  tasks: initialTasks,
  notes: initialNotes,
  setupIssue = null
}: DashboardViewProps) {
  const [tasks, setTasks] = useState<Task[]>(sortTasks(initialTasks));
  const [notes, setNotes] = useState<Note[]>(sortNotes(initialNotes));
  const [quickAction, setQuickAction] = useState<QuickAction>(null);

  useEffect(() => {
    setTasks(sortTasks(initialTasks));
  }, [initialTasks]);

  useEffect(() => {
    setNotes(sortNotes(initialNotes));
  }, [initialNotes]);

  const summary = summarizeTaskState(tasks);
  const overdueCount = useMemo(
    () =>
      tasks.filter((task) => {
        const dueDate = safeDate(task.due_date);
        return !task.completed && dueDate ? dueDate.getTime() < Date.now() : false;
      }).length,
    [tasks]
  );
  const focusMinutes = estimateFocusMinutes(tasks);
  const todayName = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date());
  const latestNote = notes[0] ?? null;
  const pinnedNote = notes.find(isPinnedNote) ?? null;

  const featureCards = [
    {
      title: "Tasks",
      summary:
        summary.today > 0
          ? `${summary.today} task${summary.today === 1 ? "" : "s"} due today`
          : "No tasks due today",
      description: overdueCount > 0 ? `${overdueCount} overdue need attention` : "Your task board is under control",
      href: "/tasks",
      cta: "View tasks",
      icon: CheckSquare
    },
    {
      title: "Notes",
      summary: `${notes.length} note${notes.length === 1 ? "" : "s"} captured`,
      description: latestNote?.title || "Open Notes to capture ideas and decisions",
      href: "/notes",
      cta: "Open notes",
      icon: NotebookPen
    },
    {
      title: "Focus",
      summary: pinnedNote ? "Pinned note ready for focus" : "Start a distraction-light session",
      description: pinnedNote?.title || "Use Focus when you want only today’s work and one note",
      href: "/focus",
      cta: "Start focus",
      icon: Focus
    },
    {
      title: "Time",
      summary: "Calendar, clocks, and timezone tools",
      description: "Check schedules, world clocks, and convert across timezones",
      href: "/time",
      cta: "Open time",
      icon: Clock3
    }
  ] as const;

  return (
    <div className="space-y-6 p-1">
      <section className="animate-fade-up rounded-[2rem] border border-white/90 bg-[linear-gradient(135deg,rgba(255,255,255,0.97),rgba(239,248,245,0.94),rgba(240,249,255,0.92))] px-6 py-8 shadow-[0_24px_80px_-42px_rgba(15,23,42,0.22)]">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-950/5 px-3 py-1.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-950/5">
            <Sparkles className="size-4 text-teal-600" />
            LifeOS control center
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">{todayName}</p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Good day. Here is what matters now.
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
              The dashboard is now just a launch point: quick actions, brief stats, and feature shortcuts.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setQuickAction("task")}>
              <PlusCircle className="size-4" />
              Add Task
            </Button>
            <Button onClick={() => setQuickAction("note")} variant="secondary">
              <PlusCircle className="size-4" />
              Add Note
            </Button>
            <Button onClick={() => setQuickAction("focus")} variant="secondary">
              <Focus className="size-4" />
              Start Focus
            </Button>
          </div>
        </div>
      </section>

      {setupIssue ? <SetupNotice issue={setupIssue} /> : null}

      {setupIssue ? null : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="card-hover animate-fade-up rounded-[1.75rem] bg-white/90 [animation-delay:0ms]">
              <p className="text-sm text-slate-500">Tasks today</p>
              <p className="mt-3 text-3xl font-bold text-slate-950">{summary.today}</p>
            </Card>
            <Card className="card-hover animate-fade-up rounded-[1.75rem] bg-white/90 [animation-delay:40ms]">
              <div className="flex items-center gap-2 text-slate-500">
                <CircleAlert className="size-4 text-amber-600" />
                <p className="text-sm">Overdue</p>
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-950">{overdueCount}</p>
            </Card>
            <Card className="card-hover animate-fade-up rounded-[1.75rem] bg-white/90 [animation-delay:80ms]">
              <p className="text-sm text-slate-500">Notes count</p>
              <p className="mt-3 text-3xl font-bold text-slate-950">{notes.length}</p>
            </Card>
            <Card className="card-hover animate-fade-up rounded-[1.75rem] bg-white/90 [animation-delay:120ms]">
              <p className="text-sm text-slate-500">Focus time</p>
              <p className="mt-3 text-3xl font-bold text-slate-950">{formatMinutes(focusMinutes)}</p>
            </Card>
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            {featureCards.map((card, index) => {
              const Icon = card.icon;

              return (
                <Card
                  key={card.title}
                  className={`card-hover animate-fade-up rounded-[1.75rem] border-white/80 bg-white/92 [animation-delay:${index * 40}ms]`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="inline-flex size-11 items-center justify-center rounded-[1rem] bg-slate-950/5 text-slate-700">
                        <Icon className="size-5" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-950">{card.title}</h2>
                        <p className="mt-2 text-sm font-medium text-slate-800">{card.summary}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">{card.description}</p>
                      </div>
                    </div>
                    <Link
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                      href={card.href}
                    >
                      {card.cta}
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </Card>
              );
            })}
          </section>
        </>
      )}

      <Modal
        description="Add a task without leaving the dashboard."
        onClose={() => setQuickAction(null)}
        open={quickAction === "task"}
        title="Quick add task"
      >
        <TaskForm
          compact
          onSaved={(task) => {
            setTasks((current) => sortTasks([task, ...current.filter((entry) => entry.id !== task.id)]));
            setQuickAction(null);
          }}
        />
      </Modal>

      <Modal
        description="Capture a note quickly, then get back to work."
        onClose={() => setQuickAction(null)}
        open={quickAction === "note"}
        title="Quick add note"
      >
        <NoteForm
          compact
          onSaved={(note) => {
            setNotes((current) => sortNotes([note, ...current.filter((entry) => entry.id !== note.id)]));
            setQuickAction(null);
          }}
        />
      </Modal>

      <Modal
        description="Focus Mode is useful when you want a stripped-down view with only today’s tasks and one pinned note."
        onClose={() => setQuickAction(null)}
        open={quickAction === "focus"}
        title="Start focus"
      >
        <div className="space-y-4">
          <p className="text-sm leading-6 text-slate-600">
            It is optional. Think of it as a distraction-light session, not a required part of the product.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#0f766e,#14b8a6)] px-4 text-sm font-semibold text-white shadow-[0_18px_32px_-18px_rgba(20,184,166,0.7)] transition hover:brightness-105"
              href="/focus"
              onClick={() => setQuickAction(null)}
            >
              Open Focus Mode
              <ArrowRight className="size-4" />
            </Link>
            <Button onClick={() => setQuickAction(null)} variant="secondary">
              Maybe later
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

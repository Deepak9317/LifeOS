"use client";

import { useEffect, useMemo, useState } from "react";

import {
  ArrowRight,
  CheckSquare,
  CircleAlert,
  Clock3,
  Focus,
  Lightbulb,
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
import {
  formatFullDate,
  formatTaskDate,
  isPinnedNote,
  safeDate,
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

type QuickAction = "task" | "note" | "focus" | null;

type ActivityItem = {
  id: string;
  label: string;
  detail: string;
  date: string;
  href: string;
};

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

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
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
  const overdueTasks = useMemo(
    () =>
      tasks.filter((task) => {
        const dueDate = safeDate(task.due_date);
        return !task.completed && dueDate ? dueDate.getTime() < Date.now() : false;
      }),
    [tasks]
  );
  const overdueCount = overdueTasks.length;
  const focusMinutes = estimateFocusMinutes(tasks);
  const todayName = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date());
  const latestNote = notes[0] ?? null;
  const pinnedNote = notes.find(isPinnedNote) ?? null;
  const dueTodayTasks = tasks.filter((task) => {
    const dueDate = safeDate(task.due_date);
    if (!dueDate || task.completed) {
      return false;
    }

    const now = new Date();
    return dueDate.toDateString() === now.toDateString();
  });

  const completionRate = clampPercent(summary.total ? (summary.completed / summary.total) * 100 : 0);
  const focusScore = clampPercent((focusMinutes / 180) * 100);
  const notesCoverage = clampPercent(notes.length * 12);
  const urgencyScore = clampPercent(overdueCount * 25 + dueTodayTasks.length * 18);

  const dynamicSummary =
    overdueCount > 0
      ? `${overdueCount} overdue item${overdueCount === 1 ? "" : "s"} need attention before the day gets noisy.`
      : dueTodayTasks.length > 0
        ? `${dueTodayTasks.length} priority item${dueTodayTasks.length === 1 ? "" : "s"} are lined up for today.`
        : "Your dashboard is quiet right now, which is a good moment to plan ahead.";

  const recommendations = [
    overdueCount > 0
      ? {
          title: "Clear the oldest overdue task",
          detail: overdueTasks[0]?.title || "Open Tasks and close one overdue item first.",
          href: "/tasks"
        }
      : null,
    !pinnedNote
      ? {
          title: "Pin one note for context",
          detail: "Make Focus Mode more useful by pinning the note you keep returning to.",
          href: "/notes"
        }
      : null,
    dueTodayTasks.length === 0
      ? {
          title: "Add one meaningful task for today",
          detail: "A light plan works better than an empty day when priorities shift.",
          href: "/tasks"
        }
      : null,
    latestNote
      ? {
          title: "Review your latest note",
          detail: latestNote.title || "There is a recent idea waiting for a follow-up.",
          href: "/notes"
        }
      : null
  ].filter(Boolean).slice(0, 3) as Array<{ title: string; detail: string; href: string }>;

  const featureCards = [
    {
      title: "Tasks",
      summary:
        summary.today > 0
          ? `${summary.today} task${summary.today === 1 ? "" : "s"} due today`
          : "No tasks due today",
      description: overdueCount > 0 ? `${overdueCount} overdue need attention` : "Your task board is under control",
      preview: dueTodayTasks[0]?.title || overdueTasks[0]?.title || "Nothing urgent is waiting right now.",
      href: "/tasks",
      cta: "View tasks",
      icon: CheckSquare
    },
    {
      title: "Notes",
      summary: `${notes.length} note${notes.length === 1 ? "" : "s"} captured`,
      description: latestNote?.title || "Open Notes to capture ideas and decisions",
      preview: latestNote?.content || "Your note workspace is ready for quick capture.",
      href: "/notes",
      cta: "Open notes",
      icon: NotebookPen
    },
    {
      title: "Focus",
      summary: pinnedNote ? "Pinned note ready for focus" : "Start a distraction-light session",
      description: pinnedNote?.title || "Use Focus when you want only today’s work and one note",
      preview:
        pinnedNote?.content ||
        "Focus Mode stays intentionally minimal. It is optional, but helpful when you want a clean sprint view.",
      href: "/focus",
      cta: "Start focus",
      icon: Focus
    },
    {
      title: "Time",
      summary: "Calendar, clocks, and timezone tools",
      description: "Check schedules, world clocks, and convert across timezones",
      preview: "Keep timing decisions in one place without crowding the dashboard.",
      href: "/time",
      cta: "Open time",
      icon: Clock3
    }
  ] as const;

  const recentActivity = useMemo(() => {
    const taskItems: ActivityItem[] = tasks.slice(0, 4).map((task) => ({
      id: `task-${task.id}`,
      label: task.completed ? "Completed task" : "Task updated",
      detail: task.title,
      date: task.created_at,
      href: "/tasks"
    }));

    const noteItems: ActivityItem[] = notes.slice(0, 4).map((note) => ({
      id: `note-${note.id}`,
      label: isPinnedNote(note) ? "Pinned note" : "Saved note",
      detail: note.title || "Untitled note",
      date: note.created_at,
      href: "/notes"
    }));

    return [...taskItems, ...noteItems]
      .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())
      .slice(0, 6);
  }, [notes, tasks]);

  const stats = [
    {
      label: "Tasks today",
      value: summary.today,
      meta: `${completionRate}% complete`,
      percent: completionRate,
      tone: "from-cyan-500 to-sky-500"
    },
    {
      label: "Overdue",
      value: overdueCount,
      meta: overdueCount > 0 ? "Needs attention" : "All clear",
      percent: urgencyScore,
      tone: "from-amber-400 to-rose-400"
    },
    {
      label: "Notes count",
      value: notes.length,
      meta: latestNote ? "Fresh context available" : "Start capturing ideas",
      percent: notesCoverage,
      tone: "from-violet-500 to-fuchsia-500"
    },
    {
      label: "Focus time",
      value: formatMinutes(focusMinutes),
      meta: pinnedNote ? "Pinned note ready" : "Add a pinned note",
      percent: focusScore,
      tone: "from-emerald-500 to-teal-500"
    }
  ] as const;

  return (
    <div className="space-y-6 p-1">
      <section className="animate-fade-up rounded-[2rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.97),rgba(239,248,245,0.94),rgba(240,249,255,0.92))] px-6 py-8 shadow-[0_24px_80px_-42px_rgba(15,23,42,0.22)] dark:border dark:border-gray-800 dark:bg-gray-900 dark:[background-image:none] sm:px-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_360px]">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-950/5 px-3 py-1.5 text-sm font-semibold text-slate-700 dark:bg-gray-950 dark:text-gray-300">
              <Sparkles className="size-4 text-teal-600" />
              LifeOS control center
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700 dark:text-gray-500">{todayName}</p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                Good day. Here is what matters now.
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-slate-600 dark:text-gray-300 sm:text-base">{dynamicSummary}</p>
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

          <Card className="animate-fade-up rounded-[1.75rem] bg-white/78 p-5 shadow-[0_18px_50px_-36px_rgba(15,23,42,0.22)] dark:bg-gray-900 [animation-delay:50ms]">
            <div className="flex items-start gap-3">
              <div className="inline-flex size-10 items-center justify-center rounded-[1rem] bg-amber-400/15 text-amber-700">
                <Lightbulb className="size-5" />
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-gray-500">Recommended</p>
                  <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">Smart suggestions</h2>
                </div>
                <div className="space-y-2">
                  {recommendations.map((item) => (
                    <Link
                      key={item.title}
                      className="block rounded-[1.2rem] bg-white/90 px-4 py-3 transition hover:scale-[1.01] hover:shadow-[0_14px_30px_-22px_rgba(15,23,42,0.28)] dark:bg-gray-950"
                      href={item.href}
                    >
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-gray-300">{item.detail}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {setupIssue ? <SetupNotice issue={setupIssue} /> : null}

      {setupIssue ? null : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat, index) => (
              <Card
                key={stat.label}
                className={`card-hover animate-fade-up rounded-[1.75rem] bg-white/90 p-5 shadow-[0_20px_50px_-38px_rgba(15,23,42,0.18)] dark:bg-gray-900 [animation-delay:${index * 40}ms]`}
              >
                <p className="text-sm text-slate-500 dark:text-gray-500">{stat.label}</p>
                <p className="mt-3 text-3xl font-bold text-slate-950 dark:text-white">{stat.value}</p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-gray-800">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${stat.tone}`}
                    style={{ width: `${stat.percent}%` }}
                  />
                </div>
                <p className="mt-3 text-sm text-slate-600 dark:text-gray-300">{stat.meta}</p>
              </Card>
            ))}
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            {featureCards.map((card, index) => {
              const Icon = card.icon;

              return (
                <Link key={card.title} className="block" href={card.href}>
                  <Card
                    className={`card-hover animate-fade-up rounded-[1.75rem] bg-white/92 p-5 shadow-[0_20px_50px_-38px_rgba(15,23,42,0.2)] dark:bg-gray-900 [animation-delay:${index * 40}ms]`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 space-y-3">
                        <div className="inline-flex size-11 items-center justify-center rounded-[1rem] bg-slate-950/5 text-slate-700 dark:bg-gray-950 dark:text-gray-300">
                          <Icon className="size-5" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-slate-950 dark:text-white">{card.title}</h2>
                          <p className="mt-2 text-sm font-medium text-slate-800 dark:text-gray-300">{card.summary}</p>
                          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-gray-300">{card.description}</p>
                        </div>
                        <div className="rounded-[1.1rem] bg-slate-50/90 px-4 py-3 dark:bg-gray-950">
                          <p className="line-clamp-2 text-sm leading-6 text-slate-600 dark:text-gray-300">{card.preview}</p>
                        </div>
                      </div>
                      <span className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 transition group-hover:bg-slate-50 dark:border-gray-800 dark:bg-gray-950 dark:text-white dark:group-hover:bg-gray-800">
                        {card.cta}
                        <ArrowRight className="size-4" />
                      </span>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </section>

          <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
            <Card className="card-hover animate-fade-up rounded-[1.75rem] bg-white/92 p-5 shadow-[0_20px_50px_-38px_rgba(15,23,42,0.18)] dark:bg-gray-900 [animation-delay:180ms]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-gray-500">Recent activity</p>
                  <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">Latest from your workspace</h2>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {recentActivity.map((item) => (
                  <Link
                    key={item.id}
                    className="flex items-start justify-between gap-4 rounded-[1.2rem] bg-slate-50/80 px-4 py-3 transition hover:scale-[1.01] hover:shadow-[0_16px_32px_-26px_rgba(15,23,42,0.22)] dark:bg-gray-950"
                    href={item.href}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.label}</p>
                      <p className="mt-1 truncate text-sm text-slate-600 dark:text-gray-300">{item.detail}</p>
                    </div>
                    <p className="shrink-0 text-xs font-medium text-slate-500 dark:text-gray-500">{formatFullDate(item.date)}</p>
                  </Link>
                ))}
              </div>
            </Card>

            <Card className="card-hover animate-fade-up rounded-[1.75rem] bg-white/92 p-5 shadow-[0_20px_50px_-38px_rgba(15,23,42,0.18)] dark:bg-gray-900 [animation-delay:220ms]">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-gray-500">Today at a glance</p>
              <div className="mt-4 space-y-4">
                <div className="rounded-[1.2rem] bg-slate-50/90 px-4 py-4 dark:bg-gray-950">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Next task up</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-gray-300">
                    {dueTodayTasks[0]?.title || overdueTasks[0]?.title || "No urgent task is waiting right now."}
                  </p>
                  {dueTodayTasks[0]?.due_date || overdueTasks[0]?.due_date ? (
                    <p className="mt-2 text-xs font-medium text-slate-500 dark:text-gray-500">
                      {formatTaskDate(dueTodayTasks[0]?.due_date || overdueTasks[0]?.due_date)}
                    </p>
                  ) : null}
                </div>
                <div className="rounded-[1.2rem] bg-slate-50/90 px-4 py-4 dark:bg-gray-950">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Focus context</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-gray-300">
                    {pinnedNote?.title || "Pin one note to make Focus Mode more useful."}
                  </p>
                </div>
              </div>
            </Card>
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
        description="Focus Mode stays minimal and optional. Use it when you want only today’s tasks and one pinned note."
        onClose={() => setQuickAction(null)}
        open={quickAction === "focus"}
        title="Start focus"
      >
        <div className="space-y-4">
          <p className="text-sm leading-6 text-slate-600 dark:text-gray-300">
            Think of Focus Mode as a temporary clean room for work. It is helpful when you want less visual noise.
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

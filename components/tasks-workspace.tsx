"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

import { CheckCircle2, ClipboardList, Eye, Plus, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";

import { SetupNotice } from "@/components/setup-notice";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { PRIORITY_STYLES } from "@/lib/constants";
import {
  formatTaskDate,
  isTaskDueToday,
  priorityLabel,
  readJson,
  sortTasks,
  summarizeTaskState
} from "@/lib/utils";
import type { SetupIssue, Task } from "@/types";

type FilterKey = "today" | "pending" | "completed";

const TaskForm = dynamic(
  () => import("@/components/task-form").then((module) => module.TaskForm),
  {
    loading: () => (
      <Card className="space-y-4">
        <div className="h-4 w-28 rounded-full bg-amber-100" />
        <div className="h-10 w-52 rounded-2xl bg-amber-50" />
        <div className="h-32 rounded-[1.5rem] bg-stone-50" />
      </Card>
    )
  }
);

export function TasksWorkspace({
  tasks: initialTasks,
  setupIssue = null
}: {
  tasks: Task[];
  setupIssue?: SetupIssue | null;
}) {
  const [tasks, setTasks] = useState<Task[]>(sortTasks(initialTasks));
  const [activeFilter, setActiveFilter] = useState<FilterKey>("today");
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [editorTaskId, setEditorTaskId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  useEffect(() => {
    setTasks(sortTasks(initialTasks));
  }, [initialTasks]);

  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) => {
        if (activeFilter === "today") {
          return !task.completed && isTaskDueToday(task);
        }

        if (activeFilter === "completed") {
          return task.completed;
        }

        return !task.completed;
      }),
    [activeFilter, tasks]
  );

  const selectedTask = tasks.find((task) => task.id === editorTaskId) ?? null;
  const summary = summarizeTaskState(tasks);
  const filterSummary =
    activeFilter === "today"
      ? "Showing today's pending tasks first."
      : activeFilter === "pending"
        ? "Showing every pending task across your workspace."
        : "Showing completed tasks for quick review.";

  const upsertTask = (task: Task) => {
    setTasks((current) => sortTasks([task, ...current.filter((entry) => entry.id !== task.id)]));
    setEditorTaskId(task.id);
  };

  const removeTask = (taskId: string) => {
    setTasks((current) => current.filter((entry) => entry.id !== taskId));
    setEditorTaskId((current) => (current === taskId ? null : current));
  };

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
      upsertTask(data.task);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update task.");
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const openNewTask = () => {
    setEditorTaskId(null);
    setEditorOpen(true);
  };

  const openTask = (taskId: string) => {
    setEditorTaskId(taskId);
    setEditorOpen(true);
  };

  return (
    <div className="space-y-8 p-1">
      <section className="animate-fade-up rounded-[2rem] border border-amber-100/70 bg-[linear-gradient(135deg,rgba(255,252,247,0.98),rgba(254,243,199,0.42),rgba(204,251,241,0.3))] px-6 py-8 text-stone-950 shadow-[0_24px_70px_-40px_rgba(120,53,15,0.16)]">
        <div className="grid gap-5 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
              Tasks workspace
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight">Tasks</h1>
          </div>
          <Card className="border-amber-100/80 bg-white/78 text-stone-950">
            <p className="text-sm text-stone-500">Today</p>
            <p className="mt-4 text-4xl font-bold">{summary.today}</p>
          </Card>
          <Card className="border-teal-100/80 bg-white/78 text-stone-950">
            <p className="text-sm text-stone-500">Pending</p>
            <p className="mt-4 text-4xl font-bold">{summary.pending}</p>
          </Card>
        </div>
      </section>

      {setupIssue ? <SetupNotice issue={setupIssue} /> : null}

      {setupIssue ? null : (
        <div className="space-y-6">
          <Card className="space-y-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
                  Filters
                </p>
                <h2 className="mt-2 text-2xl font-bold text-stone-950">Filter tasks</h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">{filterSummary}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(["today", "pending", "completed"] as FilterKey[]).map((filter) => (
                  <Button
                    key={filter}
                    className={activeFilter === filter ? "bg-amber-500 text-white hover:bg-amber-400" : ""}
                    onClick={() => setActiveFilter(filter)}
                    size="sm"
                    variant={activeFilter === filter ? "primary" : "secondary"}
                  >
                    <SlidersHorizontal className="size-4" />
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Button>
                ))}
                <Button onClick={openNewTask} size="sm">
                  <Plus className="size-4" />
                  New task
                </Button>
              </div>
            </div>

            {filteredTasks.length === 0 ? (
              <EmptyState
                actionLabel="Create a task"
                description="There are no tasks in this filter right now. Add a new one to keep your board alive."
                icon={ClipboardList}
                onAction={openNewTask}
                title="Nothing here yet"
              />
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task) => (
                  <article
                    key={task.id}
                    className={`rounded-[1.75rem] border px-5 py-4 transition ${
                      editorTaskId === task.id && editorOpen
                        ? "border-amber-200 bg-amber-50/80 shadow-[0_18px_36px_-28px_rgba(217,119,6,0.32)]"
                        : "border-stone-200 bg-white hover:border-amber-200 hover:bg-amber-50/40 hover:shadow-[0_18px_36px_-28px_rgba(120,53,15,0.16)]"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <button
                        className="mt-1 inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-stone-300 bg-white"
                        onClick={() => void toggleTask(task)}
                        type="button"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="size-4 text-amber-600" />
                        ) : updatingTaskId === task.id ? (
                          <span className="size-2 rounded-full bg-amber-600" />
                        ) : null}
                      </button>
                      <button
                        className="min-w-0 flex-1 text-left"
                        onClick={() => openTask(task.id)}
                        type="button"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-stone-900">{task.title}</p>
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${PRIORITY_STYLES[task.priority]}`}
                          >
                            {priorityLabel(task.priority)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-stone-500">{formatTaskDate(task.due_date)}</p>
                        {task.description ? (
                          <p className="mt-2 line-clamp-2 text-sm text-stone-600">{task.description}</p>
                        ) : null}
                      </button>
                      <Button onClick={() => openTask(task.id)} size="sm" variant="secondary">
                        <Eye className="size-4" />
                        Open
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      <Modal
        className="max-w-xl"
        description={
          selectedTask
            ? "Review the task details, then edit or delete it from this popup."
            : "Add a new task without leaving the workspace."
        }
        onClose={() => setEditorOpen(false)}
        open={editorOpen}
        title={selectedTask ? "Task details" : "New task"}
      >
        <TaskForm
          compact
          initialTask={selectedTask}
          onCancel={() => setEditorOpen(false)}
          onDeleted={(taskId) => {
            removeTask(taskId);
            setEditorOpen(false);
          }}
          onSaved={(task) => {
            upsertTask(task);
            setEditorOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}

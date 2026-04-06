"use client";

import { useEffect, useState } from "react";

import { CheckCircle2, ClipboardList, Plus, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";

import { TaskForm } from "@/components/task-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PRIORITY_STYLES } from "@/lib/constants";
import {
  formatTaskDate,
  isTaskDueToday,
  priorityLabel,
  readJson,
  sortTasks,
  summarizeTaskState
} from "@/lib/utils";
import type { Task } from "@/types";

type FilterKey = "today" | "pending" | "completed";

export function TasksWorkspace({ tasks: initialTasks }: { tasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(sortTasks(initialTasks));
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(initialTasks[0]?.id ?? null);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("today");
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  useEffect(() => {
    setTasks(sortTasks(initialTasks));
    setSelectedTaskId(initialTasks[0]?.id ?? null);
  }, [initialTasks]);

  const filteredTasks = tasks.filter((task) => {
    if (activeFilter === "today") {
      return isTaskDueToday(task);
    }

    if (activeFilter === "completed") {
      return task.completed;
    }

    return !task.completed;
  });

  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? null;
  const summary = summarizeTaskState(tasks);

  const upsertTask = (task: Task) => {
    setTasks((current) => sortTasks([task, ...current.filter((entry) => entry.id !== task.id)]));
    setSelectedTaskId(task.id);
  };

  const removeTask = (taskId: string) => {
    setTasks((current) => current.filter((entry) => entry.id !== taskId));
    setSelectedTaskId((current) => (current === taskId ? null : current));
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

  return (
    <div className="space-y-8 p-1">
      <section className="rounded-[2rem] bg-slate-950 px-6 py-8 text-white">
        <div className="grid gap-5 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-300">
              Tasks workspace
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight">
              Move from list overload to next action clarity.
            </h1>
            <p className="mt-3 max-w-2xl text-slate-300">
              Review everything, filter by intent, and update priorities without leaving the page.
            </p>
          </div>
          <Card className="border-white/10 bg-white/10 text-white">
            <p className="text-sm text-slate-300">Today</p>
            <p className="mt-4 text-4xl font-bold">{summary.today}</p>
          </Card>
          <Card className="border-white/10 bg-white/10 text-white">
            <p className="text-sm text-slate-300">Pending</p>
            <p className="mt-4 text-4xl font-bold">{summary.pending}</p>
          </Card>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.9fr)]">
        <div className="space-y-6">
          <Card className="space-y-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-600">
                  Filters
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-950">Shape the board around the moment</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {(["today", "pending", "completed"] as FilterKey[]).map((filter) => (
                  <Button
                    key={filter}
                    className={activeFilter === filter ? "bg-teal-500 text-white hover:bg-teal-400" : ""}
                    onClick={() => setActiveFilter(filter)}
                    size="sm"
                    variant={activeFilter === filter ? "primary" : "secondary"}
                  >
                    <SlidersHorizontal className="size-4" />
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Button>
                ))}
                <Button onClick={() => setSelectedTaskId(null)} size="sm">
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
                onAction={() => setSelectedTaskId(null)}
                title="Nothing here yet"
              />
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task) => (
                  <article
                    key={task.id}
                    className={`rounded-[1.75rem] border px-5 py-4 transition ${
                      selectedTaskId === task.id
                        ? "border-teal-300 bg-teal-50/80"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <button
                        className="mt-1 inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white"
                        onClick={() => void toggleTask(task)}
                        type="button"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="size-4 text-teal-600" />
                        ) : updatingTaskId === task.id ? (
                          <span className="size-2 rounded-full bg-teal-600" />
                        ) : null}
                      </button>
                      <button
                        className="min-w-0 flex-1 text-left"
                        onClick={() => setSelectedTaskId(task.id)}
                        type="button"
                      >
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
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="xl:sticky xl:top-8 xl:self-start">
          <TaskForm
            initialTask={selectedTask}
            onCancel={() => setSelectedTaskId(null)}
            onDeleted={removeTask}
            onSaved={upsertTask}
          />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

import { LoaderCircle, PlusCircle, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PRIORITY_STYLES } from "@/lib/constants";
import { cn, formatTaskDate, priorityLabel, readJson, toDateTimeLocalValue } from "@/lib/utils";
import type { Task, TaskPriority } from "@/types";

type TaskFormProps = {
  initialTask?: Task | null;
  onSaved: (task: Task, mode: "create" | "update") => void;
  onDeleted?: (taskId: string) => void;
  onCancel?: () => void;
  compact?: boolean;
};

export function TaskForm({
  initialTask,
  onSaved,
  onDeleted,
  onCancel,
  compact = false
}: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isEditing = Boolean(initialTask?.id);

  useEffect(() => {
    setTitle(initialTask?.title ?? "");
    setDescription(initialTask?.description ?? "");
    setDueDate(toDateTimeLocalValue(initialTask?.due_date));
    setPriority(initialTask?.priority ?? "medium");
    setCompleted(initialTask?.completed ?? false);
  }, [initialTask]);

  const reset = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
    setPriority("medium");
    setCompleted(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(isEditing ? `/api/tasks/${initialTask?.id}` : "/api/tasks", {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          description: description || null,
          dueDate: dueDate || null,
          priority,
          completed
        })
      });

      const data = await readJson<{ task: Task }>(response);
      onSaved(data.task, isEditing ? "update" : "create");

      if (!isEditing) {
        reset();
      }

      toast.success(isEditing ? "Task updated." : "Task created.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save task.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!initialTask?.id || !window.confirm("Delete this task?")) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/tasks/${initialTask.id}`, {
        method: "DELETE"
      });

      await readJson<{ success: true }>(response);
      onDeleted?.(initialTask.id);
      toast.success("Task deleted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete task.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className={cn("space-y-5", compact ? "h-full" : "")}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-600">
            {isEditing ? "Edit task" : "Quick add task"}
          </p>
          <h3 className="mt-2 text-2xl font-bold text-slate-950">
            {isEditing ? "Keep momentum on the details" : "Capture work the moment it matters"}
          </h3>
          {isEditing && initialTask?.due_date ? (
            <p className="mt-2 text-sm text-slate-500">{formatTaskDate(initialTask.due_date)}</p>
          ) : null}
        </div>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold ring-1",
            PRIORITY_STYLES[priority]
          )}
        >
          {priorityLabel(priority)}
        </span>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="task-title">
            Title
          </label>
          <Input
            id="task-title"
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Prepare investor update"
            required
            value={title}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="task-description">
            Description
          </label>
          <Textarea
            id="task-description"
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Key talking points, links, or context for this task"
            rows={compact ? 4 : 6}
            value={description}
          />
        </div>

        <div className={cn("grid gap-4", compact ? "" : "sm:grid-cols-2")}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="task-priority">
              Priority
            </label>
            <Select
              id="task-priority"
              onChange={(event) => setPriority(event.target.value as TaskPriority)}
              value={priority}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="task-due-date">
              Due date
            </label>
            <Input
              id="task-due-date"
              onChange={(event) => setDueDate(event.target.value)}
              type="datetime-local"
              value={dueDate}
            />
          </div>
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <input
            checked={completed}
            className="size-4 rounded border-slate-300 text-teal-500 focus:ring-teal-500"
            onChange={(event) => setCompleted(event.target.checked)}
            type="checkbox"
          />
          Mark as completed
        </label>

        <div className="flex flex-wrap gap-3">
          <Button className="min-w-36" disabled={submitting} type="submit">
            {submitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
            {isEditing ? (
              <>
                <Save className="size-4" />
                Save changes
              </>
            ) : (
              <>
                <PlusCircle className="size-4" />
                Create task
              </>
            )}
          </Button>

          {isEditing ? (
            <Button disabled={deleting} onClick={handleDelete} variant="danger">
              {deleting ? <LoaderCircle className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              Delete
            </Button>
          ) : null}

          {onCancel ? (
            <Button onClick={onCancel} variant="ghost">
              Reset
            </Button>
          ) : null}
        </div>
      </form>
    </Card>
  );
}

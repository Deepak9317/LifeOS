"use client";

import { useEffect, useState } from "react";

import { BellRing, CheckCircle2, PlusCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatTaskDate, toLocalDateTimeInput } from "@/lib/utils";
import type { Task } from "@/types";

type Reminder = {
  id: string;
  title: string;
  at: string;
  done: boolean;
  notified: boolean;
};

const STORAGE_KEY = "lifeos-reminders";

export function ReminderPanel({ tasks }: { tasks: Task[] }) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [title, setTitle] = useState("");
  const [at, setAt] = useState(() => toLocalDateTimeInput(new Date(Date.now() + 60 * 60 * 1000)));

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return;
    }

    try {
      const parsed = JSON.parse(saved) as Reminder[];
      if (Array.isArray(parsed)) {
        setReminders(parsed);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setReminders((current) =>
        current.map((reminder) => {
          if (reminder.done || reminder.notified || new Date(reminder.at) > new Date()) {
            return reminder;
          }

          toast.info(`Reminder: ${reminder.title}`);

          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("LifeOS reminder", { body: reminder.title });
          }

          return { ...reminder, notified: true };
        })
      );
    }, 30_000);

    return () => window.clearInterval(interval);
  }, []);

  const addReminder = async () => {
    if (!title.trim() || !at) {
      return;
    }

    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission().catch(() => null);
    }

    setReminders((current) => [
      {
        id: crypto.randomUUID(),
        title: title.trim(),
        at: new Date(at).toISOString(),
        done: false,
        notified: false
      },
      ...current
    ]);
    setTitle("");
    setAt(toLocalDateTimeInput(new Date(Date.now() + 60 * 60 * 1000)));
  };

  const upcomingTasks = tasks
    .filter((task) => !task.completed && task.due_date)
    .slice(0, 4);

  return (
    <Card className="card-hover animate-fade-up space-y-5 border-amber-100 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(255,250,235,0.96))] [animation-delay:120ms]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">Reminders</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">Stay ahead</h2>
        </div>
        <div className="inline-flex size-12 items-center justify-center rounded-[1.2rem] bg-amber-500/10 text-amber-700">
          <BellRing className="size-5" />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px_auto]">
        <Input onChange={(event) => setTitle(event.target.value)} placeholder="Follow up with designer" value={title} />
        <Input onChange={(event) => setAt(event.target.value)} type="datetime-local" value={at} />
        <Button className="bg-amber-500 text-slate-950 hover:bg-amber-400" onClick={addReminder}>
          <PlusCircle className="size-4" />
          Add
        </Button>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Personal reminders</p>
        {reminders.length === 0 ? (
          <div className="rounded-[1.25rem] border border-dashed border-amber-200 bg-white/70 p-4 text-sm text-slate-600">
            Add reminders with browser notifications for follow-ups and appointments.
          </div>
        ) : (
          reminders.slice(0, 4).map((reminder) => (
            <button
              key={reminder.id}
              className="flex w-full items-center justify-between gap-4 rounded-[1.25rem] bg-white/80 px-4 py-3 text-left ring-1 ring-amber-100 transition hover:-translate-y-0.5"
              onClick={() =>
                setReminders((current) =>
                  current.map((entry) =>
                    entry.id === reminder.id ? { ...entry, done: !entry.done } : entry
                  )
                )
              }
              type="button"
            >
              <div>
                <p className="font-semibold text-slate-900">{reminder.title}</p>
                <p className="text-xs text-slate-500">{formatTaskDate(reminder.at)}</p>
              </div>
              <CheckCircle2 className={reminder.done ? "size-4 text-emerald-600" : "size-4 text-slate-300"} />
            </button>
          ))
        )}
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Upcoming task alerts</p>
        {upcomingTasks.length === 0 ? (
          <p className="text-sm text-slate-600">No upcoming task deadlines yet.</p>
        ) : (
          upcomingTasks.map((task) => (
            <div key={task.id} className="rounded-[1.25rem] bg-white/75 px-4 py-3 ring-1 ring-slate-100">
              <p className="font-semibold text-slate-900">{task.title}</p>
              <p className="text-xs text-slate-500">{formatTaskDate(task.due_date)}</p>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

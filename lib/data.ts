import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sortNotes, sortTasks } from "@/lib/utils";
import type { Note, Task } from "@/types";

export async function getUserTasks() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("completed", { ascending: true })
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return sortTasks((data ?? []) as Task[]);
}

export async function getUserNotes() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return sortNotes((data ?? []) as Note[]);
}

export async function getWorkspaceSnapshot() {
  const [tasks, notes] = await Promise.all([getUserTasks(), getUserNotes()]);

  return { tasks, notes };
}

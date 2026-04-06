import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseSetupIssue } from "@/lib/supabase/errors";
import { sortNotes, sortTasks } from "@/lib/utils";
import type { Note, SetupIssue, Task } from "@/types";

export async function getUserTasksState(): Promise<{ tasks: Task[]; setupIssue: SetupIssue | null }> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("completed", { ascending: true })
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    const setupIssue = getSupabaseSetupIssue(error.message);

    if (setupIssue) {
      return { tasks: [], setupIssue };
    }

    throw new Error(error.message);
  }

  return {
    tasks: sortTasks((data ?? []) as Task[]),
    setupIssue: null
  };
}

export async function getUserNotesState(): Promise<{ notes: Note[]; setupIssue: SetupIssue | null }> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    const setupIssue = getSupabaseSetupIssue(error.message);

    if (setupIssue) {
      return { notes: [], setupIssue };
    }

    throw new Error(error.message);
  }

  return {
    notes: sortNotes((data ?? []) as Note[]),
    setupIssue: null
  };
}

export async function getWorkspaceSnapshot() {
  const [taskState, noteState] = await Promise.all([getUserTasksState(), getUserNotesState()]);

  return {
    tasks: taskState.tasks,
    notes: noteState.notes,
    setupIssue: taskState.setupIssue ?? noteState.setupIssue
  };
}

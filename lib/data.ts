import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseSetupIssue } from "@/lib/supabase/errors";
import { sortNotes, sortTasks } from "@/lib/utils";
import type { BudgetEntry, BudgetSettings, Note, SetupIssue, Task } from "@/types";

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

export async function getUserBudgetState(): Promise<{
  entries: BudgetEntry[];
  settings: BudgetSettings | null;
  setupIssue: SetupIssue | null;
}> {
  const supabase = await createSupabaseServerClient();
  const [{ data: entries, error: entriesError }, { data: settings, error: settingsError }] = await Promise.all([
    supabase
      .from("budget_entries")
      .select("*")
      .order("entry_date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("budget_settings")
      .select("*")
      .maybeSingle()
  ]);

  const combinedError = entriesError?.message ?? settingsError?.message;
  const setupIssue = getSupabaseSetupIssue(combinedError);

  if (setupIssue) {
    return { entries: [], settings: null, setupIssue };
  }

  if (entriesError) {
    throw new Error(entriesError.message);
  }

  if (settingsError) {
    throw new Error(settingsError.message);
  }

  return {
    entries: (entries ?? []) as BudgetEntry[],
    settings: (settings as BudgetSettings | null) ?? null,
    setupIssue: null
  };
}

import { redirect } from "next/navigation";

import { requireAdminUser } from "@/lib/auth";
import { createSupabaseAdminClient, getSupabaseAdminKey } from "@/lib/supabase/admin";
import type { BudgetEntry, Note, SetupIssue, Task } from "@/types";

export type AdminUserRecord = {
  id: string;
  email: string;
  name: string | null;
  joined: string;
  lastLogin: string | null;
  location: string | null;
  timezone: string | null;
  disabled: boolean;
  taskCount: number;
  noteCount: number;
  budgetCount: number;
};

export type AdminSnapshot = {
  stats: {
    totalUsers: number;
    totalTasks: number;
    totalNotes: number;
    totalBudgetEntries: number;
    activeUsers: number;
  };
  users: AdminUserRecord[];
  tasks: Task[];
  notes: Note[];
  budgetEntries: BudgetEntry[];
  setupIssue: SetupIssue | null;
};

export function getAdminSetupIssue(): SetupIssue | null {
  if (getSupabaseAdminKey()) {
    return null;
  }

  return {
    title: "Configure admin access",
    description: "The admin panel needs a server-only Supabase key to manage users and data.",
    action: "Set SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY in Vercel and .env.local, then reload the admin page."
  };
}

export async function getAdminSnapshot(): Promise<AdminSnapshot> {
  const setupIssue = getAdminSetupIssue();

  if (setupIssue) {
    return {
      stats: {
        totalUsers: 0,
        totalTasks: 0,
        totalNotes: 0,
        totalBudgetEntries: 0,
        activeUsers: 0
      },
      users: [],
      tasks: [],
      notes: [],
      budgetEntries: [],
      setupIssue
    };
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Missing Supabase admin client.");
  }

  const [usersResult, profilesResult, tasksResult, notesResult, budgetResult] = await Promise.all([
    supabase.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    supabase.from("profiles").select("*"),
    supabase.from("tasks").select("*").order("created_at", { ascending: false }),
    supabase.from("notes").select("*").order("created_at", { ascending: false }),
    supabase.from("budget_entries").select("*").order("created_at", { ascending: false })
  ]);

  if (usersResult.error) {
    throw new Error(usersResult.error.message);
  }

  if (profilesResult.error) {
    throw new Error(profilesResult.error.message);
  }

  if (tasksResult.error) {
    throw new Error(tasksResult.error.message);
  }

  if (notesResult.error) {
    throw new Error(notesResult.error.message);
  }

  if (budgetResult.error) {
    throw new Error(budgetResult.error.message);
  }

  const profilesById = new Map((profilesResult.data ?? []).map((profile) => [profile.id, profile]));
  const tasks = (tasksResult.data ?? []) as Task[];
  const notes = (notesResult.data ?? []) as Note[];
  const budgetEntries = (budgetResult.data ?? []) as BudgetEntry[];
  const users = (usersResult.data.users ?? []).map((user) => {
    const profile = profilesById.get(user.id);
    const location = [profile?.country_code, profile?.timezone].filter(Boolean).join(" • ") || null;

    return {
      id: user.id,
      email: user.email ?? "Unknown",
      name:
        profile?.full_name ??
        (typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null) ??
        (typeof user.user_metadata?.name === "string" ? user.user_metadata.name : null),
      joined: user.created_at,
      lastLogin: user.last_sign_in_at ?? null,
      location,
      timezone: profile?.timezone ?? null,
      disabled: Boolean(user.banned_until),
      taskCount: tasks.filter((task) => task.user_id === user.id).length,
      noteCount: notes.filter((note) => note.user_id === user.id).length,
      budgetCount: budgetEntries.filter((entry) => entry.user_id === user.id).length
    };
  });

  const activeUsers = users.filter((user) => {
    if (!user.lastLogin) {
      return false;
    }

    return Date.now() - new Date(user.lastLogin).getTime() < 1000 * 60 * 60 * 24 * 30;
  }).length;

  return {
    stats: {
      totalUsers: users.length,
      totalTasks: tasks.length,
      totalNotes: notes.length,
      totalBudgetEntries: budgetEntries.length,
      activeUsers
    },
    users,
    tasks,
    notes,
    budgetEntries,
    setupIssue: null
  };
}

export async function requireAdminRoute() {
  try {
    return await requireAdminUser();
  } catch {
    redirect("/");
  }
}

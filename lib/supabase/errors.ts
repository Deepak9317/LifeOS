import type { SetupIssue } from "@/types";

const setupErrorMatchers = [
  "could not find the table",
  "schema cache",
  "column tasks.",
  "column notes.",
  "column profiles.",
  "column budget_entries.",
  "column budget_settings.",
  "relation \"public.tasks\" does not exist",
  "relation \"public.notes\" does not exist",
  "relation \"public.budget_entries\" does not exist",
  "relation \"public.budget_settings\" does not exist",
  "type \"public.task_priority\" does not exist",
  "type \"public.budget_entry_type\" does not exist"
];

const setupIssue: SetupIssue = {
  title: "Finish Supabase setup",
  description: "The deployed database is missing the LifeOS app schema.",
  action: "Run the SQL in supabase/setup.sql in Supabase, then refresh the app."
};

export function getSupabaseSetupIssue(message?: string | null) {
  if (!message) {
    return null;
  }

  const normalized = message.toLowerCase();
  const matchesKnownSetupIssue = setupErrorMatchers.some((matcher) => normalized.includes(matcher));

  if (!matchesKnownSetupIssue && !normalized.includes("does not exist")) {
    return null;
  }

  return setupIssue;
}

export function getSupabaseSetupResponseMessage(message?: string | null) {
  const issue = getSupabaseSetupIssue(message);

  if (!issue) {
    return null;
  }

  return `${issue.description} ${issue.action}`;
}

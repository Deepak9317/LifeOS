import { NextResponse } from "next/server";

import { ApiAuthError, requireApiUser } from "@/lib/auth";
import { getSupabaseSetupResponseMessage } from "@/lib/supabase/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { taskSchema } from "@/lib/validation";
import type { TaskInsert } from "@/types";

function mapTaskPayload(input: {
  title: string;
  description?: string | null;
  dueDate?: string | null;
  reminderAt?: string | null;
  priority?: "low" | "medium" | "high";
  completed?: boolean;
  notifyOnSite?: boolean;
  notifyViaEmail?: boolean;
}) {
  const dueDate = input.dueDate ? new Date(input.dueDate).toISOString() : null;
  const reminderAt = input.reminderAt
    ? new Date(input.reminderAt).toISOString()
    : input.notifyOnSite || input.notifyViaEmail
      ? dueDate
      : null;

  const payload: Omit<TaskInsert, "user_id"> = {
    title: input.title,
    description: input.description?.trim() || null,
    due_date: dueDate,
    reminder_at: reminderAt,
    priority: input.priority ?? "medium",
    completed: input.completed ?? false,
    notify_on_site: input.notifyOnSite ?? false,
    notify_via_email: input.notifyViaEmail ?? false,
    email_notified_at: null
  };

  return payload;
}

export async function GET() {
  try {
    await requireApiUser();
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

    return NextResponse.json({ tasks: data ?? [] });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const setupMessage = getSupabaseSetupResponseMessage(error instanceof Error ? error.message : null);

    if (setupMessage) {
      return NextResponse.json({ error: setupMessage }, { status: 503 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to fetch tasks." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const body = (await request.json()) as unknown;
    const parsed = taskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid task payload." },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        user_id: user.id,
        ...mapTaskPayload(parsed.data)
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ task: data }, { status: 201 });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const setupMessage = getSupabaseSetupResponseMessage(error instanceof Error ? error.message : null);

    if (setupMessage) {
      return NextResponse.json({ error: setupMessage }, { status: 503 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create task." },
      { status: 500 }
    );
  }
}

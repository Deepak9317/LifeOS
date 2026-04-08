import { NextResponse } from "next/server";

import { ApiAuthError, requireApiUser } from "@/lib/auth";
import { getSupabaseSetupResponseMessage } from "@/lib/supabase/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { taskUpdateSchema } from "@/lib/validation";
import type { TaskUpdate } from "@/types";

function mapTaskUpdate(input: {
  title?: string;
  description?: string | null;
  dueDate?: string | null;
  reminderAt?: string | null;
  priority?: "low" | "medium" | "high";
  completed?: boolean;
  notifyOnSite?: boolean;
  notifyViaEmail?: boolean;
}) {
  const payload: TaskUpdate = {};

  if (input.title !== undefined) {
    payload.title = input.title;
  }

  if (input.description !== undefined) {
    payload.description = input.description?.trim() || null;
  }

  if (input.dueDate !== undefined) {
    payload.due_date = input.dueDate ? new Date(input.dueDate).toISOString() : null;
  }

  if (input.reminderAt !== undefined) {
    payload.reminder_at = input.reminderAt ? new Date(input.reminderAt).toISOString() : null;
    payload.email_notified_at = null;
  }

  if (input.priority !== undefined) {
    payload.priority = input.priority;
  }

  if (input.completed !== undefined) {
    payload.completed = input.completed;
  }

  if (input.notifyOnSite !== undefined) {
    payload.notify_on_site = input.notifyOnSite;
  }

  if (input.notifyViaEmail !== undefined) {
    payload.notify_via_email = input.notifyViaEmail;
    payload.email_notified_at = null;
  }

  const hasReminderChannel = Boolean(
    (input.notifyOnSite ?? payload.notify_on_site ?? false) ||
      (input.notifyViaEmail ?? payload.notify_via_email ?? false)
  );

  if (payload.reminder_at === undefined && hasReminderChannel && payload.due_date) {
    payload.reminder_at = payload.due_date;
    payload.email_notified_at = null;
  }

  return payload;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const body = (await request.json()) as unknown;
    const parsed = taskUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid task update." },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("tasks")
      .update(mapTaskUpdate(parsed.data))
      .eq("id", id)
      .eq("user_id", user.id)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ task: data });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const setupMessage = getSupabaseSetupResponseMessage(error instanceof Error ? error.message : null);

    if (setupMessage) {
      return NextResponse.json({ error: setupMessage }, { status: 503 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update task." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const setupMessage = getSupabaseSetupResponseMessage(error instanceof Error ? error.message : null);

    if (setupMessage) {
      return NextResponse.json({ error: setupMessage }, { status: 503 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete task." },
      { status: 500 }
    );
  }
}

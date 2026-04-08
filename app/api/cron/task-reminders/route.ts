import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Profile, Task } from "@/types";

function getReminderRecipient(profile: Pick<Profile, "email" | "notification_email"> | null | undefined) {
  return profile?.notification_email || profile?.email || null;
}

function buildEmailHtml(task: Task) {
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;padding:24px;color:#1f2937">
      <p style="font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#0f766e;font-weight:700;margin:0 0 16px">LifeOS reminder</p>
      <h1 style="font-size:24px;line-height:1.2;margin:0 0 12px">Task reminder: ${task.title}</h1>
      <p style="font-size:14px;line-height:1.7;margin:0 0 12px;color:#475569">
        ${task.description ?? "A task reminder from your LifeOS workspace is ready for attention."}
      </p>
      <p style="font-size:14px;line-height:1.7;margin:0;color:#475569">
        Due: ${task.due_date ?? "No due date set"}
      </p>
    </div>
  `;
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();
  const resendApiKey = process.env.RESEND_API_KEY ?? null;
  const reminderFromEmail = process.env.REMINDER_FROM_EMAIL ?? null;

  if (!admin) {
    return NextResponse.json({ error: "Missing Supabase admin client configuration." }, { status: 503 });
  }

  if (!resendApiKey || !reminderFromEmail) {
    return NextResponse.json({ error: "Missing email reminder configuration." }, { status: 503 });
  }

  const nowIso = new Date().toISOString();
  const { data: tasks, error: tasksError } = await admin
    .from("tasks")
    .select("*")
    .eq("completed", false)
    .eq("notify_via_email", true)
    .is("email_notified_at", null)
    .lte("reminder_at", nowIso);

  if (tasksError) {
    return NextResponse.json({ error: tasksError.message }, { status: 500 });
  }

  const dueTasks = (tasks ?? []) as Task[];

  if (dueTasks.length === 0) {
    return NextResponse.json({ success: true, processed: 0 });
  }

  const userIds = Array.from(new Set(dueTasks.map((task) => task.user_id)));
  const { data: profiles, error: profilesError } = await admin
    .from("profiles")
    .select("id,email,notification_email")
    .in("id", userIds);

  if (profilesError) {
    return NextResponse.json({ error: profilesError.message }, { status: 500 });
  }

  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile as Pick<Profile, "id" | "email" | "notification_email">]));
  const sentTaskIds: string[] = [];

  for (const task of dueTasks) {
    const recipient = getReminderRecipient(profileMap.get(task.user_id));

    if (!recipient) {
      continue;
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: reminderFromEmail,
        to: recipient,
        subject: `LifeOS reminder: ${task.title}`,
        html: buildEmailHtml(task)
      })
    });

    if (emailResponse.ok) {
      sentTaskIds.push(task.id);
    }
  }

  if (sentTaskIds.length > 0) {
    const { error: updateError } = await admin
      .from("tasks")
      .update({ email_notified_at: nowIso })
      .in("id", sentTaskIds);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  }

  return NextResponse.json({
    success: true,
    processed: sentTaskIds.length
  });
}

import { NextResponse } from "next/server";

import { ApiAdminAuthError, ApiAuthError, requireAdminApiUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { budgetEntryUpdateSchema, noteUpdateSchema, taskUpdateSchema } from "@/lib/validation";

function resolveKind(kind: string) {
  if (kind === "tasks") {
    return "tasks";
  }

  if (kind === "notes") {
    return "notes";
  }

  if (kind === "budget-entries") {
    return "budget_entries";
  }

  return null;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ kind: string; id: string }> }
) {
  try {
    await requireAdminApiUser();
    const supabase = createSupabaseAdminClient();

    if (!supabase) {
      return NextResponse.json({ error: "Missing admin Supabase key." }, { status: 503 });
    }

    const { kind, id } = await params;
    const table = resolveKind(kind);

    if (!table) {
      return NextResponse.json({ error: "Invalid data type." }, { status: 400 });
    }

    const body = (await request.json()) as unknown;
    let payload: Record<string, unknown>;

    if (table === "tasks") {
      const parsed = taskUpdateSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0]?.message ?? "Invalid task update payload." },
          { status: 400 }
        );
      }

      payload = {
        ...(parsed.data.title !== undefined ? { title: parsed.data.title } : {}),
        ...(parsed.data.description !== undefined ? { description: parsed.data.description?.trim() || null } : {}),
        ...(parsed.data.dueDate !== undefined
          ? { due_date: parsed.data.dueDate ? new Date(parsed.data.dueDate).toISOString() : null }
          : {}),
        ...(parsed.data.priority !== undefined ? { priority: parsed.data.priority } : {}),
        ...(parsed.data.completed !== undefined ? { completed: parsed.data.completed } : {})
      };
    } else if (table === "notes") {
      const parsed = noteUpdateSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0]?.message ?? "Invalid note update payload." },
          { status: 400 }
        );
      }

      payload = {
        ...(parsed.data.title !== undefined ? { title: parsed.data.title?.trim() || null } : {}),
        ...(parsed.data.content !== undefined ? { content: parsed.data.content?.trim() || null } : {}),
        ...(parsed.data.tags !== undefined ? { tags: parsed.data.tags } : {})
      };
    } else {
      const parsed = budgetEntryUpdateSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0]?.message ?? "Invalid budget update payload." },
          { status: 400 }
        );
      }

      payload = {
        ...(parsed.data.title !== undefined ? { title: parsed.data.title.trim() } : {}),
        ...(parsed.data.amount !== undefined ? { amount: parsed.data.amount } : {}),
        ...(parsed.data.type !== undefined ? { type: parsed.data.type } : {}),
        ...(parsed.data.category !== undefined ? { category: parsed.data.category.trim().toLowerCase() } : {}),
        ...(parsed.data.entryDate !== undefined
          ? {
              entry_date: parsed.data.entryDate
                ? new Date(parsed.data.entryDate).toISOString().slice(0, 10)
                : new Date().toISOString().slice(0, 10)
            }
          : {})
      };
    }

    const { data, error } = await supabase.from(table).update(payload).eq("id", id).select("*").single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ record: data });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error instanceof ApiAdminAuthError) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update data." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ kind: string; id: string }> }
) {
  try {
    await requireAdminApiUser();
    const supabase = createSupabaseAdminClient();

    if (!supabase) {
      return NextResponse.json({ error: "Missing admin Supabase key." }, { status: 503 });
    }

    const { kind, id } = await params;
    const table = resolveKind(kind);

    if (!table) {
      return NextResponse.json({ error: "Invalid data type." }, { status: 400 });
    }

    const { error } = await supabase.from(table).delete().eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error instanceof ApiAdminAuthError) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete data." },
      { status: 500 }
    );
  }
}

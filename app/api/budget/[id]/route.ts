import { NextResponse } from "next/server";

import { ApiAuthError, requireApiUser } from "@/lib/auth";
import { getSupabaseSetupResponseMessage } from "@/lib/supabase/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { budgetEntryUpdateSchema } from "@/lib/validation";
import type { BudgetEntryUpdate } from "@/types";

function mapBudgetEntryUpdate(input: {
  title?: string;
  amount?: number;
  type?: "income" | "expense";
  category?: string;
  entryDate?: string | null;
}) {
  const payload: BudgetEntryUpdate = {};

  if (input.title !== undefined) {
    payload.title = input.title.trim();
  }

  if (input.amount !== undefined) {
    payload.amount = input.amount;
  }

  if (input.type !== undefined) {
    payload.type = input.type;
  }

  if (input.category !== undefined) {
    payload.category = input.category.trim().toLowerCase();
  }

  if (input.entryDate !== undefined) {
    payload.entry_date = input.entryDate
      ? new Date(input.entryDate).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10);
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
    const parsed = budgetEntryUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid budget update." },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("budget_entries")
      .update(mapBudgetEntryUpdate(parsed.data))
      .eq("id", id)
      .eq("user_id", user.id)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ entry: data });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const setupMessage = getSupabaseSetupResponseMessage(error instanceof Error ? error.message : null);

    if (setupMessage) {
      return NextResponse.json({ error: setupMessage }, { status: 503 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update budget entry." },
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
      .from("budget_entries")
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
      { error: error instanceof Error ? error.message : "Unable to delete budget entry." },
      { status: 500 }
    );
  }
}

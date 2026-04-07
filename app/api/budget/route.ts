import { NextResponse } from "next/server";

import { ApiAuthError, requireApiUser } from "@/lib/auth";
import { getSupabaseSetupResponseMessage } from "@/lib/supabase/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { budgetEntrySchema } from "@/lib/validation";
import type { BudgetEntryInsert, BudgetSettingsInsert } from "@/types";

function mapBudgetEntryPayload(input: {
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  entryDate?: string | null;
}) {
  const payload: Omit<BudgetEntryInsert, "user_id"> = {
    title: input.title.trim(),
    amount: input.amount,
    type: input.type,
    category: input.category.trim().toLowerCase(),
    entry_date: input.entryDate
      ? new Date(input.entryDate).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10)
  };

  return payload;
}

export async function GET() {
  try {
    const user = await requireApiUser();
    const supabase = await createSupabaseServerClient();
    const [{ data: entries, error: entriesError }, { data: settings, error: settingsError }] = await Promise.all([
      supabase
        .from("budget_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("entry_date", { ascending: false })
        .order("created_at", { ascending: false }),
      supabase
        .from("budget_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle()
    ]);

    if (entriesError) {
      throw new Error(entriesError.message);
    }

    if (settingsError) {
      throw new Error(settingsError.message);
    }

    return NextResponse.json({
      entries: entries ?? [],
      settings: settings ?? null
    });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const setupMessage = getSupabaseSetupResponseMessage(error instanceof Error ? error.message : null);

    if (setupMessage) {
      return NextResponse.json({ error: setupMessage }, { status: 503 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to fetch budget." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const body = (await request.json()) as unknown;
    const parsed = budgetEntrySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid budget entry." },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    const defaultSettings: BudgetSettingsInsert = {
      user_id: user.id,
      currency_code: "INR",
      monthly_budget: 0
    };

    await supabase.from("budget_settings").upsert(defaultSettings, { onConflict: "user_id" });

    const { data, error } = await supabase
      .from("budget_entries")
      .insert({
        user_id: user.id,
        ...mapBudgetEntryPayload(parsed.data)
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ entry: data }, { status: 201 });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const setupMessage = getSupabaseSetupResponseMessage(error instanceof Error ? error.message : null);

    if (setupMessage) {
      return NextResponse.json({ error: setupMessage }, { status: 503 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create budget entry." },
      { status: 500 }
    );
  }
}

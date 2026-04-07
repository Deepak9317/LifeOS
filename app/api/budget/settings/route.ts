import { NextResponse } from "next/server";

import { ApiAuthError, requireApiUser } from "@/lib/auth";
import { getSupabaseSetupResponseMessage } from "@/lib/supabase/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { budgetSettingsSchema } from "@/lib/validation";
import type { BudgetSettingsUpdate } from "@/types";

export async function PATCH(request: Request) {
  try {
    const user = await requireApiUser();
    const body = (await request.json()) as unknown;
    const parsed = budgetSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid budget settings." },
        { status: 400 }
      );
    }

    const payload: BudgetSettingsUpdate = {
      monthly_budget: parsed.data.monthlyBudget,
      currency_code: parsed.data.currencyCode,
      updated_at: new Date().toISOString()
    };

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("budget_settings")
      .upsert(
        {
          user_id: user.id,
          monthly_budget: payload.monthly_budget ?? 0,
          currency_code: payload.currency_code ?? "INR",
          updated_at: payload.updated_at
        },
        { onConflict: "user_id" }
      )
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ settings: data });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const setupMessage = getSupabaseSetupResponseMessage(error instanceof Error ? error.message : null);

    if (setupMessage) {
      return NextResponse.json({ error: setupMessage }, { status: 503 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update budget settings." },
      { status: 500 }
    );
  }
}

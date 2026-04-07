import { NextResponse } from "next/server";

import { ApiAuthError, requireApiUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { profileSchema } from "@/lib/validation";
import type { ProfileUpdate } from "@/types";

export async function GET() {
  try {
    const user = await requireApiUser();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ profile: data });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to fetch profile." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireApiUser();
    const body = (await request.json()) as unknown;
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid profile payload." },
        { status: 400 }
      );
    }

    const payload: ProfileUpdate = {
      full_name: parsed.data.full_name,
      timezone: parsed.data.timezone ?? null,
      country_code: parsed.data.country_code ?? null,
      hidden_clock_pages: parsed.data.hidden_clock_pages ?? [],
      updated_at: new Date().toISOString()
    };

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", user.id)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    await supabase.auth.updateUser({
      data: {
        full_name: parsed.data.full_name
      }
    });

    return NextResponse.json({ profile: data });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update profile." },
      { status: 500 }
    );
  }
}

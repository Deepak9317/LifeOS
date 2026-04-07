import { NextResponse } from "next/server";

import { ApiAuthError, requireApiUser } from "@/lib/auth";
import { getHiddenClockPagesFromMetadata, mergeProfileWithUserMetadata } from "@/lib/profile-preferences";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { profileSchema } from "@/lib/validation";
import type { Profile, ProfileUpdate } from "@/types";

function isMissingHiddenClockPagesError(message?: string | null) {
  const normalized = (message ?? "").toLowerCase();

  return normalized.includes("hidden_clock_pages") && normalized.includes("schema cache");
}

function buildProfileResponse(user: Awaited<ReturnType<typeof requireApiUser>>, profile: Profile | null, payload: ProfileUpdate) {
  return mergeProfileWithUserMetadata(
    profile ?? {
      id: user.id,
      email: user.email ?? "",
      full_name: payload.full_name ?? (typeof user.user_metadata.full_name === "string" ? user.user_metadata.full_name : null),
      timezone: payload.timezone ?? (typeof user.user_metadata.timezone === "string" ? user.user_metadata.timezone : null),
      country_code:
        payload.country_code ?? (typeof user.user_metadata.country_code === "string" ? user.user_metadata.country_code : null),
      avatar_url: typeof user.user_metadata.avatar_url === "string" ? user.user_metadata.avatar_url : null,
      hidden_clock_pages: payload.hidden_clock_pages ?? getHiddenClockPagesFromMetadata(user),
      created_at: user.created_at,
      updated_at: payload.updated_at ?? new Date().toISOString()
    },
    {
      ...user,
      user_metadata: {
        ...user.user_metadata,
        ...(payload.full_name ? { full_name: payload.full_name } : {}),
        ...(payload.timezone ? { timezone: payload.timezone } : {}),
        ...(payload.country_code ? { country_code: payload.country_code } : {}),
        ...(payload.hidden_clock_pages ? { hidden_clock_pages: payload.hidden_clock_pages } : {})
      }
    }
  );
}

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

    return NextResponse.json({ profile: mergeProfileWithUserMetadata(data, user) });
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
    const includesHiddenClockPages =
      typeof body === "object" && body !== null && "hidden_clock_pages" in body;

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
      updated_at: new Date().toISOString()
    };

    if (includesHiddenClockPages) {
      payload.hidden_clock_pages = parsed.data.hidden_clock_pages ?? [];
    }

    const supabase = await createSupabaseServerClient();
    let profileResponse = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", user.id)
      .select("*")
      .maybeSingle();

    if (
      profileResponse.error &&
      includesHiddenClockPages &&
      isMissingHiddenClockPagesError(profileResponse.error.message)
    ) {
      profileResponse = await supabase
        .from("profiles")
        .update({
          full_name: parsed.data.full_name,
          timezone: parsed.data.timezone ?? null,
          country_code: parsed.data.country_code ?? null,
          updated_at: payload.updated_at
        })
        .eq("id", user.id)
        .select("*")
        .maybeSingle();
    }

    if (profileResponse.error) {
      throw new Error(profileResponse.error.message);
    }

    await supabase.auth.updateUser({
      data: {
        full_name: parsed.data.full_name,
        ...(includesHiddenClockPages
          ? { hidden_clock_pages: parsed.data.hidden_clock_pages ?? getHiddenClockPagesFromMetadata(user) }
          : {})
      }
    });

    return NextResponse.json({
      profile: buildProfileResponse(user, profileResponse.data, payload)
    });
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

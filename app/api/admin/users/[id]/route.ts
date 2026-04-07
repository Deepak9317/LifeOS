import { NextResponse } from "next/server";

import { ApiAdminAuthError, ApiAuthError, requireAdminApiUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminApiUser();
    const supabase = createSupabaseAdminClient();

    if (!supabase) {
      return NextResponse.json({ error: "Missing admin Supabase key." }, { status: 503 });
    }

    const { id } = await params;
    const body = (await request.json()) as { action?: "disable" | "enable" };

    if (!body.action) {
      return NextResponse.json({ error: "Action is required." }, { status: 400 });
    }

    const { data, error } = await supabase.auth.admin.updateUserById(id, {
      ban_duration: body.action === "disable" ? "876000h" : "none"
    });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ user: data.user });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error instanceof ApiAdminAuthError) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update user." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminApiUser();
    const supabase = createSupabaseAdminClient();

    if (!supabase) {
      return NextResponse.json({ error: "Missing admin Supabase key." }, { status: 503 });
    }

    const { id } = await params;
    const { error } = await supabase.auth.admin.deleteUser(id, true);

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
      { error: error instanceof Error ? error.message : "Unable to delete user." },
      { status: 500 }
    );
  }
}

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export class ApiAuthError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "ApiAuthError";
  }
}

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireApiUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new ApiAuthError();
  }

  return user;
}

export async function reauthenticateUser(email: string, password: string) {
  const supabase = await createSupabaseServerClient();

  return supabase.auth.signInWithPassword({
    email,
    password
  });
}

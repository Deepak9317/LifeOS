import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export const ADMIN_EMAIL = "raj.deepak1993@gmail.com";

export class ApiAuthError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "ApiAuthError";
  }
}

export class ApiAdminAuthError extends Error {
  constructor() {
    super("Forbidden");
    this.name = "ApiAdminAuthError";
  }
}

export function isAdminEmail(email?: string | null) {
  return (email ?? "").toLowerCase() === ADMIN_EMAIL;
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

export async function requireAdminUser() {
  const user = await requireUser();

  if (!isAdminEmail(user.email)) {
    redirect("/");
  }

  return user;
}

export async function requireAdminApiUser() {
  const user = await requireApiUser();

  if (!isAdminEmail(user.email)) {
    throw new ApiAdminAuthError();
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

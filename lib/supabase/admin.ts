import { createClient } from "@supabase/supabase-js";

import { getSupabaseConfig } from "@/lib/supabase/config";
import type { Database } from "@/types";

export function getSupabaseAdminKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY ?? null;
}

export function createSupabaseAdminClient() {
  const serviceRoleKey = getSupabaseAdminKey();

  if (!serviceRoleKey) {
    return null;
  }

  const { url } = getSupabaseConfig();

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

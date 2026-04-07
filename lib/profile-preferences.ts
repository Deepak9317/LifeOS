import type { User } from "@supabase/supabase-js";

import type { Profile } from "@/types";

export function getHiddenClockPagesFromMetadata(user: User | null | undefined) {
  const value = user?.user_metadata?.hidden_clock_pages;

  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0);
}

export function mergeProfileWithUserMetadata(profile: Profile | null, user: User | null | undefined) {
  if (!profile) {
    return profile;
  }

  return {
    ...profile,
    hidden_clock_pages:
      Array.isArray(profile.hidden_clock_pages) && profile.hidden_clock_pages.length > 0
        ? profile.hidden_clock_pages
        : getHiddenClockPagesFromMetadata(user)
  };
}

import { AppShell } from "@/components/app-shell";
import { isAdminEmail, requireUser } from "@/lib/auth";
import { getCurrentProfile } from "@/lib/profile";
import { getHiddenClockPagesFromMetadata, mergeProfileWithUserMetadata } from "@/lib/profile-preferences";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const rawProfile = await getCurrentProfile(user.id);
  const profile = mergeProfileWithUserMetadata(rawProfile, user);
  const hiddenClockPages = profile?.hidden_clock_pages ?? getHiddenClockPagesFromMetadata(user);

  return (
    <AppShell
      clockReference={new Date().toISOString()}
      hiddenClockPages={hiddenClockPages}
      isAdmin={isAdminEmail(user.email)}
      profileName={profile?.full_name ?? null}
      userEmail={user.email ?? "Authenticated user"}
    >
      {children}
    </AppShell>
  );
}

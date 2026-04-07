import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";
import { getCurrentProfile } from "@/lib/profile";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const profile = await getCurrentProfile(user.id);

  return (
    <AppShell
      profileName={profile?.full_name ?? null}
      userEmail={user.email ?? "Authenticated user"}
    >
      {children}
    </AppShell>
  );
}

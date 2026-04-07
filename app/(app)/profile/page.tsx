import { ProfileWorkspace } from "@/components/profile-workspace";
import { requireUser } from "@/lib/auth";
import { getCurrentProfile } from "@/lib/profile";

export default async function ProfilePage() {
  const user = await requireUser();
  const profile = await getCurrentProfile(user.id);

  return <ProfileWorkspace profile={profile} user={user} />;
}

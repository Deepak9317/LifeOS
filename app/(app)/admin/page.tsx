import { AdminWorkspace } from "@/components/admin-workspace";
import { getAdminSnapshot } from "@/lib/admin";
import { requireAdminUser } from "@/lib/auth";

export default async function AdminPage() {
  await requireAdminUser();
  const snapshot = await getAdminSnapshot();

  return <AdminWorkspace snapshot={snapshot} />;
}

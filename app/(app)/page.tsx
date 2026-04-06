import { DashboardView } from "@/components/dashboard-view";
import { getWorkspaceSnapshot } from "@/lib/data";

export default async function DashboardPage() {
  const { tasks, notes } = await getWorkspaceSnapshot();

  return <DashboardView notes={notes} tasks={tasks} />;
}

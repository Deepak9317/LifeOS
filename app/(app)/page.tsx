import { DashboardView } from "@/components/dashboard-view";
import { getWorkspaceSnapshot } from "@/lib/data";

export default async function DashboardPage() {
  const { tasks, notes, setupIssue } = await getWorkspaceSnapshot();

  return (
    <DashboardView
      notes={notes}
      serverNow={new Date().toISOString()}
      setupIssue={setupIssue}
      tasks={tasks}
    />
  );
}

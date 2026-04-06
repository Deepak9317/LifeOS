import { FocusMode } from "@/components/focus-mode";
import { getWorkspaceSnapshot } from "@/lib/data";

export default async function FocusPage() {
  const { tasks, notes, setupIssue } = await getWorkspaceSnapshot();

  return <FocusMode notes={notes} setupIssue={setupIssue} tasks={tasks} />;
}

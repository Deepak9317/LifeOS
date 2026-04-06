import { FocusMode } from "@/components/focus-mode";
import { getWorkspaceSnapshot } from "@/lib/data";

export default async function FocusPage() {
  const { tasks, notes } = await getWorkspaceSnapshot();

  return <FocusMode notes={notes} tasks={tasks} />;
}

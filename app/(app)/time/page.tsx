import { TimeWorkspace } from "@/components/time-workspace";
import { getUserTasksState } from "@/lib/data";

export default async function TimePage() {
  const { tasks } = await getUserTasksState();

  return <TimeWorkspace tasks={tasks} />;
}

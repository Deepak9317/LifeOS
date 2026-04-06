import { TasksWorkspace } from "@/components/tasks-workspace";
import { getUserTasksState } from "@/lib/data";

export default async function TasksPage() {
  const { tasks, setupIssue } = await getUserTasksState();

  return <TasksWorkspace setupIssue={setupIssue} tasks={tasks} />;
}

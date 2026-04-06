import { TasksWorkspace } from "@/components/tasks-workspace";
import { getUserTasks } from "@/lib/data";

export default async function TasksPage() {
  const tasks = await getUserTasks();

  return <TasksWorkspace tasks={tasks} />;
}

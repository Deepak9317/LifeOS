import { BudgetWorkspace } from "@/components/budget-workspace";
import { getUserBudgetState } from "@/lib/data";

export default async function BudgetPage() {
  const { entries, settings, setupIssue } = await getUserBudgetState();

  return <BudgetWorkspace entries={entries} settings={settings} setupIssue={setupIssue} />;
}

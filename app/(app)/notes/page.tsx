import { NotesWorkspace } from "@/components/notes-workspace";
import { getUserNotesState } from "@/lib/data";

export default async function NotesPage() {
  const { notes, setupIssue } = await getUserNotesState();

  return <NotesWorkspace notes={notes} setupIssue={setupIssue} />;
}

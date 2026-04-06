import { NotesWorkspace } from "@/components/notes-workspace";
import { getUserNotes } from "@/lib/data";

export default async function NotesPage() {
  const notes = await getUserNotes();

  return <NotesWorkspace notes={notes} />;
}

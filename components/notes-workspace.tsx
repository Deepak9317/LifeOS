"use client";

import dynamic from "next/dynamic";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

import { NotebookPen, Pin, Search, SquarePen } from "lucide-react";

import { SetupNotice } from "@/components/setup-notice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { formatFullDate, isPinnedNote, sortNotes } from "@/lib/utils";
import type { Note, SetupIssue } from "@/types";

const NoteForm = dynamic(
  () => import("@/components/note-form").then((module) => module.NoteForm),
  {
    loading: () => (
      <Card className="space-y-4">
        <div className="h-4 w-28 rounded-full bg-amber-100" />
        <div className="h-10 w-52 rounded-2xl bg-amber-50" />
        <div className="h-32 rounded-[1.5rem] bg-stone-50" />
      </Card>
    )
  }
);

export function NotesWorkspace({
  notes: initialNotes,
  setupIssue = null
}: {
  notes: Note[];
  setupIssue?: SetupIssue | null;
}) {
  const [notes, setNotes] = useState<Note[]>(sortNotes(initialNotes));
  const [query, setQuery] = useState("");
  const [editorNoteId, setEditorNoteId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    setNotes(sortNotes(initialNotes));
  }, [initialNotes]);

  const selectedNote = notes.find((note) => note.id === editorNoteId) ?? null;

  const filteredNotes = useMemo(() => {
    const search = deferredQuery.trim().toLowerCase();

    if (!search) {
      return notes;
    }

    return notes.filter((note) =>
      [note.title, note.content, ...(note.tags ?? [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }, [deferredQuery, notes]);

  const upsertNote = (note: Note) => {
    setNotes((current) => sortNotes([note, ...current.filter((entry) => entry.id !== note.id)]));
    setEditorNoteId(note.id);
  };

  const removeNote = (noteId: string) => {
    setNotes((current) => current.filter((entry) => entry.id !== noteId));
    setEditorNoteId((current) => (current === noteId ? null : current));
  };

  const openNewNote = () => {
    setEditorNoteId(null);
    setEditorOpen(true);
  };

  const openNote = (noteId: string) => {
    setEditorNoteId(noteId);
    setEditorOpen(true);
  };

  return (
    <div className="space-y-8 p-1">
      <section className="rounded-[2rem] bg-[linear-gradient(135deg,#2c2218,#3f2d1d,#0f766e)] px-6 py-8 text-white">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_360px]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-200">Notes workspace</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight">Notes</h1>
          </div>
          <Card className="border-white/10 bg-white/10 text-white">
            <p className="text-sm text-stone-300">Total notes</p>
            <p className="mt-4 text-4xl font-bold">{notes.length}</p>
            <p className="mt-2 text-sm text-stone-300">Pinned notes rise to the top in Focus Mode.</p>
          </Card>
        </div>
      </section>

      {setupIssue ? <SetupNotice issue={setupIssue} /> : null}

      {setupIssue ? null : (
        <Card className="space-y-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Search and browse</p>
              <h2 className="mt-2 text-2xl font-bold text-stone-950">Find notes fast</h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Browse recent notes, search across content, and open any note in a compact editor.
              </p>
            </div>
            <Button onClick={openNewNote} size="sm">
              <SquarePen className="size-4" />
              New note
            </Button>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
            <Input
              className="pl-11"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search titles, content, or tags"
              value={query}
            />
          </div>

          {filteredNotes.length === 0 ? (
            <EmptyState
              actionLabel={query ? "Clear search" : "Create note"}
              description="No notes match the current view. Clear the search or add a new note."
              icon={NotebookPen}
              onAction={() => {
                if (query) {
                  setQuery("");
                  return;
                }

                openNewNote();
              }}
              title="Nothing matched"
            />
          ) : (
            <div className="space-y-3">
              {filteredNotes.map((note) => (
                <button
                  key={note.id}
                  className={`w-full rounded-[1.75rem] border px-5 py-4 text-left transition ${
                    editorNoteId === note.id && editorOpen
                      ? "border-amber-200 bg-amber-50/80 shadow-[0_18px_36px_-28px_rgba(217,119,6,0.32)]"
                      : "border-stone-200 bg-white hover:border-amber-200 hover:bg-amber-50/40 hover:shadow-[0_18px_36px_-28px_rgba(120,53,15,0.16)]"
                  }`}
                  onClick={() => openNote(note.id)}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-stone-900">{note.title || "Untitled note"}</p>
                        {isPinnedNote(note) ? (
                          <Badge className="bg-amber-400/15 text-amber-700 ring-amber-400/20">
                            <Pin className="mr-1 size-3.5" />
                            Pinned
                          </Badge>
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm text-stone-500">{formatFullDate(note.created_at)}</p>
                      <p className="mt-3 line-clamp-3 text-sm text-stone-600">
                        {note.content || "No content yet."}
                      </p>
                      {(note.tags ?? []).length > 0 ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {(note.tags ?? []).map((tag) => (
                            <Badge key={tag} className="bg-amber-50 text-stone-700 ring-amber-100">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <span className="rounded-2xl bg-white px-3 py-2 text-sm font-semibold text-stone-700 ring-1 ring-amber-100">
                      Open
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      )}

      <Modal
        className="max-w-xl"
        description={
          selectedNote
            ? "Review and update the note from this compact editor."
            : "Add a new note without leaving the workspace."
        }
        onClose={() => setEditorOpen(false)}
        open={editorOpen}
        title={selectedNote ? "Note details" : "New note"}
      >
        <NoteForm
          compact
          initialNote={selectedNote}
          onCancel={() => setEditorOpen(false)}
          onDeleted={(noteId) => {
            removeNote(noteId);
            setEditorOpen(false);
          }}
          onSaved={(note) => {
            upsertNote(note);
            setEditorOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}

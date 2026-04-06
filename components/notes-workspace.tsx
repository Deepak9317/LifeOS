"use client";

import { useDeferredValue, useEffect, useState } from "react";

import { NotebookPen, Pin, Search, SquarePen } from "lucide-react";

import { NoteForm } from "@/components/note-form";
import { SetupNotice } from "@/components/setup-notice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { formatFullDate, isPinnedNote, sortNotes } from "@/lib/utils";
import type { Note, SetupIssue } from "@/types";

export function NotesWorkspace({
  notes: initialNotes,
  setupIssue = null
}: {
  notes: Note[];
  setupIssue?: SetupIssue | null;
}) {
  const [notes, setNotes] = useState<Note[]>(sortNotes(initialNotes));
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(initialNotes[0]?.id ?? null);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    setNotes(sortNotes(initialNotes));
    setSelectedNoteId(initialNotes[0]?.id ?? null);
  }, [initialNotes]);

  const selectedNote = notes.find((note) => note.id === selectedNoteId) ?? null;

  const filteredNotes = notes.filter((note) => {
    const search = deferredQuery.trim().toLowerCase();

    if (!search) {
      return true;
    }

    return [note.title, note.content, ...(note.tags ?? [])]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(search);
  });

  const upsertNote = (note: Note) => {
    setNotes((current) => sortNotes([note, ...current.filter((entry) => entry.id !== note.id)]));
    setSelectedNoteId(note.id);
  };

  const removeNote = (noteId: string) => {
    setNotes((current) => current.filter((entry) => entry.id !== noteId));
    setSelectedNoteId((current) => (current === noteId ? null : current));
  };

  return (
    <div className="space-y-8 p-1">
      <section className="rounded-[2rem] bg-slate-950 px-6 py-8 text-white">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_360px]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-300">
              Notes workspace
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight">Notes</h1>
          </div>
          <Card className="border-white/10 bg-white/10 text-white">
            <p className="text-sm text-slate-200">Total notes</p>
            <p className="mt-4 text-4xl font-bold">{notes.length}</p>
            <p className="mt-2 text-sm text-slate-200">Pinned notes surface first inside Focus Mode.</p>
          </Card>
        </div>
      </section>

      {setupIssue ? <SetupNotice issue={setupIssue} /> : null}

      {setupIssue ? null : (
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.95fr)]">
        <div className="space-y-6">
          <Card className="space-y-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-600">
                  Search and browse
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-950">Find notes fast</h2>
              </div>
              <Button onClick={() => setSelectedNoteId(null)} size="sm">
                <SquarePen className="size-4" />
                New note
              </Button>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-11"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search titles, content, or tags"
                value={query}
              />
            </div>

            {filteredNotes.length === 0 ? (
              <EmptyState
                actionLabel="Clear search"
                description="No notes match your current query. Try a broader term or create something new."
                icon={NotebookPen}
                onAction={() => setQuery("")}
                title="Nothing matched"
              />
            ) : (
              <div className="space-y-3">
                {filteredNotes.map((note) => (
                  <button
                    key={note.id}
                    className={`w-full rounded-[1.75rem] border px-5 py-4 text-left transition ${
                      selectedNoteId === note.id
                        ? "border-teal-300 bg-teal-50/80"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                    onClick={() => setSelectedNoteId(note.id)}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-slate-900">{note.title || "Untitled note"}</p>
                          {isPinnedNote(note) ? (
                            <Badge className="bg-amber-400/15 text-amber-700 ring-amber-400/20">
                              <Pin className="mr-1 size-3.5" />
                              Pinned
                            </Badge>
                          ) : null}
                        </div>
                        <p className="mt-2 text-sm text-slate-600">{formatFullDate(note.created_at)}</p>
                        <p className="mt-3 line-clamp-3 text-sm text-slate-700">
                          {note.content || "No content yet."}
                        </p>
                        {(note.tags ?? []).length > 0 ? (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {(note.tags ?? []).map((tag) => (
                              <Badge
                                key={tag}
                                className="bg-slate-950/5 text-slate-700 ring-slate-950/10"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="xl:sticky xl:top-8 xl:self-start">
          <NoteForm
            initialNote={selectedNote}
            onCancel={() => setSelectedNoteId(null)}
            onDeleted={removeNote}
            onSaved={upsertNote}
          />
        </div>
      </div>
      )}
    </div>
  );
}

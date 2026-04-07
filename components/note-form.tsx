"use client";

import { useEffect, useState } from "react";

import { LoaderCircle, Pin, PlusCircle, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { isPinnedNote, mergePinnedTag, normalizeTags, readJson } from "@/lib/utils";
import type { Note } from "@/types";

type NoteFormProps = {
  initialNote?: Note | null;
  onSaved: (note: Note, mode: "create" | "update") => void;
  onDeleted?: (noteId: string) => void;
  onCancel?: () => void;
  compact?: boolean;
};

export function NoteForm({
  initialNote,
  onSaved,
  onDeleted,
  onCancel,
  compact = false
}: NoteFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [pinned, setPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isEditing = Boolean(initialNote?.id);

  useEffect(() => {
    setTitle(initialNote?.title ?? "");
    setContent(initialNote?.content ?? "");
    setTagsInput((initialNote?.tags ?? []).filter((tag) => tag !== "pinned").join(", "));
    setPinned(initialNote ? isPinnedNote(initialNote) : false);
  }, [initialNote]);

  const reset = () => {
    setTitle("");
    setContent("");
    setTagsInput("");
    setPinned(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const normalizedTags = mergePinnedTag(normalizeTags(tagsInput), pinned);
      const response = await fetch(isEditing ? `/api/notes/${initialNote?.id}` : "/api/notes", {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: title || null,
          content: content || null,
          tags: normalizedTags
        })
      });

      const data = await readJson<{ note: Note }>(response);
      onSaved(data.note, isEditing ? "update" : "create");

      if (!isEditing) {
        reset();
      }

      toast.success(isEditing ? "Note updated." : "Note created.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save note.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!initialNote?.id || !window.confirm("Delete this note?")) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/notes/${initialNote.id}`, {
        method: "DELETE"
      });

      await readJson<{ success: true }>(response);
      onDeleted?.(initialNote.id);
      toast.success("Note deleted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete note.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-600 dark:text-gray-500">
            {isEditing ? "Edit note" : "Quick add note"}
          </p>
          <h3 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
            {isEditing ? "Update note" : "Add a note"}
          </h3>
        </div>
        {pinned ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-400/20">
            <Pin className="size-3.5" />
            Focus pinned
          </span>
        ) : null}
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800 dark:text-gray-500" htmlFor="note-title">
            Title
          </label>
          <Input
            id="note-title"
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Weekly planning prompts"
            value={title}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800 dark:text-gray-500" htmlFor="note-content">
            Content
          </label>
          <Textarea
            id="note-content"
            onChange={(event) => setContent(event.target.value)}
            placeholder="Capture ideas, decisions, and next actions"
            rows={compact ? 5 : 8}
            value={content}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800 dark:text-gray-500" htmlFor="note-tags">
            Tags
          </label>
          <Input
            id="note-tags"
            onChange={(event) => setTagsInput(event.target.value)}
            placeholder="planning, meetings, product"
            value={tagsInput}
          />
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300">
          <input
            checked={pinned}
            className="size-4 rounded border-slate-300 text-teal-500 focus:ring-teal-500"
            onChange={(event) => setPinned(event.target.checked)}
            type="checkbox"
          />
          Pin this note for Focus Mode
        </label>

        <div className="flex flex-wrap gap-3">
          <Button className="min-w-36" disabled={submitting} type="submit">
            {submitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
            {isEditing ? (
              <>
                <Save className="size-4" />
                Save changes
              </>
            ) : (
              <>
                <PlusCircle className="size-4" />
                Create note
              </>
            )}
          </Button>

          {isEditing ? (
            <Button disabled={deleting} onClick={handleDelete} variant="danger">
              {deleting ? <LoaderCircle className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              Delete
            </Button>
          ) : null}

          {onCancel ? (
            <Button onClick={onCancel} variant="ghost">
              Reset
            </Button>
          ) : null}
        </div>
      </form>
    </Card>
  );
}

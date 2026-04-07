"use client";

import { useMemo, useState } from "react";

import { LoaderCircle, Search, Shield, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";

import { SetupNotice } from "@/components/setup-notice";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { formatFullDate, readJson } from "@/lib/utils";
import type { AdminSnapshot, AdminUserRecord } from "@/lib/admin";
import type { BudgetEntry, Note, SetupIssue, Task } from "@/types";

type DataTab = "users" | "tasks" | "notes" | "budget";
type EditableRecord =
  | ({ kind: "tasks" } & Task)
  | ({ kind: "notes" } & Note)
  | ({ kind: "budget-entries" } & BudgetEntry);

function formatLocation(user: AdminUserRecord) {
  return user.location || "Unknown";
}

export function AdminWorkspace({
  snapshot
}: {
  snapshot: AdminSnapshot;
}) {
  const [stats, setStats] = useState(snapshot.stats);
  const [users, setUsers] = useState(snapshot.users);
  const [tasks, setTasks] = useState(snapshot.tasks);
  const [notes, setNotes] = useState(snapshot.notes);
  const [budgetEntries, setBudgetEntries] = useState(snapshot.budgetEntries);
  const [activeTab, setActiveTab] = useState<DataTab>("users");
  const [query, setQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string>("all");
  const [workingUserId, setWorkingUserId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorRecord, setEditorRecord] = useState<EditableRecord | null>(null);

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editPriority, setEditPriority] = useState("medium");
  const [editCompleted, setEditCompleted] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editType, setEditType] = useState("expense");
  const [editCategory, setEditCategory] = useState("other");
  const [editEntryDate, setEditEntryDate] = useState("");

  const filteredUsers = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) {
      return users;
    }

    return users.filter((user) =>
      [user.name, user.email]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }, [query, users]);

  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) => {
        if (selectedUserId !== "all" && task.user_id !== selectedUserId) {
          return false;
        }

        const search = query.trim().toLowerCase();

        if (!search) {
          return true;
        }

        return [task.title, task.description].filter(Boolean).join(" ").toLowerCase().includes(search);
      }),
    [query, selectedUserId, tasks]
  );

  const filteredNotes = useMemo(
    () =>
      notes.filter((note) => {
        if (selectedUserId !== "all" && note.user_id !== selectedUserId) {
          return false;
        }

        const search = query.trim().toLowerCase();

        if (!search) {
          return true;
        }

        return [note.title, note.content, ...(note.tags ?? [])]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(search);
      }),
    [notes, query, selectedUserId]
  );

  const filteredBudgetEntries = useMemo(
    () =>
      budgetEntries.filter((entry) => {
        if (selectedUserId !== "all" && entry.user_id !== selectedUserId) {
          return false;
        }

        const search = query.trim().toLowerCase();

        if (!search) {
          return true;
        }

        return [entry.title, entry.category].join(" ").toLowerCase().includes(search);
      }),
    [budgetEntries, query, selectedUserId]
  );

  const selectedUser = users.find((user) => user.id === selectedUserId) ?? null;
  const setupIssue: SetupIssue | null = snapshot.setupIssue;

  const openEditor = (record: EditableRecord) => {
    setEditorRecord(record);
    setEditorOpen(true);

    if (record.kind === "tasks") {
      setEditTitle(record.title);
      setEditDescription(record.description ?? "");
      setEditDueDate(record.due_date ? record.due_date.slice(0, 16) : "");
      setEditPriority(record.priority);
      setEditCompleted(record.completed);
      return;
    }

    if (record.kind === "notes") {
      setEditTitle(record.title ?? "");
      setEditContent(record.content ?? "");
      setEditTags((record.tags ?? []).join(", "));
      return;
    }

    setEditTitle(record.title);
    setEditAmount(String(record.amount));
    setEditType(record.type);
    setEditCategory(record.category);
    setEditEntryDate(record.entry_date);
  };

  const updateUser = async (userId: string, action: "disable" | "enable") => {
    setWorkingUserId(userId);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });

      await readJson(response);
      setUsers((current) =>
        current.map((user) => (user.id === userId ? { ...user, disabled: action === "disable" } : user))
      );
      toast.success(action === "disable" ? "User disabled." : "User enabled.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update user.");
    } finally {
      setWorkingUserId(null);
    }
  };

  const deleteUser = async (userId: string) => {
    setWorkingUserId(userId);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      await readJson(response);
      setUsers((current) => current.filter((user) => user.id !== userId));
      setTasks((current) => current.filter((task) => task.user_id !== userId));
      setNotes((current) => current.filter((note) => note.user_id !== userId));
      setBudgetEntries((current) => current.filter((entry) => entry.user_id !== userId));
      setStats((current) => ({ ...current, totalUsers: current.totalUsers - 1 }));
      toast.success("User deleted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete user.");
    } finally {
      setWorkingUserId(null);
    }
  };

  const saveRecord = async () => {
    if (!editorRecord) {
      return;
    }

    try {
      const body =
        editorRecord.kind === "tasks"
          ? {
              title: editTitle,
              description: editDescription || null,
              dueDate: editDueDate || null,
              priority: editPriority,
              completed: editCompleted
            }
          : editorRecord.kind === "notes"
            ? {
                title: editTitle || null,
                content: editContent || null,
                tags: editTags
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean)
              }
            : {
                title: editTitle,
                amount: Number(editAmount),
                type: editType,
                category: editCategory,
                entryDate: editEntryDate
              };

      const response = await fetch(`/api/admin/data/${editorRecord.kind}/${editorRecord.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await readJson<{ record: Task | Note | BudgetEntry }>(response);

      if (editorRecord.kind === "tasks") {
        setTasks((current) => current.map((item) => (item.id === editorRecord.id ? (data.record as Task) : item)));
      } else if (editorRecord.kind === "notes") {
        setNotes((current) => current.map((item) => (item.id === editorRecord.id ? (data.record as Note) : item)));
      } else {
        setBudgetEntries((current) =>
          current.map((item) => (item.id === editorRecord.id ? (data.record as BudgetEntry) : item))
        );
      }

      setEditorOpen(false);
      toast.success("Record updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update record.");
    }
  };

  const deleteRecord = async () => {
    if (!editorRecord) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/data/${editorRecord.kind}/${editorRecord.id}`, {
        method: "DELETE"
      });

      await readJson(response);

      if (editorRecord.kind === "tasks") {
        setTasks((current) => current.filter((item) => item.id !== editorRecord.id));
      } else if (editorRecord.kind === "notes") {
        setNotes((current) => current.filter((item) => item.id !== editorRecord.id));
      } else {
        setBudgetEntries((current) => current.filter((item) => item.id !== editorRecord.id));
      }

      setEditorOpen(false);
      toast.success("Record deleted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete record.");
    }
  };

  return (
    <div className="space-y-6 p-1">
      <section className="rounded-[2rem] bg-[linear-gradient(135deg,rgba(255,252,247,0.98),rgba(254,243,199,0.42),rgba(204,251,241,0.32))] px-6 py-8 shadow-[0_24px_80px_-42px_rgba(120,53,15,0.16)]">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">Admin panel</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-stone-950">Workspace control center</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">
          Manage users, review tasks and notes across the product, and clean up budget records from one secure place.
        </p>
      </section>

      {setupIssue ? <SetupNotice issue={setupIssue} /> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Users", value: stats.totalUsers },
          { label: "Tasks", value: stats.totalTasks },
          { label: "Notes", value: stats.totalNotes },
          { label: "Budget entries", value: stats.totalBudgetEntries },
          { label: "Active users", value: stats.activeUsers }
        ].map((item) => (
          <Card key={item.label} className="space-y-2">
            <p className="text-sm text-stone-500">{item.label}</p>
            <p className="text-3xl font-bold text-stone-950">{item.value}</p>
          </Card>
        ))}
      </section>

      <Card className="space-y-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {([
              ["users", "Users"],
              ["tasks", "Tasks"],
              ["notes", "Notes"],
              ["budget", "Budget"]
            ] as const).map(([key, label]) => (
              <Button
                key={key}
                className={activeTab === key ? "bg-amber-500 text-white hover:bg-amber-400" : ""}
                onClick={() => setActiveTab(key)}
                size="sm"
                variant={activeTab === key ? "primary" : "secondary"}
              >
                {label}
              </Button>
            ))}
          </div>
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative min-w-[280px]">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
              <Input
                className="pl-11"
                onChange={(event) => setQuery(event.target.value)}
                placeholder={activeTab === "users" ? "Search users by name or email" : "Search current tab"}
                value={query}
              />
            </div>
            {activeTab === "users" ? null : (
              <Select onChange={(event) => setSelectedUserId(event.target.value)} value={selectedUserId}>
                <option value="all">All users</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.email}
                  </option>
                ))}
              </Select>
            )}
          </div>
        </div>

        {activeTab === "users" ? (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
            <div className="overflow-hidden rounded-[1.6rem] border border-amber-100">
              <div className="grid grid-cols-[minmax(0,1.2fr)_1fr_1fr_1fr_auto] gap-3 bg-amber-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                <span>User</span>
                <span>Joined</span>
                <span>Last login</span>
                <span>Location</span>
                <span>Actions</span>
              </div>
              <div className="divide-y divide-amber-100 bg-white">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="grid grid-cols-[minmax(0,1.2fr)_1fr_1fr_1fr_auto] gap-3 px-4 py-4 text-sm">
                    <button className="min-w-0 text-left" onClick={() => setSelectedUserId(user.id)} type="button">
                      <p className="truncate font-semibold text-stone-950">{user.name || "Unnamed user"}</p>
                      <p className="truncate text-stone-500">{user.email}</p>
                    </button>
                    <p className="text-stone-600">{formatFullDate(user.joined)}</p>
                    <p className="text-stone-600">{user.lastLogin ? formatFullDate(user.lastLogin) : "Never"}</p>
                    <p className="text-stone-600">{formatLocation(user)}</p>
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        disabled={workingUserId === user.id}
                        onClick={() => updateUser(user.id, user.disabled ? "enable" : "disable")}
                        size="sm"
                        variant="secondary"
                      >
                        {workingUserId === user.id ? (
                          <LoaderCircle className="size-4 animate-spin" />
                        ) : (
                          <Shield className="size-4" />
                        )}
                        {user.disabled ? "Enable" : "Disable"}
                      </Button>
                      <Button disabled={workingUserId === user.id} onClick={() => deleteUser(user.id)} size="sm" variant="danger">
                        <Trash2 className="size-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Card className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="inline-flex size-12 items-center justify-center rounded-[1.1rem] bg-amber-50 text-amber-700">
                  <UserRound className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">User details</p>
                  <h2 className="text-xl font-bold text-stone-950">{selectedUser?.name || "Select a user"}</h2>
                </div>
              </div>
              {selectedUser ? (
                <div className="space-y-3">
                  <div className="rounded-[1.3rem] bg-stone-50 px-4 py-4">
                    <p className="text-sm font-semibold text-stone-900">Email</p>
                    <p className="mt-1 text-sm text-stone-600">{selectedUser.email}</p>
                  </div>
                  <div className="rounded-[1.3rem] bg-stone-50 px-4 py-4">
                    <p className="text-sm font-semibold text-stone-900">Location</p>
                    <p className="mt-1 text-sm text-stone-600">{formatLocation(selectedUser)}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[1.3rem] bg-stone-50 px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Tasks</p>
                      <p className="mt-2 text-2xl font-bold text-stone-950">{selectedUser.taskCount}</p>
                    </div>
                    <div className="rounded-[1.3rem] bg-stone-50 px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Notes</p>
                      <p className="mt-2 text-2xl font-bold text-stone-950">{selectedUser.noteCount}</p>
                    </div>
                    <div className="rounded-[1.3rem] bg-stone-50 px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Budget</p>
                      <p className="mt-2 text-2xl font-bold text-stone-950">{selectedUser.budgetCount}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-stone-600">Pick a user from the table to inspect details.</p>
              )}
            </Card>
          </div>
        ) : activeTab === "tasks" ? (
          <DataTable
            rows={filteredTasks.map((task) => ({
              id: task.id,
              title: task.title,
              detail: task.description || "No description",
              meta: users.find((user) => user.id === task.user_id)?.email || task.user_id,
              right: task.completed ? "Completed" : task.priority,
              onEdit: () => openEditor({ kind: "tasks", ...task })
            }))}
          />
        ) : activeTab === "notes" ? (
          <DataTable
            rows={filteredNotes.map((note) => ({
              id: note.id,
              title: note.title || "Untitled note",
              detail: note.content || "No content",
              meta: users.find((user) => user.id === note.user_id)?.email || note.user_id,
              right: (note.tags ?? []).join(", ") || "No tags",
              onEdit: () => openEditor({ kind: "notes", ...note })
            }))}
          />
        ) : (
          <DataTable
            rows={filteredBudgetEntries.map((entry) => ({
              id: entry.id,
              title: entry.title,
              detail: entry.category,
              meta: users.find((user) => user.id === entry.user_id)?.email || entry.user_id,
              right: `${entry.type} • ${entry.amount}`,
              onEdit: () => openEditor({ kind: "budget-entries", ...entry })
            }))}
          />
        )}
      </Card>

      <Modal
        className="max-w-xl"
        description="Fix or remove the selected record."
        onClose={() => setEditorOpen(false)}
        open={editorOpen}
        title="Edit record"
      >
        {editorRecord?.kind === "tasks" ? (
          <div className="space-y-4">
            <Input onChange={(event) => setEditTitle(event.target.value)} value={editTitle} />
            <Input onChange={(event) => setEditDueDate(event.target.value)} type="datetime-local" value={editDueDate} />
            <Select onChange={(event) => setEditPriority(event.target.value)} value={editPriority}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
            <Input onChange={(event) => setEditDescription(event.target.value)} value={editDescription} />
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800">
              <input checked={editCompleted} onChange={(event) => setEditCompleted(event.target.checked)} type="checkbox" />
              Mark completed
            </label>
          </div>
        ) : editorRecord?.kind === "notes" ? (
          <div className="space-y-4">
            <Input onChange={(event) => setEditTitle(event.target.value)} value={editTitle} />
            <Input onChange={(event) => setEditContent(event.target.value)} value={editContent} />
            <Input onChange={(event) => setEditTags(event.target.value)} value={editTags} />
          </div>
        ) : editorRecord?.kind === "budget-entries" ? (
          <div className="space-y-4">
            <Input onChange={(event) => setEditTitle(event.target.value)} value={editTitle} />
            <Input onChange={(event) => setEditAmount(event.target.value)} type="number" value={editAmount} />
            <Select onChange={(event) => setEditType(event.target.value)} value={editType}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </Select>
            <Input onChange={(event) => setEditCategory(event.target.value)} value={editCategory} />
            <Input onChange={(event) => setEditEntryDate(event.target.value)} type="date" value={editEntryDate} />
          </div>
        ) : null}
        <div className="mt-5 flex flex-wrap gap-3">
          <Button onClick={saveRecord}>Save</Button>
          <Button onClick={deleteRecord} variant="danger">
            Delete
          </Button>
          <Button onClick={() => setEditorOpen(false)} variant="secondary">
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function DataTable({
  rows
}: {
  rows: Array<{
    id: string;
    title: string;
    detail: string;
    meta: string;
    right: string;
    onEdit: () => void;
  }>;
}) {
  return (
    <div className="overflow-hidden rounded-[1.6rem] border border-amber-100">
      <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-3 bg-amber-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
        <span>Title</span>
        <span>Detail</span>
        <span>User</span>
        <span>Action</span>
      </div>
      <div className="divide-y divide-amber-100 bg-white">
        {rows.map((row) => (
          <div key={row.id} className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-3 px-4 py-4 text-sm">
            <div className="min-w-0">
              <p className="truncate font-semibold text-stone-950">{row.title}</p>
              <p className="mt-1 truncate text-xs text-stone-500">{row.right}</p>
            </div>
            <p className="truncate text-stone-600">{row.detail}</p>
            <p className="truncate text-stone-600">{row.meta}</p>
            <Button onClick={row.onEdit} size="sm" variant="secondary">
              Edit
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

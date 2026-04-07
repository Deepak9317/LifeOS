"use client";

import { useMemo, useState } from "react";

import {
  ArrowDownRight,
  ArrowUpRight,
  CircleDollarSign,
  LoaderCircle,
  Pencil,
  PiggyBank,
  PlusCircle,
  TrendingDown,
  Wallet
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { readJson } from "@/lib/utils";
import type { BudgetEntry, BudgetSettings } from "@/types";

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  salary: ["salary", "pay", "bonus", "freelance", "invoice", "income"],
  food: ["lunch", "dinner", "breakfast", "food", "groceries", "coffee", "snack", "swiggy", "zomato"],
  bills: ["rent", "electricity", "water", "internet", "wifi", "bill", "emi", "insurance"],
  transport: ["uber", "ola", "metro", "train", "bus", "fuel", "petrol", "diesel", "cab", "transport"],
  shopping: ["amazon", "flipkart", "shopping", "clothes", "buy", "purchase"],
  health: ["doctor", "medicine", "pharmacy", "hospital", "gym", "health"],
  travel: ["flight", "hotel", "trip", "travel", "vacation"],
  entertainment: ["movie", "netflix", "spotify", "game", "concert"],
  savings: ["saving", "investment", "sip", "fd", "mutual"],
  other: []
};

const CURRENCY_OPTIONS = ["INR", "USD", "EUR", "GBP", "SGD", "AUD", "AED", "JPY"];

function detectEntryType(input: string) {
  const normalized = input.toLowerCase();
  return /(salary|bonus|freelance|invoice|refund|income|credit|received)/.test(normalized)
    ? "income"
    : "expense";
}

function detectCategory(input: string, type: "income" | "expense") {
  const normalized = input.toLowerCase();

  if (type === "income") {
    return "salary";
  }

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return category;
    }
  }

  return "other";
}

function parseQuickEntry(input: string) {
  const trimmed = input.trim().replace(/\s+/g, " ");
  const match = trimmed.match(/^(.*?)(\d+(?:\.\d{1,2})?)$/);

  if (!match) {
    return null;
  }

  const title = match[1]?.trim();
  const amount = Number(match[2]);

  if (!title || Number.isNaN(amount) || amount <= 0) {
    return null;
  }

  const type = detectEntryType(title);

  return {
    title,
    amount,
    type,
    category: detectCategory(title, type),
    entryDate: new Date().toISOString().slice(0, 10)
  };
}

function formatCurrency(amount: number, currencyCode: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0
  }).format(amount);
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function isInRange(entryDate: string, start: Date, end: Date) {
  const value = new Date(entryDate);
  return value >= start && value <= end;
}

export function BudgetManager({
  initialEntries,
  initialSettings
}: {
  initialEntries: BudgetEntry[];
  initialSettings: BudgetSettings | null;
}) {
  const [entries, setEntries] = useState<BudgetEntry[]>(initialEntries);
  const [settings, setSettings] = useState<BudgetSettings>(
    initialSettings ?? {
      user_id: "",
      monthly_budget: 0,
      currency_code: "INR",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  );
  const [quickEntry, setQuickEntry] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [entryEditorOpen, setEntryEditorOpen] = useState(false);
  const [editorEntry, setEditorEntry] = useState<BudgetEntry | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editType, setEditType] = useState<"income" | "expense">("expense");
  const [editCategory, setEditCategory] = useState("other");
  const [editDate, setEditDate] = useState(new Date().toISOString().slice(0, 10));
  const [monthlyBudgetInput, setMonthlyBudgetInput] = useState(String(initialSettings?.monthly_budget ?? 0));
  const [currencyCode, setCurrencyCode] = useState(initialSettings?.currency_code ?? "INR");

  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthStart = startOfMonth(previousMonthDate);
  const previousMonthEnd = endOfMonth(previousMonthDate);

  const currentMonthEntries = useMemo(
    () => entries.filter((entry) => isInRange(entry.entry_date, currentMonthStart, currentMonthEnd)),
    [currentMonthEnd, currentMonthStart, entries]
  );
  const previousMonthEntries = useMemo(
    () => entries.filter((entry) => isInRange(entry.entry_date, previousMonthStart, previousMonthEnd)),
    [entries, previousMonthEnd, previousMonthStart]
  );

  const income = currentMonthEntries
    .filter((entry) => entry.type === "income")
    .reduce((sum, entry) => sum + Number(entry.amount), 0);
  const expenses = currentMonthEntries
    .filter((entry) => entry.type === "expense")
    .reduce((sum, entry) => sum + Number(entry.amount), 0);
  const balance = income - expenses;
  const usage = settings.monthly_budget > 0 ? Math.min(100, (expenses / settings.monthly_budget) * 100) : 0;
  const status = settings.monthly_budget > 0 && expenses > settings.monthly_budget ? "Overspending" : "Safe";

  const categorySpend = useMemo(() => {
    const groups = new Map<string, number>();

    currentMonthEntries
      .filter((entry) => entry.type === "expense")
      .forEach((entry) => {
        groups.set(entry.category, (groups.get(entry.category) ?? 0) + Number(entry.amount));
      });

    return Array.from(groups.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((left, right) => right.amount - left.amount);
  }, [currentMonthEntries]);

  const previousExpenses = previousMonthEntries
    .filter((entry) => entry.type === "expense")
    .reduce((sum, entry) => sum + Number(entry.amount), 0);
  const spendDelta = expenses - previousExpenses;
  const topCategory = categorySpend[0];

  const openEditor = (entry: BudgetEntry) => {
    setEditorEntry(entry);
    setEditTitle(entry.title);
    setEditAmount(String(entry.amount));
    setEditType(entry.type);
    setEditCategory(entry.category);
    setEditDate(entry.entry_date);
    setEntryEditorOpen(true);
  };

  const openNewEntry = () => {
    setEditorEntry(null);
    setEditTitle("");
    setEditAmount("");
    setEditType("expense");
    setEditCategory("other");
    setEditDate(new Date().toISOString().slice(0, 10));
    setEntryEditorOpen(true);
  };

  const submitQuickEntry = async () => {
    const parsed = parseQuickEntry(quickEntry);

    if (!parsed) {
      toast.error("Use a quick format like 'Lunch 200' or 'Salary 30000'.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed)
      });

      const data = await readJson<{ entry: BudgetEntry }>(response);
      setEntries((current) => [data.entry, ...current]);
      setQuickEntry("");
      toast.success("Budget entry added.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save budget entry.");
    } finally {
      setSubmitting(false);
    }
  };

  const saveSettings = async () => {
    try {
      const response = await fetch("/api/budget/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthlyBudget: Number(monthlyBudgetInput || 0),
          currencyCode
        })
      });

      const data = await readJson<{ settings: BudgetSettings }>(response);
      setSettings(data.settings);
      setMonthlyBudgetInput(String(data.settings.monthly_budget));
      setCurrencyCode(data.settings.currency_code);
      setSettingsOpen(false);
      toast.success("Budget settings updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update budget settings.");
    }
  };

  const saveEntry = async () => {
    try {
      const response = await fetch(editorEntry ? `/api/budget/${editorEntry.id}` : "/api/budget", {
        method: editorEntry ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          amount: Number(editAmount),
          type: editType,
          category: editCategory,
          entryDate: editDate
        })
      });

      const data = await readJson<{ entry: BudgetEntry }>(response);
      setEntries((current) =>
        editorEntry
          ? current.map((entry) => (entry.id === data.entry.id ? data.entry : entry))
          : [data.entry, ...current]
      );
      setEntryEditorOpen(false);
      toast.success(editorEntry ? "Budget entry updated." : "Budget entry created.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save budget entry.");
    }
  };

  const deleteEntry = async () => {
    if (!editorEntry) {
      return;
    }

    try {
      const response = await fetch(`/api/budget/${editorEntry.id}`, { method: "DELETE" });
      await readJson<{ success: true }>(response);
      setEntries((current) => current.filter((entry) => entry.id !== editorEntry.id));
      setEntryEditorOpen(false);
      toast.success("Budget entry deleted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete budget entry.");
    }
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)]">
        <Card className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Money snapshot</p>
              <h2 className="mt-2 text-2xl font-bold text-stone-950">Fast monthly overview</h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Add an entry in one line and know instantly whether the month is safe or overspending.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={openNewEntry} size="sm" variant="secondary">
                <PlusCircle className="size-4" />
                Add entry
              </Button>
              <Button onClick={() => setSettingsOpen(true)} size="sm" variant="secondary">
                <Pencil className="size-4" />
                Budget settings
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[1.4rem] bg-amber-50/70 px-4 py-4">
              <div className="flex items-center gap-2 text-sm font-medium text-stone-600">
                <Wallet className="size-4 text-amber-700" />
                Balance
              </div>
              <p className="mt-3 text-2xl font-bold text-stone-950">{formatCurrency(balance, settings.currency_code)}</p>
            </div>
            <div className="rounded-[1.4rem] bg-emerald-50/80 px-4 py-4">
              <div className="flex items-center gap-2 text-sm font-medium text-stone-600">
                <ArrowUpRight className="size-4 text-emerald-700" />
                Income
              </div>
              <p className="mt-3 text-2xl font-bold text-emerald-700">{formatCurrency(income, settings.currency_code)}</p>
            </div>
            <div className="rounded-[1.4rem] bg-rose-50/80 px-4 py-4">
              <div className="flex items-center gap-2 text-sm font-medium text-stone-600">
                <ArrowDownRight className="size-4 text-rose-700" />
                Expenses
              </div>
              <p className="mt-3 text-2xl font-bold text-rose-700">{formatCurrency(expenses, settings.currency_code)}</p>
            </div>
            <div className="rounded-[1.4rem] bg-white px-4 py-4 ring-1 ring-amber-100">
              <div className="flex items-center gap-2 text-sm font-medium text-stone-600">
                <CircleDollarSign className="size-4 text-amber-700" />
                Status
              </div>
              <p className="mt-3 text-2xl font-bold text-stone-950">{status}</p>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
            <Input
              onChange={(event) => setQuickEntry(event.target.value)}
              placeholder="Lunch 200 or Salary 30000"
              value={quickEntry}
            />
            <Button disabled={submitting} onClick={submitQuickEntry}>
              {submitting ? <LoaderCircle className="size-4 animate-spin" /> : <PlusCircle className="size-4" />}
              Quick add
            </Button>
          </div>
          <p className="text-xs font-medium text-stone-500">
            Auto-detects income vs expense and assigns a simple category for you.
          </p>
        </Card>

        <Card className="space-y-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">Budget limit</p>
            <h3 className="mt-2 text-xl font-bold text-stone-950">Monthly usage</h3>
          </div>
          <div className="rounded-[1.4rem] bg-stone-50 px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-stone-600">Budget</p>
              <p className="text-sm font-semibold text-stone-950">
                {formatCurrency(settings.monthly_budget, settings.currency_code)}
              </p>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-stone-200">
              <div
                className={`h-full rounded-full ${status === "Overspending" ? "bg-rose-500" : "bg-emerald-500"}`}
                style={{ width: `${Math.max(8, usage)}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-stone-600">
              {settings.monthly_budget > 0
                ? `${usage.toFixed(0)}% of the monthly budget is used.`
                : "Set a monthly budget to track usage."}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.4rem] bg-amber-50/70 px-4 py-4">
              <p className="text-sm font-medium text-stone-600">Previous period</p>
              <p className="mt-2 text-lg font-bold text-stone-950">
                {spendDelta > 0 ? "+" : ""}
                {formatCurrency(spendDelta, settings.currency_code)}
              </p>
              <p className="mt-1 text-sm text-stone-600">vs last month&apos;s spending</p>
            </div>
            <div className="rounded-[1.4rem] bg-teal-50/70 px-4 py-4">
              <p className="text-sm font-medium text-stone-600">Top expense</p>
              <p className="mt-2 text-lg font-bold text-stone-950">
                {topCategory ? topCategory.category : "No expenses"}
              </p>
              <p className="mt-1 text-sm text-stone-600">
                {topCategory ? formatCurrency(topCategory.amount, settings.currency_code) : "Nothing logged yet"}
              </p>
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
        <Card className="space-y-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Monthly view</p>
            <h3 className="mt-2 text-xl font-bold text-stone-950">Categories this month</h3>
          </div>
          {categorySpend.length === 0 ? (
            <EmptyState
              actionLabel="Add an entry"
              description="Your monthly category summary will appear here after the first expense."
              icon={PiggyBank}
              onAction={() => undefined}
              title="No expenses yet"
            />
          ) : (
            <div className="space-y-3">
              {categorySpend.map((item) => (
                <div key={item.category} className="rounded-[1.3rem] bg-stone-50 px-4 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold capitalize text-stone-900">{item.category}</p>
                    <p className="text-sm font-semibold text-stone-950">
                      {formatCurrency(item.amount, settings.currency_code)}
                    </p>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-200">
                    <div
                      className="h-full rounded-full bg-amber-500"
                      style={{ width: `${Math.min(100, expenses > 0 ? (item.amount / expenses) * 100 : 0)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="space-y-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Recent entries</p>
            <h3 className="mt-2 text-xl font-bold text-stone-950">Edit when needed</h3>
          </div>
          <div className="space-y-3">
            {entries.length === 0 ? (
              <p className="rounded-[1.3rem] bg-stone-50 px-4 py-4 text-sm text-stone-600">
                Add your first entry to unlock a cleaner monthly snapshot.
              </p>
            ) : (
              entries.slice(0, 8).map((entry) => (
                <button
                  key={entry.id}
                  className="flex w-full items-center justify-between gap-4 rounded-[1.3rem] bg-stone-50 px-4 py-4 text-left transition hover:bg-amber-50/70"
                  onClick={() => openEditor(entry)}
                  type="button"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-stone-900">{entry.title}</p>
                    <p className="mt-1 text-xs text-stone-500">
                      {entry.category} • {new Date(entry.entry_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={`text-sm font-semibold ${entry.type === "income" ? "text-emerald-700" : "text-rose-700"}`}>
                      {entry.type === "income" ? "+" : "-"}
                      {formatCurrency(entry.amount, settings.currency_code)}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">Edit</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>
      </section>

      <Modal
        className="max-w-lg"
        description="Set the monthly limit and preferred currency."
        onClose={() => setSettingsOpen(false)}
        open={settingsOpen}
        title="Budget settings"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700">Monthly budget</label>
            <Input onChange={(event) => setMonthlyBudgetInput(event.target.value)} type="number" value={monthlyBudgetInput} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700">Currency</label>
            <Select onChange={(event) => setCurrencyCode(event.target.value)} value={currencyCode}>
              {CURRENCY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={saveSettings}>Save settings</Button>
            <Button onClick={() => setSettingsOpen(false)} variant="secondary">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        className="max-w-lg"
        description={editorEntry ? "Update or delete this budget entry." : "Add a detailed budget entry."}
        onClose={() => setEntryEditorOpen(false)}
        open={entryEditorOpen}
        title={editorEntry ? "Edit budget entry" : "New budget entry"}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700">Title</label>
            <Input onChange={(event) => setEditTitle(event.target.value)} value={editTitle} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Amount</label>
              <Input onChange={(event) => setEditAmount(event.target.value)} type="number" value={editAmount} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Type</label>
              <Select onChange={(event) => setEditType(event.target.value as "income" | "expense")} value={editType}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Category</label>
              <Select onChange={(event) => setEditCategory(event.target.value)} value={editCategory}>
                {Object.keys(CATEGORY_KEYWORDS).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Date</label>
              <Input onChange={(event) => setEditDate(event.target.value)} type="date" value={editDate} />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={saveEntry}>{editorEntry ? "Save changes" : "Create entry"}</Button>
            {editorEntry ? (
              <Button onClick={deleteEntry} variant="danger">
                <TrendingDown className="size-4" />
                Delete
              </Button>
            ) : null}
            <Button onClick={() => setEntryEditorOpen(false)} variant="secondary">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

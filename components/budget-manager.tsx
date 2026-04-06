"use client";

import { useEffect, useState } from "react";

import { Landmark, PlusCircle, TrendingDown, TrendingUp, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type BudgetEntry = {
  id: string;
  name: string;
  amount: number;
  type: "income" | "expense";
  createdAt: string;
};

const STORAGE_KEY = "lifeos-budget-manager";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(amount);
}

export function BudgetManager() {
  const [entries, setEntries] = useState<BudgetEntry[]>([]);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<BudgetEntry["type"]>("expense");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return;
    }

    try {
      const parsed = JSON.parse(saved) as BudgetEntry[];
      if (Array.isArray(parsed)) {
        setEntries(parsed);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const income = entries
    .filter((entry) => entry.type === "income")
    .reduce((sum, entry) => sum + entry.amount, 0);
  const expenses = entries
    .filter((entry) => entry.type === "expense")
    .reduce((sum, entry) => sum + entry.amount, 0);
  const balance = income - expenses;

  const addEntry = () => {
    const normalizedAmount = Number(amount);

    if (!name.trim() || Number.isNaN(normalizedAmount) || normalizedAmount <= 0) {
      return;
    }

    setEntries((current) => [
      {
        id: crypto.randomUUID(),
        name: name.trim(),
        amount: normalizedAmount,
        type,
        createdAt: new Date().toISOString()
      },
      ...current
    ]);
    setName("");
    setAmount("");
    setType("expense");
  };

  return (
    <Card className="card-hover animate-fade-up space-y-5 border-emerald-100 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(243,252,248,0.95))]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Budget</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">Budget manager</h2>
        </div>
        <div className="inline-flex size-12 items-center justify-center rounded-[1.2rem] bg-emerald-500/10 text-emerald-700">
          <Landmark className="size-5" />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-[1.25rem] bg-white/80 p-4 ring-1 ring-emerald-100">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <Wallet className="size-4 text-emerald-600" />
            Balance
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-950">{formatCurrency(balance)}</p>
        </div>
        <div className="rounded-[1.25rem] bg-white/80 p-4 ring-1 ring-emerald-100">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <TrendingUp className="size-4 text-emerald-600" />
            Income
          </div>
          <p className="mt-3 text-2xl font-bold text-emerald-700">{formatCurrency(income)}</p>
        </div>
        <div className="rounded-[1.25rem] bg-white/80 p-4 ring-1 ring-rose-100">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <TrendingDown className="size-4 text-rose-600" />
            Expenses
          </div>
          <p className="mt-3 text-2xl font-bold text-rose-700">{formatCurrency(expenses)}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_120px_120px_auto]">
        <Input
          onChange={(event) => setName(event.target.value)}
          placeholder="Rent, salary, tools"
          value={name}
        />
        <Input
          min="0"
          onChange={(event) => setAmount(event.target.value)}
          placeholder="Amount"
          step="0.01"
          type="number"
          value={amount}
        />
        <select
          className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-400/10"
          onChange={(event) => setType(event.target.value as BudgetEntry["type"])}
          value={type}
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <Button className="bg-emerald-600 text-white hover:bg-emerald-500" onClick={addEntry}>
          <PlusCircle className="size-4" />
          Add
        </Button>
      </div>

      <div className="space-y-3">
        {entries.length === 0 ? (
          <div className="rounded-[1.25rem] border border-dashed border-emerald-200 bg-white/70 p-4 text-sm text-slate-600">
            Add income and expenses to keep a soft snapshot of monthly cash flow.
          </div>
        ) : (
          entries.slice(0, 5).map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between gap-4 rounded-[1.25rem] bg-white/80 px-4 py-3 ring-1 ring-slate-100"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">{entry.name}</p>
                <p className="text-xs text-slate-500">
                  {new Date(entry.createdAt).toLocaleDateString()}
                </p>
              </div>
              <p
                className={cn(
                  "text-sm font-semibold",
                  entry.type === "income" ? "text-emerald-700" : "text-rose-700"
                )}
              >
                {entry.type === "income" ? "+" : "-"}
                {formatCurrency(entry.amount)}
              </p>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

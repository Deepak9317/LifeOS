"use client";

import { BudgetManager } from "@/components/budget-manager";
import { SetupNotice } from "@/components/setup-notice";
import type { BudgetEntry, BudgetSettings, SetupIssue } from "@/types";

export function BudgetWorkspace({
  entries,
  settings,
  setupIssue = null
}: {
  entries: BudgetEntry[];
  settings: BudgetSettings | null;
  setupIssue?: SetupIssue | null;
}) {
  return (
    <div className="space-y-6 p-1">
      <section className="animate-fade-up rounded-[2rem] border border-white/90 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(240,253,244,0.92),rgba(236,253,245,0.92))] px-6 py-8 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.18)]">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Budget</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">Budget manager</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          A fast money snapshot with monthly usage, simple categories, and quick entry.
        </p>
      </section>

      {setupIssue ? <SetupNotice issue={setupIssue} /> : <BudgetManager initialEntries={entries} initialSettings={settings} />}
    </div>
  );
}

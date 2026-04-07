"use client";

import { BudgetManager } from "@/components/budget-manager";

export function BudgetWorkspace() {
  return (
    <div className="space-y-6 p-1">
      <section className="animate-fade-up rounded-[2rem] border border-white/90 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(240,253,244,0.92),rgba(236,253,245,0.92))] px-6 py-8 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.18)]">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Budget</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">Budget manager</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Track income, expenses, and balance in one calm space separate from planning and task flow.
        </p>
      </section>

      <BudgetManager />
    </div>
  );
}

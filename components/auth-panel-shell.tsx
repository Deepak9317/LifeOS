import { Card } from "@/components/ui/card";

export function AuthPanelShell() {
  return (
    <div className="grid min-h-[720px] gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(420px,0.85fr)]">
      <section className="space-y-8 rounded-[2rem] border border-white/60 bg-[linear-gradient(180deg,rgba(255,252,247,0.95),rgba(247,244,238,0.92))] px-7 py-8 shadow-[0_28px_90px_-50px_rgba(28,25,23,0.24)] sm:px-9">
        <div className="h-11 w-28 rounded-2xl bg-stone-200" />
        <div className="space-y-4">
          <div className="h-3.5 w-32 rounded-full bg-teal-100" />
          <div className="h-12 w-full max-w-xl rounded-[1.25rem] bg-stone-200" />
          <div className="h-12 w-4/5 max-w-lg rounded-[1.25rem] bg-stone-100" />
          <div className="h-6 w-full max-w-xl rounded-full bg-stone-100" />
        </div>
        <div className="grid gap-3 sm:max-w-xl">
          <div className="h-12 rounded-[1.1rem] bg-white shadow-sm ring-1 ring-stone-200" />
          <div className="h-12 rounded-[1.1rem] bg-white shadow-sm ring-1 ring-stone-200" />
          <div className="h-12 rounded-[1.1rem] bg-white shadow-sm ring-1 ring-stone-200" />
        </div>
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_220px]">
          <div className="rounded-[1.8rem] bg-white p-5 shadow-sm ring-1 ring-stone-200">
            <div className="h-6 w-28 rounded-full bg-stone-200" />
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="h-28 rounded-[1.2rem] bg-stone-950" />
              <div className="h-28 rounded-[1.2rem] bg-amber-50" />
              <div className="h-28 rounded-[1.2rem] bg-teal-50" />
            </div>
            <div className="mt-4 h-20 rounded-[1.2rem] bg-stone-100" />
          </div>
          <div className="h-52 rounded-[1.8rem] bg-stone-950" />
        </div>
      </section>

      <div className="flex items-center justify-center">
        <Card className="w-full max-w-[460px] rounded-[2rem] border border-stone-200/80 bg-[rgba(255,255,255,0.9)] p-7 shadow-[0_32px_90px_-50px_rgba(28,25,23,0.24)] sm:p-8">
          <div className="space-y-4">
            <div className="h-9 w-52 rounded-full bg-stone-200" />
            <div className="h-5 w-64 rounded-full bg-stone-100" />
            <div className="space-y-3 pt-3">
              <div className="h-12 w-full rounded-[1.1rem] bg-stone-100" />
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-stone-200" />
                <div className="h-3 w-8 rounded-full bg-stone-100" />
                <div className="h-px flex-1 bg-stone-200" />
              </div>
              <div className="h-4 w-16 rounded-full bg-stone-100" />
              <div className="h-12 w-full rounded-[1.1rem] bg-stone-100" />
              <div className="h-4 w-20 rounded-full bg-stone-100" />
              <div className="h-12 w-full rounded-[1.1rem] bg-stone-100" />
              <div className="h-12 w-full rounded-[1.1rem] bg-amber-100" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

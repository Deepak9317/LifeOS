import { Card } from "@/components/ui/card";

export function AuthPanelShell() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_500px] lg:items-center">
      <section className="space-y-6 rounded-[2.25rem] bg-[linear-gradient(135deg,rgba(68,64,60,0.96),rgba(146,64,14,0.92),rgba(13,148,136,0.88))] px-7 py-8 text-white shadow-[0_30px_90px_-42px_rgba(120,53,15,0.3)] sm:px-9">
        <div className="h-11 w-28 rounded-2xl bg-white/15" />
        <div className="space-y-3">
          <div className="h-4 w-32 rounded-full bg-white/20" />
          <div className="h-12 w-full max-w-xl rounded-[1.5rem] bg-white/20" />
          <div className="h-12 w-4/5 max-w-lg rounded-[1.5rem] bg-white/15" />
          <div className="h-6 w-full max-w-xl rounded-full bg-white/15" />
        </div>
      </section>

      <Card className="border-amber-100/70 bg-[rgba(255,253,249,0.94)] p-7 shadow-[0_26px_70px_-36px_rgba(120,53,15,0.14)] sm:p-8">
        <div className="space-y-4">
          <div className="h-8 w-52 rounded-full bg-stone-200" />
          <div className="h-5 w-72 rounded-full bg-stone-100" />
          <div className="space-y-3 pt-4">
            <div className="h-4 w-16 rounded-full bg-stone-100" />
            <div className="h-11 w-full rounded-2xl bg-stone-100" />
            <div className="h-4 w-20 rounded-full bg-stone-100" />
            <div className="h-11 w-full rounded-2xl bg-stone-100" />
            <div className="h-12 w-full rounded-2xl bg-amber-100" />
          </div>
        </div>
      </Card>
    </div>
  );
}

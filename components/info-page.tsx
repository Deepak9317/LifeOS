import Link from "next/link";

import { Card } from "@/components/ui/card";

type InfoPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: Array<{
    title: string;
    body: string;
  }>;
};

export function InfoPage({ eyebrow, title, intro, sections }: InfoPageProps) {
  return (
    <div className="mx-auto min-h-screen w-full max-w-[1180px] px-4 py-10 sm:px-6">
      <div className="space-y-8">
        <section className="rounded-[2rem] border border-amber-100/70 bg-[linear-gradient(135deg,rgba(255,252,247,0.98),rgba(254,243,199,0.36),rgba(204,251,241,0.24))] px-6 py-10 shadow-[0_24px_70px_-40px_rgba(120,53,15,0.16)]">
          <div className="max-w-3xl space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">{eyebrow}</p>
            <h1 className="text-4xl font-bold tracking-tight text-stone-950 sm:text-5xl">{title}</h1>
            <p className="text-base leading-7 text-stone-600">{intro}</p>
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          {sections.map((section) => (
            <Card key={section.title} className="space-y-3">
              <h2 className="text-2xl font-bold text-stone-950">{section.title}</h2>
              <p className="text-sm leading-7 text-stone-600">{section.body}</p>
            </Card>
          ))}
        </div>

        <Card className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Explore</p>
            <p className="mt-2 text-sm text-stone-600">Move between dashboard, support, and policy pages from one place.</p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm font-semibold text-amber-700">
            <Link href="/">Dashboard</Link>
            <Link href="/about">About</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/sitemap">Sitemap</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

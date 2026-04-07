"use client";

import { useState } from "react";

import { CircleDollarSign, Clock3, Focus, LayoutDashboard, Menu, NotebookPen, TimerReset, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { UserAvatarMenu } from "@/components/user-avatar-menu";
import { WorldClockStrip } from "@/components/world-clock-strip";
import { APP_VERSION } from "@/lib/constants";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: Clock3 },
  { href: "/notes", label: "Notes", icon: NotebookPen },
  { href: "/time", label: "Time", icon: TimerReset },
  { href: "/budget", label: "Budget", icon: CircleDollarSign },
  { href: "/focus", label: "Focus Mode", icon: Focus }
];

export function AppShell({
  children,
  userEmail,
  profileName
}: {
  children: React.ReactNode;
  userEmail: string;
  profileName?: string | null;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-[1680px] gap-5 px-4 py-4 sm:px-6">
        <aside className="hidden w-[296px] shrink-0 rounded-[2rem] border border-amber-100/70 bg-[rgba(255,252,247,0.82)] p-6 shadow-[0_24px_70px_-42px_rgba(120,53,15,0.16)] backdrop-blur xl:flex xl:flex-col">
          <div className="flex-1 space-y-8">
            <Logo />
            <nav className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition",
                      active
                        ? "bg-[linear-gradient(135deg,rgba(254,243,199,0.98),rgba(204,251,241,0.96))] text-stone-950 ring-1 ring-amber-100 shadow-[0_18px_40px_-30px_rgba(217,119,6,0.25)]"
                        : "text-stone-600 hover:bg-white/90 hover:text-stone-950"
                    )}
                    href={item.href}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="space-y-4 rounded-[1.75rem] border border-amber-100/70 bg-white/72 px-4 py-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Signed in</p>
              <p className="mt-2 text-sm font-semibold text-stone-950">{userEmail}</p>
            </div>
            <div className="rounded-2xl bg-amber-50 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                Version
              </p>
              <p className="mt-1 text-sm font-semibold text-stone-950">v{APP_VERSION}</p>
            </div>
            <UserAvatarMenu email={userEmail} name={profileName} />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex items-center justify-between rounded-[1.75rem] border border-amber-100/70 bg-[rgba(255,253,249,0.86)] px-4 py-3 shadow-[0_18px_48px_-36px_rgba(120,53,15,0.16)] backdrop-blur">
            <Logo compact />
            <div className="flex items-center gap-2">
              <Button onClick={() => setMobileOpen((current) => !current)} size="sm" variant="secondary">
                {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
              </Button>
            </div>
          </div>

          {mobileOpen ? (
            <div className="rounded-[1.75rem] border border-amber-100/70 bg-[rgba(255,253,249,0.92)] p-4 shadow-[0_18px_48px_-36px_rgba(120,53,15,0.16)] xl:hidden">
              <nav className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition",
                        active
                          ? "bg-[linear-gradient(135deg,rgba(254,243,199,0.98),rgba(204,251,241,0.96))] text-stone-950 ring-1 ring-amber-100"
                          : "text-stone-600 hover:bg-white hover:text-stone-950"
                      )}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                    >
                      <Icon className="size-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                  Version
                </p>
                <p className="mt-1 text-sm font-semibold text-stone-950">v{APP_VERSION}</p>
              </div>
              <div className="mt-4">
                <UserAvatarMenu email={userEmail} name={profileName} />
              </div>
            </div>
          ) : null}

          <WorldClockStrip />
          <main className="min-w-0 flex-1 rounded-[2rem]">{children}</main>
        </div>
      </div>
    </div>
  );
}

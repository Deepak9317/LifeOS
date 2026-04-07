"use client";

import { useState } from "react";

import {
  CircleDollarSign,
  Clock3,
  Focus,
  LayoutDashboard,
  Mail,
  Menu,
  NotebookPen,
  ScrollText,
  Shield,
  TimerReset,
  UserRound,
  X
} from "lucide-react";
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
  { href: "/focus", label: "Focus", icon: Focus }
];

const companyLinks = [
  { href: "/about", label: "About", icon: LayoutDashboard },
  { href: "/privacy", label: "Privacy", icon: Shield },
  { href: "/terms", label: "Terms", icon: ScrollText },
  { href: "/contact", label: "Contact", icon: Mail },
  { href: "/sitemap", label: "Sitemap", icon: Menu }
];

export function AppShell({
  children,
  clockReference,
  hiddenClockPages = [],
  isAdmin = false,
  userEmail,
  profileName
}: {
  children: React.ReactNode;
  clockReference: string;
  hiddenClockPages?: string[] | null;
  isAdmin?: boolean;
  userEmail: string;
  profileName?: string | null;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const primaryNavigation = isAdmin
    ? [...navigation, { href: "/admin", label: "Admin", icon: Shield }]
    : navigation;
  const shouldHideClockStrip = (hiddenClockPages ?? []).includes(pathname);

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-[1680px] flex-col gap-5 px-4 py-4 sm:px-6">
        <header className="relative z-30 rounded-[2rem] border border-amber-100/70 bg-[rgba(255,252,247,0.86)] px-4 py-4 shadow-[0_24px_70px_-42px_rgba(120,53,15,0.16)] backdrop-blur sm:px-5">
          <div className="flex items-center justify-between gap-4">
            <Logo compact={false} />

            <nav className="hidden min-w-0 flex-1 items-center justify-center gap-2 xl:flex">
              {primaryNavigation.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition",
                      active
                        ? "bg-[linear-gradient(135deg,rgba(254,243,199,0.98),rgba(204,251,241,0.96))] text-stone-950 ring-1 ring-amber-100 shadow-[0_18px_40px_-30px_rgba(217,119,6,0.25)]"
                        : "text-stone-600 hover:bg-white hover:text-stone-950"
                    )}
                    href={item.href}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block">
                <UserAvatarMenu email={userEmail} name={profileName} />
              </div>
              <Button className="xl:hidden" onClick={() => setMobileOpen(true)} size="sm" variant="secondary">
                <Menu className="size-4" />
                Menu
              </Button>
            </div>
          </div>
        </header>

        {mobileOpen ? (
          <>
            <button
              aria-label="Close navigation"
              className="fixed inset-0 z-40 bg-stone-950/18"
              onClick={() => setMobileOpen(false)}
              type="button"
            />
            <div className="fixed inset-y-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm rounded-[2rem] border border-amber-100/80 bg-[rgba(255,253,249,0.98)] p-5 shadow-[0_28px_70px_-30px_rgba(120,53,15,0.24)] xl:hidden">
              <div className="flex items-center justify-between gap-3">
                <Logo compact={false} />
                <Button className="h-10 w-10 px-0" onClick={() => setMobileOpen(false)} size="sm" variant="secondary">
                  <X className="size-4" />
                </Button>
              </div>
              <nav className="mt-6 space-y-2">
                {primaryNavigation.map((item) => {
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
                <Link
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-stone-600 transition hover:bg-white hover:text-stone-950"
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                >
                  <UserRound className="size-4" />
                  Profile
                </Link>
              </nav>
              <div className="mt-6 space-y-2 rounded-[1.5rem] bg-amber-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Important pages</p>
                {companyLinks.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-stone-600 transition hover:bg-white hover:text-stone-950"
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                    >
                      <Icon className="size-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
              <div className="mt-4 sm:hidden">
                <UserAvatarMenu email={userEmail} name={profileName} />
              </div>
            </div>
          </>
        ) : null}

        {shouldHideClockStrip ? null : <WorldClockStrip referenceDate={clockReference} />}

        <main className="min-w-0 flex-1 rounded-[2rem]">{children}</main>

        <footer className="rounded-[2rem] border border-amber-100/70 bg-[rgba(255,252,247,0.86)] px-5 py-5 shadow-[0_24px_70px_-42px_rgba(120,53,15,0.12)] backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-stone-950">LifeOS</p>
              <p className="mt-1 text-sm text-stone-500">Version {APP_VERSION}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {companyLinks.map((item) => (
                <Link
                  key={item.href}
                  className="rounded-2xl px-3 py-2 text-sm font-semibold text-stone-600 transition hover:bg-white hover:text-stone-950"
                  href={item.href}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

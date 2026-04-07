"use client";

import { useEffect, useState } from "react";

import {
  CircleDollarSign,
  Clock3,
  Focus,
  LayoutDashboard,
  Mail,
  Menu,
  NotebookPen,
  PanelLeft,
  PanelLeftClose,
  ScrollText,
  Shield,
  TimerReset,
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
  { href: "/focus", label: "Focus Mode", icon: Focus }
];

const companyLinks = [
  { href: "/about", label: "About", icon: LayoutDashboard },
  { href: "/privacy", label: "Privacy", icon: Shield },
  { href: "/terms", label: "Terms and conditions", icon: ScrollText },
  { href: "/contact", label: "Contact us", icon: Mail },
  { href: "/sitemap", label: "Sitemap", icon: Menu }
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("lifeos-sidebar-collapsed");
    setSidebarCollapsed(saved === "true");
  }, []);

  useEffect(() => {
    window.localStorage.setItem("lifeos-sidebar-collapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-[1680px] gap-5 px-4 py-4 sm:px-6">
        <aside
          className={cn(
            "hidden shrink-0 rounded-[2rem] border border-amber-100/70 bg-[rgba(255,252,247,0.82)] p-6 shadow-[0_24px_70px_-42px_rgba(120,53,15,0.16)] backdrop-blur xl:flex xl:flex-col",
            sidebarCollapsed ? "w-[102px]" : "w-[296px]"
          )}
        >
          <div className="flex-1 space-y-8">
            <div className={cn("flex items-center", sidebarCollapsed ? "justify-center" : "justify-between gap-3")}>
              <Logo compact={sidebarCollapsed} />
              <Button
                aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                className={cn("shrink-0", sidebarCollapsed ? "hidden" : "inline-flex")}
                onClick={() => setSidebarCollapsed((current) => !current)}
                size="sm"
                variant="secondary"
              >
                <PanelLeftClose className="size-4" />
                Collapse
              </Button>
            </div>
            {sidebarCollapsed ? (
              <div className="flex justify-center">
                <Button
                  aria-label="Expand sidebar"
                  className="h-10 w-10 px-0"
                  onClick={() => setSidebarCollapsed(false)}
                  size="sm"
                  variant="secondary"
                >
                  <PanelLeft className="size-4" />
                </Button>
              </div>
            ) : null}
            <nav className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    className={cn(
                      "flex items-center rounded-2xl px-4 py-3 text-sm font-semibold transition",
                      sidebarCollapsed ? "justify-center" : "gap-3",
                      active
                        ? "bg-[linear-gradient(135deg,rgba(254,243,199,0.98),rgba(204,251,241,0.96))] text-stone-950 ring-1 ring-amber-100 shadow-[0_18px_40px_-30px_rgba(217,119,6,0.25)]"
                        : "text-stone-600 hover:bg-white/90 hover:text-stone-950"
                    )}
                    href={item.href}
                  >
                    <Icon className="size-4" />
                    {sidebarCollapsed ? null : item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="space-y-4 rounded-[1.75rem] border border-amber-100/70 bg-white/72 px-4 py-5">
            {sidebarCollapsed ? (
              <div className="space-y-2">
                {companyLinks.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      aria-label={item.label}
                      className="flex items-center justify-center rounded-2xl px-3 py-3 text-stone-500 transition hover:bg-white hover:text-stone-950"
                      href={item.href}
                    >
                      <Icon className="size-4" />
                    </Link>
                  );
                })}
              </div>
            ) : (
              <>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Signed in</p>
                  <p className="mt-2 text-sm font-semibold text-stone-950">{userEmail}</p>
                </div>
                <div className="space-y-2 rounded-[1.5rem] bg-amber-50 px-3 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                    Important pages
                  </p>
                  <div className="space-y-1">
                    {companyLinks.map((item) => {
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.href}
                          className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-stone-600 transition hover:bg-white hover:text-stone-950"
                          href={item.href}
                        >
                          <Icon className="size-4" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
                <div className="rounded-2xl bg-white/88 px-3 py-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Version</p>
                  <p className="mt-1 text-sm font-semibold text-stone-950">v{APP_VERSION}</p>
                </div>
              </>
            )}
            <UserAvatarMenu compact={sidebarCollapsed} email={userEmail} name={profileName} />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {mobileOpen ? (
            <>
              <button
                aria-label="Close navigation"
                className="fixed inset-0 z-40 bg-stone-950/18 xl:hidden"
                onClick={() => setMobileOpen(false)}
                type="button"
              />
              <div className="fixed inset-y-4 left-4 z-50 w-[calc(100vw-2rem)] max-w-sm rounded-[2rem] border border-amber-100/80 bg-[rgba(255,253,249,0.97)] p-5 shadow-[0_28px_70px_-30px_rgba(120,53,15,0.24)] xl:hidden">
                <div className="flex items-center justify-between gap-3">
                  <Logo compact={false} />
                  <Button className="h-10 w-10 px-0" onClick={() => setMobileOpen(false)} size="sm" variant="secondary">
                    <X className="size-4" />
                  </Button>
                </div>
                <nav className="mt-6 space-y-2">
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
                <div className="mt-6 space-y-2 rounded-[1.5rem] bg-amber-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                    Important pages
                  </p>
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
                <div className="mt-4 rounded-2xl bg-white/88 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Version</p>
                  <p className="mt-1 text-sm font-semibold text-stone-950">v{APP_VERSION}</p>
                </div>
                <div className="mt-4">
                  <UserAvatarMenu email={userEmail} name={profileName} />
                </div>
              </div>
            </>
          ) : null}

          <div className="xl:hidden">
            <Button onClick={() => setMobileOpen(true)} size="sm" variant="secondary">
              <Menu className="size-4" />
              Menu
            </Button>
          </div>
          <WorldClockStrip />
          <main className="min-w-0 flex-1 rounded-[2rem]">{children}</main>
        </div>
      </div>
    </div>
  );
}

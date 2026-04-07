"use client";

import { useMemo, useState, useTransition } from "react";

import {
  CircleDollarSign,
  Clock3,
  Focus,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Menu,
  NotebookPen,
  TimerReset,
  X
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { WorldClockStrip } from "@/components/world-clock-strip";
import { APP_VERSION } from "@/lib/constants";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
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
  userEmail
}: {
  children: React.ReactNode;
  userEmail: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [isPending, startTransition] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);

  const logout = () => {
    startTransition(async () => {
      const { error } = await supabase.auth.signOut();

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("You have been signed out.");
      router.replace("/login");
      router.refresh();
    });
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-[1680px] gap-5 px-4 py-4 sm:px-6">
        <aside className="hidden w-[296px] shrink-0 rounded-[2rem] border border-white/85 bg-white/78 p-6 shadow-[0_20px_70px_-40px_rgba(15,23,42,0.28)] backdrop-blur xl:flex xl:flex-col">
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
                        ? "bg-[linear-gradient(135deg,rgba(207,250,254,0.95),rgba(220,252,231,0.95))] text-slate-950 ring-1 ring-teal-100 shadow-[0_18px_40px_-30px_rgba(13,148,136,0.6)]"
                        : "text-slate-700 hover:bg-white/80 hover:text-slate-950"
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

          <div className="space-y-4 rounded-[1.75rem] border border-white/80 bg-white/75 px-4 py-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">Signed in</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{userEmail}</p>
            </div>
            <div className="rounded-2xl bg-slate-950/5 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Version
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">v{APP_VERSION}</p>
            </div>
            <Button className="w-full" disabled={isPending} onClick={logout} variant="secondary">
              {isPending ? <LoaderCircle className="size-4 animate-spin" /> : <LogOut className="size-4" />}
              Logout
            </Button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex items-center justify-between rounded-[1.75rem] border border-white/80 bg-white/80 px-4 py-3 shadow-sm backdrop-blur xl:hidden">
            <Logo compact />
            <Button onClick={() => setMobileOpen((current) => !current)} size="sm" variant="secondary">
              {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </Button>
          </div>

          {mobileOpen ? (
            <div className="rounded-[1.75rem] border border-white/80 bg-white/90 p-4 shadow-sm xl:hidden">
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
                          ? "bg-[linear-gradient(135deg,rgba(207,250,254,0.95),rgba(220,252,231,0.95))] text-slate-950 ring-1 ring-teal-100"
                          : "text-slate-700 hover:bg-white hover:text-slate-950"
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
              <div className="mt-4 rounded-2xl bg-slate-950/5 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Version
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">v{APP_VERSION}</p>
              </div>
              <Button className="mt-4 w-full" disabled={isPending} onClick={logout} variant="secondary">
                {isPending ? <LoaderCircle className="size-4 animate-spin" /> : <LogOut className="size-4" />}
                Logout
              </Button>
            </div>
          ) : null}

          <WorldClockStrip />
          <main className="min-w-0 flex-1 rounded-[2rem]">{children}</main>
        </div>
      </div>
    </div>
  );
}

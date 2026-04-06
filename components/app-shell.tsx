"use client";

import { useMemo, useState, useTransition } from "react";

import {
  Clock3,
  Focus,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Menu,
  NotebookPen,
  X
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: Clock3 },
  { href: "/notes", label: "Notes", icon: NotebookPen },
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.12),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(251,191,36,0.10),_transparent_28%),linear-gradient(180deg,_#f8fafc,_#eef6f4_40%,_#f8fafc)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1680px] gap-6 px-4 py-4 sm:px-6">
        <aside className="hidden w-[300px] shrink-0 rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_20px_80px_-40px_rgba(15,23,42,0.3)] backdrop-blur xl:flex xl:flex-col">
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
                        ? "bg-slate-950 text-white shadow-lg shadow-slate-950/10"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
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

          <div className="space-y-4 rounded-[1.75rem] border border-slate-200 bg-slate-50 px-4 py-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">Signed in</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{userEmail}</p>
            </div>
            <Button className="w-full" disabled={isPending} onClick={logout} variant="secondary">
              {isPending ? <LoaderCircle className="size-4 animate-spin" /> : <LogOut className="size-4" />}
              Logout
            </Button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex items-center justify-between rounded-[1.75rem] border border-white/70 bg-white/85 px-4 py-3 shadow-sm backdrop-blur xl:hidden">
            <Logo compact />
            <Button onClick={() => setMobileOpen((current) => !current)} size="sm" variant="secondary">
              {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </Button>
          </div>

          {mobileOpen ? (
            <div className="rounded-[1.75rem] border border-white/70 bg-white/95 p-4 shadow-sm xl:hidden">
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
                          ? "bg-slate-950 text-white"
                          : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
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
              <Button className="mt-4 w-full" disabled={isPending} onClick={logout} variant="secondary">
                {isPending ? <LoaderCircle className="size-4 animate-spin" /> : <LogOut className="size-4" />}
                Logout
              </Button>
            </div>
          ) : null}

          <main className="min-w-0 flex-1 rounded-[2rem]">{children}</main>
        </div>
      </div>
    </div>
  );
}

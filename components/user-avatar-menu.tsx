"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import { ChevronDown, LoaderCircle, LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ThemeToggle } from "@/components/theme-toggle";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type UserAvatarMenuProps = {
  name?: string | null;
  email: string;
};

function getInitials(name?: string | null, email?: string) {
  const source = name?.trim() || email || "LO";

  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function UserAvatarMenu({ name, email }: UserAvatarMenuProps) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const initials = getInitials(name, email);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);

    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, []);

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
    <div className="relative" ref={containerRef}>
      <button
        className="flex w-full items-center justify-between gap-3 rounded-[1.35rem] bg-white/85 px-3 py-3 text-left shadow-[0_16px_32px_-26px_rgba(15,23,42,0.35)] transition hover:bg-white dark:bg-slate-900/90 dark:hover:bg-slate-900"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f766e,#14b8a6)] text-sm font-bold text-white shadow-[0_14px_28px_-16px_rgba(20,184,166,0.75)]">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{name || "LifeOS member"}</p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{email}</p>
          </div>
        </div>
        <ChevronDown className={`size-4 text-slate-500 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div className="absolute bottom-[calc(100%+12px)] left-0 z-40 w-full rounded-[1.5rem] border border-white/85 bg-white/96 p-3 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.28)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/96">
          <div className="space-y-2">
            <Link
              className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
              href="/profile"
              onClick={() => setOpen(false)}
            >
              <UserRound className="size-4" />
              Profile
            </Link>
            <div className="px-3 py-1">
              <ThemeToggle />
            </div>
            <button
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 dark:hover:bg-rose-950/30"
              onClick={logout}
              type="button"
            >
              {isPending ? <LoaderCircle className="size-4 animate-spin" /> : <LogOut className="size-4" />}
              Sign out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

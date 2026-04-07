"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import { ChevronDown, LoaderCircle, LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
        className="flex w-full items-center justify-between gap-3 rounded-[1.35rem] bg-white/88 px-3 py-3 text-left shadow-[0_16px_32px_-26px_rgba(120,53,15,0.18)] transition hover:bg-white"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f59e0b,#2dd4bf)] text-sm font-bold text-stone-950 shadow-[0_14px_28px_-16px_rgba(217,119,6,0.35)]">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-stone-950">{name || "LifeOS member"}</p>
            <p className="truncate text-xs text-stone-500">{email}</p>
          </div>
        </div>
        <ChevronDown className={`size-4 text-stone-500 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div className="absolute bottom-[calc(100%+12px)] left-0 z-40 w-full rounded-[1.5rem] border border-amber-100/80 bg-[rgba(255,253,249,0.96)] p-3 shadow-[0_24px_60px_-30px_rgba(120,53,15,0.18)] backdrop-blur">
          <div className="space-y-2">
            <Link
              className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-stone-700 transition hover:bg-amber-50 hover:text-stone-950"
              href="/profile"
              onClick={() => setOpen(false)}
            >
              <UserRound className="size-4" />
              Profile
            </Link>
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

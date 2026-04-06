"use client";

import { useMemo, useState, useTransition } from "react";

import { LoaderCircle, Lock, Mail } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { authSchema } from "@/lib/validation";

type AuthMode = "signin" | "signup";

export function AuthPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get("redirectedFrom");
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsed = authSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your credentials and try again.");
      return;
    }

    startTransition(async () => {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword(parsed.data);

        if (error) {
          toast.error(error.message);
          return;
        }

        toast.success("Welcome back.");
        router.replace(redirectedFrom || "/");
        router.refresh();
        return;
      }

      const { data, error } = await supabase.auth.signUp(parsed.data);

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data.session) {
        toast.success("Account created.");
        router.replace("/");
        router.refresh();
        return;
      }

      toast.success("Account created. Check your inbox to confirm your email if confirmation is enabled.");
      setMode("signin");
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_460px] lg:items-center">
      <div className="space-y-5">
        <Logo />
        <div className="space-y-3">
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Plan, capture, and focus in one place.
          </h1>
          <p className="max-w-xl text-lg text-slate-700">
            Sign in to manage tasks, notes, and your daily focus without the clutter.
          </p>
        </div>
      </div>

      <Card className="border-white/80 bg-white/95 p-7 sm:p-8">
        <div className="space-y-6">
          <div className="inline-flex rounded-full bg-slate-100 p-1">
            <button
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                mode === "signin" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"
              }`}
              onClick={() => setMode("signin")}
              type="button"
            >
              Sign in
            </button>
            <button
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                mode === "signup" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"
              }`}
              onClick={() => setMode("signup")}
              type="button"
            >
              Create account
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-800" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  className="pl-11"
                  id="email"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="founder@lifeos.app"
                  type="email"
                  value={email}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-800" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  className="pl-11"
                  id="password"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  type="password"
                  value={password}
                />
              </div>
            </div>

            <Button className="w-full" disabled={isPending} size="lg" type="submit">
              {isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
              {mode === "signin" ? "Sign in to LifeOS" : "Create your account"}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

import { LoaderCircle, Lock, Mail, MapPin, ShieldCheck, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { authSchema, passwordResetSchema, signupSchema } from "@/lib/validation";

type AuthVariant = "signin" | "signup" | "forgot-password" | "reset-password";

function getPasswordStrength(password: string) {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return { label: "Weak", width: "25%", tone: "bg-rose-500" };
  if (score === 2) return { label: "Fair", width: "50%", tone: "bg-amber-500" };
  if (score === 3) return { label: "Good", width: "75%", tone: "bg-teal-500" };
  return { label: "Strong", width: "100%", tone: "bg-emerald-500" };
}

async function fetchLocationSnapshot() {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const response = await fetch("/api/location", { method: "GET" }).catch(() => null);
  const payload = response && response.ok ? ((await response.json()) as { country_code?: string | null }) : null;

  return {
    timezone,
    country_code: payload?.country_code ?? null
  };
}

export function AuthPanel({ variant }: { variant: AuthVariant }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get("redirectedFrom");
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (variant !== "reset-password") {
      return;
    }

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        toast.success("Recovery session confirmed. Choose a new password.");
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, variant]);

  const passwordStrength = getPasswordStrength(password);

  const syncProfileLocation = async () => {
    const snapshot = await fetchLocationSnapshot();

    await fetch("/api/profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        full_name: name.trim(),
        timezone: snapshot.timezone,
        country_code: snapshot.country_code
      })
    }).catch(() => null);
  };

  const handleSignin = () => {
    const parsed = authSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your credentials and try again.");
      return;
    }

    startTransition(async () => {
      const { error } = await supabase.auth.signInWithPassword(parsed.data);

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Welcome back.");
      router.replace(redirectedFrom || "/");
      router.refresh();
    });
  };

  const handleSignup = () => {
    const parsed = signupSchema.safeParse({ name, email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your details and try again.");
      return;
    }

    startTransition(async () => {
      const snapshot = await fetchLocationSnapshot();
      const { data, error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          data: {
            full_name: parsed.data.name,
            timezone: snapshot.timezone,
            country_code: snapshot.country_code
          }
        }
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data.session) {
        await syncProfileLocation();
        toast.success("Account created.");
        router.replace("/");
        router.refresh();
        return;
      }

      toast.success("Account created. Check your email to confirm your account.");
      router.replace("/login");
      router.refresh();
    });
  };

  const handleForgotPassword = () => {
    const parsed = authSchema.pick({ email: true }).safeParse({ email });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Enter a valid email address.");
      return;
    }

    startTransition(async () => {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
        redirectTo
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      setEmailSent(true);
      toast.success("Reset instructions sent.");
    });
  };

  const handleResetPassword = () => {
    const parsed = passwordResetSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your password and try again.");
      return;
    }

    startTransition(async () => {
      const { error } = await supabase.auth.updateUser({
        password: parsed.data.password
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Password updated.");
      router.replace("/");
      router.refresh();
    });
  };

  const heroCopy: Record<AuthVariant, { eyebrow: string; title: string; body: string }> = {
    signin: {
      eyebrow: "Secure sign in",
      title: "Run your day from one calm workspace.",
      body: "Tasks, notes, focus, and time tools with a cleaner account experience."
    },
    signup: {
      eyebrow: "Create account",
      title: "Start LifeOS with a strong foundation.",
      body: "Set your name, secure your password, and personalize your workspace from day one."
    },
    "forgot-password": {
      eyebrow: "Password reset",
      title: "Get back in without friction.",
      body: "We will send a secure reset link so you can choose a fresh password."
    },
    "reset-password": {
      eyebrow: "Choose a new password",
      title: "Protect the account behind your work.",
      body: "Use a strong password so your workspace stays secure and easy to trust."
    }
  };

  const content = heroCopy[variant];

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_500px] lg:items-center">
      <section className="space-y-6 rounded-[2.25rem] bg-[linear-gradient(135deg,rgba(15,23,42,0.94),rgba(15,118,110,0.92),rgba(8,47,73,0.94))] px-7 py-8 text-white shadow-[0_30px_90px_-42px_rgba(15,23,42,0.45)] sm:px-9">
        <div className="flex items-center justify-between gap-4">
          <Logo />
          <ThemeToggle compact />
        </div>
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">{content.eyebrow}</p>
          <h1 className="max-w-xl text-4xl font-bold tracking-tight sm:text-5xl">{content.title}</h1>
          <p className="max-w-xl text-base leading-7 text-slate-100">{content.body}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1.5rem] bg-white/10 p-4">
            <ShieldCheck className="size-5 text-cyan-200" />
            <p className="mt-3 text-sm font-semibold">Secure auth</p>
            <p className="mt-1 text-sm text-slate-200">Email auth, password reset, and session persistence.</p>
          </div>
          <div className="rounded-[1.5rem] bg-white/10 p-4">
            <UserRound className="size-5 text-cyan-200" />
            <p className="mt-3 text-sm font-semibold">Profile ready</p>
            <p className="mt-1 text-sm text-slate-200">Name, timezone, joined date, and account settings.</p>
          </div>
          <div className="rounded-[1.5rem] bg-white/10 p-4">
            <MapPin className="size-5 text-cyan-200" />
            <p className="mt-3 text-sm font-semibold">Location aware</p>
            <p className="mt-1 text-sm text-slate-200">Timezone and country only. No raw IP stored.</p>
          </div>
        </div>
      </section>

      <Card className="border-white/80 bg-white/94 p-7 shadow-[0_26px_70px_-36px_rgba(15,23,42,0.22)] dark:border-slate-800 dark:bg-slate-950/92 sm:p-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-950 dark:text-slate-100">
              {variant === "signin" && "Welcome back"}
              {variant === "signup" && "Create your account"}
              {variant === "forgot-password" && "Forgot password"}
              {variant === "reset-password" && "Reset password"}
            </h2>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
              {variant === "signin" && "Sign in to continue into your dashboard."}
              {variant === "signup" && "Use a strong password and set your display name."}
              {variant === "forgot-password" && "Enter your email and we will send reset instructions."}
              {variant === "reset-password" && "Enter a new password for your account."}
            </p>
          </div>

          {variant === "signin" ? (
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                handleSignin();
              }}
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800 dark:text-slate-200" htmlFor="email">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <Input className="pl-11" id="email" onChange={(event) => setEmail(event.target.value)} type="email" value={email} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800 dark:text-slate-200" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <Input className="pl-11" id="password" onChange={(event) => setPassword(event.target.value)} type="password" value={password} />
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <Link className="font-semibold text-teal-700 hover:text-teal-600 dark:text-teal-300" href="/forgot-password">
                  Forgot password?
                </Link>
                <Link className="font-semibold text-slate-700 hover:text-slate-950 dark:text-slate-200" href="/signup">
                  Create account
                </Link>
              </div>
              <Button className="w-full" disabled={isPending} size="lg" type="submit">
                {isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
                Sign in to LifeOS
              </Button>
            </form>
          ) : null}

          {variant === "signup" ? (
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                handleSignup();
              }}
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800 dark:text-slate-200" htmlFor="name">
                  Name
                </label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <Input className="pl-11" id="name" onChange={(event) => setName(event.target.value)} value={name} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800 dark:text-slate-200" htmlFor="signup-email">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <Input className="pl-11" id="signup-email" onChange={(event) => setEmail(event.target.value)} type="email" value={email} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800 dark:text-slate-200" htmlFor="signup-password">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <Input className="pl-11" id="signup-password" onChange={(event) => setPassword(event.target.value)} type="password" value={password} />
                </div>
                <div className="space-y-2 rounded-[1.25rem] bg-slate-50 px-4 py-3 dark:bg-slate-900">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Password strength</p>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{passwordStrength.label}</p>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                    <div className={`h-full rounded-full ${passwordStrength.tone}`} style={{ width: passwordStrength.width }} />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <Link className="font-semibold text-slate-700 hover:text-slate-950 dark:text-slate-200" href="/login">
                  Already have an account?
                </Link>
              </div>
              <Button className="w-full" disabled={isPending} size="lg" type="submit">
                {isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
                Create account
              </Button>
            </form>
          ) : null}

          {variant === "forgot-password" ? (
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                handleForgotPassword();
              }}
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800 dark:text-slate-200" htmlFor="forgot-email">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <Input className="pl-11" id="forgot-email" onChange={(event) => setEmail(event.target.value)} type="email" value={email} />
                </div>
              </div>
              {emailSent ? (
                <div className="rounded-[1.25rem] bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                  Reset instructions sent. Check your inbox and then return to update the password.
                </div>
              ) : null}
              <div className="flex items-center justify-between gap-4 text-sm">
                <Link className="font-semibold text-slate-700 hover:text-slate-950 dark:text-slate-200" href="/login">
                  Back to sign in
                </Link>
              </div>
              <Button className="w-full" disabled={isPending} size="lg" type="submit">
                {isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
                Send reset link
              </Button>
            </form>
          ) : null}

          {variant === "reset-password" ? (
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                handleResetPassword();
              }}
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800 dark:text-slate-200" htmlFor="reset-password">
                  New password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <Input className="pl-11" id="reset-password" onChange={(event) => setPassword(event.target.value)} type="password" value={password} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800 dark:text-slate-200" htmlFor="confirm-password">
                  Confirm password
                </label>
                <Input id="confirm-password" onChange={(event) => setConfirmPassword(event.target.value)} type="password" value={confirmPassword} />
              </div>
              <Button className="w-full" disabled={isPending} size="lg" type="submit">
                {isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
                Update password
              </Button>
            </form>
          ) : null}
        </div>
      </Card>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

import {
  CheckCircle2,
  Eye,
  EyeOff,
  LayoutDashboard,
  LoaderCircle,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Logo } from "@/components/logo";
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
  const contentType = response?.headers.get("content-type") ?? "";
  const payload =
    response && response.ok && contentType.includes("application/json")
      ? (((await response.json().catch(() => null)) as { country_code?: string | null } | null) ?? null)
      : null;

  return {
    timezone,
    country_code: payload?.country_code ?? null
  };
}

const heroCopy: Record<AuthVariant, { eyebrow: string; title: string; body: string }> = {
  signin: {
    eyebrow: "LifeOS workspace",
    title: "One calm place for planning, focus, and daily clarity.",
    body: "Bring tasks, notes, time tools, and routines into one workspace that stays fast and easy to scan."
  },
  signup: {
    eyebrow: "Create account",
    title: "Start with a clean system that helps you move faster.",
    body: "Set up your account and keep planning, notes, and focus work in one organized flow."
  },
  "forgot-password": {
    eyebrow: "Password reset",
    title: "Get back into your workspace without friction.",
    body: "Enter your email and we will send a secure reset link so you can continue where you left off."
  },
  "reset-password": {
    eyebrow: "Choose a new password",
    title: "Secure the workspace behind your day-to-day work.",
    body: "Use a fresh password so your account stays simple to trust and easy to protect."
  }
};

const formCopy: Record<AuthVariant, { title: string; body: string }> = {
  signin: {
    title: "Welcome back",
    body: "Sign in to open your dashboard."
  },
  signup: {
    title: "Create your account",
    body: "Use your name, email, and a strong password."
  },
  "forgot-password": {
    title: "Forgot password",
    body: "We will email a secure reset link."
  },
  "reset-password": {
    title: "Reset password",
    body: "Choose a new password for your account."
  }
};

const heroPoints = [
  "See tasks, notes, and time at a glance",
  "Open fast and keep the UI distraction-light",
  "Stay organized without switching tools"
];

export function AuthPanel({ variant }: { variant: AuthVariant }) {
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get("redirectedFrom");
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

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

  const navigateAfterAuth = (href: string) => {
    window.location.assign(href);
  };

  const syncProfileLocation = async () => {
    const snapshot = await fetchLocationSnapshot();

    const response = await fetch("/api/profile", {
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

    return response?.ok ?? false;
  };

  const raiseError = (message: string) => {
    setAuthError(message);
    toast.error(message);
  };

  const clearError = () => {
    if (authError) {
      setAuthError(null);
    }
  };

  const handleSignin = () => {
    const parsed = authSchema.safeParse({ email, password });
    if (!parsed.success) {
      raiseError(parsed.error.issues[0]?.message ?? "Check your credentials and try again.");
      return;
    }

    clearError();

    startTransition(async () => {
      const { error } = await supabase.auth.signInWithPassword(parsed.data);

      if (error) {
        raiseError(error.message);
        return;
      }

      toast.success("Welcome back.");
      navigateAfterAuth(redirectedFrom || "/");
    });
  };

  const handleGoogleSignin = () => {
    clearError();

    startTransition(async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}${redirectedFrom || "/"}`
        }
      });

      if (error) {
        raiseError(error.message);
      }
    });
  };

  const handleSignup = () => {
    const parsed = signupSchema.safeParse({ name, email, password });
    if (!parsed.success) {
      raiseError(parsed.error.issues[0]?.message ?? "Check your details and try again.");
      return;
    }

    clearError();

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
        raiseError(error.message);
        return;
      }

      if (data.session) {
        await syncProfileLocation();
        toast.success("Account created.");
        navigateAfterAuth("/");
        return;
      }

      toast.success("Account created. Check your email to confirm your account.");
      navigateAfterAuth("/login");
    });
  };

  const handleForgotPassword = () => {
    const parsed = authSchema.pick({ email: true }).safeParse({ email });
    if (!parsed.success) {
      raiseError(parsed.error.issues[0]?.message ?? "Enter a valid email address.");
      return;
    }

    clearError();

    startTransition(async () => {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
        redirectTo
      });

      if (error) {
        raiseError(error.message);
        return;
      }

      setEmailSent(true);
      toast.success("Reset instructions sent.");
    });
  };

  const handleResetPassword = () => {
    const parsed = passwordResetSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      raiseError(parsed.error.issues[0]?.message ?? "Check your password and try again.");
      return;
    }

    clearError();

    startTransition(async () => {
      const { error } = await supabase.auth.updateUser({
        password: parsed.data.password
      });

      if (error) {
        raiseError(error.message);
        return;
      }

      toast.success("Password updated.");
      navigateAfterAuth("/");
    });
  };

  const hero = heroCopy[variant];
  const form = formCopy[variant];
  const showGoogleSignin = variant === "signin";

  return (
    <div className="grid min-h-[720px] gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(420px,0.85fr)]">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-[linear-gradient(180deg,rgba(255,252,247,0.95),rgba(247,244,238,0.92))] p-7 shadow-[0_28px_90px_-50px_rgba(28,25,23,0.24)] sm:p-9 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(18,18,18,0.94),rgba(28,28,28,0.96))]">
        <div className="absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.16),transparent_46%),radial-gradient(circle_at_top_right,rgba(217,119,6,0.18),transparent_42%)]" />
        <div className="relative flex h-full flex-col justify-between gap-8">
          <div className="space-y-8">
            <Logo />
            <div className="max-w-xl space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700 dark:text-teal-300">
                {hero.eyebrow}
              </p>
              <h1 className="text-4xl font-bold tracking-tight text-stone-950 sm:text-5xl dark:text-white">
                {hero.title}
              </h1>
              <p className="max-w-lg text-base leading-7 text-stone-600 dark:text-stone-300">{hero.body}</p>
            </div>
            <div className="grid gap-3 sm:max-w-xl">
              {heroPoints.map((point) => (
                <div
                  key={point}
                  className="flex items-center gap-3 rounded-[1.1rem] bg-white/72 px-4 py-3 text-sm text-stone-700 shadow-[0_14px_30px_-24px_rgba(28,25,23,0.2)] ring-1 ring-stone-200/60 dark:bg-white/5 dark:text-stone-200 dark:ring-white/10"
                >
                  <CheckCircle2 className="size-4 shrink-0 text-teal-600 dark:text-teal-300" />
                  {point}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_220px]">
            <div className="rounded-[1.8rem] border border-stone-200/70 bg-white/82 p-5 shadow-[0_18px_40px_-28px_rgba(28,25,23,0.22)] dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-3 py-1 text-xs font-semibold text-white dark:bg-white dark:text-stone-950">
                  <Sparkles className="size-3.5" />
                  Control center
                </div>
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.2rem] bg-stone-950 p-4 text-white dark:bg-stone-900">
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Tasks today</p>
                  <p className="mt-3 text-3xl font-bold">4</p>
                  <p className="mt-1 text-sm text-stone-300">2 in focus</p>
                </div>
                <div className="rounded-[1.2rem] bg-amber-50 p-4 text-stone-900 dark:bg-white/10 dark:text-white">
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-500 dark:text-stone-300">Notes</p>
                  <p className="mt-3 text-3xl font-bold">12</p>
                  <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">Fresh context</p>
                </div>
                <div className="rounded-[1.2rem] bg-teal-50 p-4 text-stone-900 dark:bg-teal-500/10 dark:text-white">
                  <p className="text-xs uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">Focus</p>
                  <p className="mt-3 text-3xl font-bold">75m</p>
                  <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">Deep work</p>
                </div>
              </div>
              <div className="mt-4 rounded-[1.2rem] border border-stone-200/80 bg-stone-50 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="inline-flex size-10 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-stone-200 dark:bg-stone-900 dark:ring-white/10">
                    <LayoutDashboard className="size-5 text-stone-900 dark:text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stone-950 dark:text-white">Minimal workspace</p>
                    <p className="text-sm text-stone-600 dark:text-stone-300">
                      Everything important stays readable, calm, and one click away.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-stone-200/70 bg-stone-950 p-5 text-white shadow-[0_18px_40px_-28px_rgba(28,25,23,0.28)] dark:border-white/10">
              <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-white/8">
                <ShieldCheck className="size-5 text-teal-300" />
              </div>
              <h2 className="mt-5 text-xl font-bold">Fast to open</h2>
              <p className="mt-2 text-sm leading-6 text-stone-300">
                Clean sign in, fewer distractions, and a dashboard designed to feel instantly usable.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-center">
        <Card className="w-full max-w-[460px] rounded-[2rem] border border-stone-200/80 bg-[rgba(255,255,255,0.9)] p-7 shadow-[0_32px_90px_-50px_rgba(28,25,23,0.24)] sm:p-8 dark:border-white/10 dark:bg-[rgba(20,20,20,0.9)]">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-stone-950 dark:text-white">{form.title}</h2>
              <p className="text-sm leading-6 text-stone-600 dark:text-stone-300">{form.body}</p>
            </div>

            {authError ? (
              <div className="rounded-[1.15rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
                {authError}
              </div>
            ) : null}

            {showGoogleSignin ? (
              <div className="space-y-3">
                <Button className="w-full" disabled={isPending} onClick={handleGoogleSignin} size="lg" type="button" variant="secondary">
                  <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24">
                    <path d="M21.8 12.23c0-.72-.06-1.25-.2-1.8H12v3.39h5.64c-.11.84-.7 2.1-2 2.95l-.02.11 2.73 2.11.19.02c1.79-1.65 2.82-4.08 2.82-6.78Z" fill="#4285F4" />
                    <path d="M12 22c2.76 0 5.07-.91 6.76-2.47l-3.22-2.5c-.86.6-2.02 1.02-3.54 1.02-2.7 0-4.98-1.77-5.8-4.23l-.1.01-2.84 2.19-.03.1A10.22 10.22 0 0 0 12 22Z" fill="#34A853" />
                    <path d="M6.2 13.82A6.13 6.13 0 0 1 5.88 12c0-.63.12-1.24.31-1.82l-.01-.12-2.88-2.23-.09.04A10.19 10.19 0 0 0 2 12c0 1.64.39 3.2 1.08 4.56l3.12-2.74Z" fill="#FBBC05" />
                    <path d="M12 5.95c1.9 0 3.18.82 3.92 1.5l2.86-2.79C17.06 3.08 14.76 2 12 2 8 2 4.53 4.29 3.21 7.87l2.98 2.31C7.02 7.72 9.3 5.95 12 5.95Z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </Button>
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-stone-200 dark:bg-white/10" />
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-stone-400 dark:text-stone-500">or</span>
                  <div className="h-px flex-1 bg-stone-200 dark:bg-white/10" />
                </div>
              </div>
            ) : null}

            {variant === "signin" ? (
              <form
                className="space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  handleSignin();
                }}
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-700 dark:text-stone-200" htmlFor="email">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
                    <Input
                      autoComplete="email"
                      autoFocus
                      className="h-12 rounded-[1.1rem] border-stone-200 bg-stone-50 pl-11 dark:border-white/10 dark:bg-white/5"
                      id="email"
                      onChange={(event) => {
                        clearError();
                        setEmail(event.target.value);
                      }}
                      placeholder="name@company.com"
                      type="email"
                      value={email}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <label className="text-sm font-medium text-stone-700 dark:text-stone-200" htmlFor="password">
                      Password
                    </label>
                    <Link className="text-sm font-semibold text-teal-700 hover:text-teal-600 dark:text-teal-300" href="/forgot-password">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
                    <Input
                      autoComplete="current-password"
                      className="h-12 rounded-[1.1rem] border-stone-200 bg-stone-50 pl-11 pr-12 dark:border-white/10 dark:bg-white/5"
                      id="password"
                      onChange={(event) => {
                        clearError();
                        setPassword(event.target.value);
                      }}
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                    />
                    <button
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-200/70 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-white/10 dark:hover:text-white"
                      onClick={() => setShowPassword((current) => !current)}
                      type="button"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
                <Button className="h-12 w-full rounded-[1.1rem]" disabled={isPending} size="lg" type="submit">
                  {isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
                  Sign in
                </Button>
                <p className="text-center text-sm text-stone-600 dark:text-stone-300">
                  New to LifeOS?{" "}
                  <Link className="font-semibold text-stone-950 hover:text-teal-700 dark:text-white dark:hover:text-teal-300" href="/signup">
                    Create an account
                  </Link>
                </p>
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
                  <label className="text-sm font-medium text-stone-700 dark:text-stone-200" htmlFor="name">
                    Name
                  </label>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
                    <Input className="h-12 rounded-[1.1rem] border-stone-200 bg-stone-50 pl-11 dark:border-white/10 dark:bg-white/5" id="name" onChange={(event) => { clearError(); setName(event.target.value); }} value={name} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-700 dark:text-stone-200" htmlFor="signup-email">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
                    <Input className="h-12 rounded-[1.1rem] border-stone-200 bg-stone-50 pl-11 dark:border-white/10 dark:bg-white/5" id="signup-email" onChange={(event) => { clearError(); setEmail(event.target.value); }} type="email" value={email} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-700 dark:text-stone-200" htmlFor="signup-password">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
                    <Input className="h-12 rounded-[1.1rem] border-stone-200 bg-stone-50 pl-11 pr-12 dark:border-white/10 dark:bg-white/5" id="signup-password" onChange={(event) => { clearError(); setPassword(event.target.value); }} type={showPassword ? "text" : "password"} value={password} />
                    <button
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-200/70 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-white/10 dark:hover:text-white"
                      onClick={() => setShowPassword((current) => !current)}
                      type="button"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  <div className="space-y-2 rounded-[1.1rem] bg-stone-50 px-4 py-3 ring-1 ring-stone-200/80 dark:bg-white/5 dark:ring-white/10">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-medium text-stone-700 dark:text-stone-200">Password strength</p>
                      <p className="text-sm font-semibold text-stone-600 dark:text-stone-300">{passwordStrength.label}</p>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-stone-200 dark:bg-white/10">
                      <div className={`h-full rounded-full ${passwordStrength.tone}`} style={{ width: passwordStrength.width }} />
                    </div>
                  </div>
                </div>
                <Button className="h-12 w-full rounded-[1.1rem]" disabled={isPending} size="lg" type="submit">
                  {isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
                  Create account
                </Button>
                <p className="text-center text-sm text-stone-600 dark:text-stone-300">
                  Already have an account?{" "}
                  <Link className="font-semibold text-stone-950 hover:text-teal-700 dark:text-white dark:hover:text-teal-300" href="/login">
                    Sign in
                  </Link>
                </p>
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
                  <label className="text-sm font-medium text-stone-700 dark:text-stone-200" htmlFor="forgot-email">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
                    <Input className="h-12 rounded-[1.1rem] border-stone-200 bg-stone-50 pl-11 dark:border-white/10 dark:bg-white/5" id="forgot-email" onChange={(event) => { clearError(); setEmail(event.target.value); }} type="email" value={email} />
                  </div>
                </div>
                {emailSent ? (
                  <div className="rounded-[1.1rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                    Reset instructions sent. Check your inbox and then return to update the password.
                  </div>
                ) : null}
                <Button className="h-12 w-full rounded-[1.1rem]" disabled={isPending} size="lg" type="submit">
                  {isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
                  Send reset link
                </Button>
                <p className="text-center text-sm text-stone-600 dark:text-stone-300">
                  <Link className="font-semibold text-stone-950 hover:text-teal-700 dark:text-white dark:hover:text-teal-300" href="/login">
                    Back to sign in
                  </Link>
                </p>
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
                  <label className="text-sm font-medium text-stone-700 dark:text-stone-200" htmlFor="reset-password">
                    New password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
                    <Input className="h-12 rounded-[1.1rem] border-stone-200 bg-stone-50 pl-11 pr-12 dark:border-white/10 dark:bg-white/5" id="reset-password" onChange={(event) => { clearError(); setPassword(event.target.value); }} type={showPassword ? "text" : "password"} value={password} />
                    <button
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-200/70 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-white/10 dark:hover:text-white"
                      onClick={() => setShowPassword((current) => !current)}
                      type="button"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-700 dark:text-stone-200" htmlFor="confirm-password">
                    Confirm password
                  </label>
                  <div className="relative">
                    <Input className="h-12 rounded-[1.1rem] border-stone-200 bg-stone-50 pr-12 dark:border-white/10 dark:bg-white/5" id="confirm-password" onChange={(event) => { clearError(); setConfirmPassword(event.target.value); }} type={showConfirmPassword ? "text" : "password"} value={confirmPassword} />
                    <button
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                      className="absolute right-3 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-200/70 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-white/10 dark:hover:text-white"
                      onClick={() => setShowConfirmPassword((current) => !current)}
                      type="button"
                    >
                      {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
                <Button className="h-12 w-full rounded-[1.1rem]" disabled={isPending} size="lg" type="submit">
                  {isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
                  Update password
                </Button>
              </form>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
}

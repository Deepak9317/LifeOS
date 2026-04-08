"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

import type { User } from "@supabase/supabase-js";
import { Clock3, LoaderCircle, LockKeyhole, MapPinned, Save, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getHiddenClockPagesFromMetadata } from "@/lib/profile-preferences";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { passwordChangeSchema, profileSchema } from "@/lib/validation";
import { formatFullDate } from "@/lib/utils";
import type { Profile } from "@/types";

export function ProfileWorkspace({
  user,
  profile
}: {
  user: User;
  profile: Profile | null;
}) {
  const CLOCK_PAGE_OPTIONS = [
    { value: "/", label: "Dashboard" },
    { value: "/tasks", label: "Tasks" },
    { value: "/notes", label: "Notes" },
    { value: "/time", label: "Time" },
    { value: "/budget", label: "Budget" },
    { value: "/focus", label: "Focus" },
    { value: "/profile", label: "Profile" },
    { value: "/admin", label: "Admin" }
  ] as const;

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [fullName, setFullName] = useState(profile?.full_name ?? user.user_metadata.full_name ?? "");
  const [timezone, setTimezone] = useState(profile?.timezone ?? "");
  const [countryCode, setCountryCode] = useState(profile?.country_code ?? "");
  const [notificationEmail, setNotificationEmail] = useState(profile?.notification_email ?? user.email ?? "");
  const [hiddenClockPages, setHiddenClockPages] = useState<string[]>(
    profile?.hidden_clock_pages ?? getHiddenClockPagesFromMetadata(user)
  );
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPending, startTransition] = useTransition();
  const [passwordPending, startPasswordTransition] = useTransition();

  useEffect(() => {
    if (!timezone) {
      setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    }
  }, [timezone]);

  const joinedDate = formatFullDate(profile?.created_at ?? user.created_at);

  const refreshLocation = async () => {
    const timezoneValue = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const response = await fetch("/api/location");
    const contentType = response.headers.get("content-type") ?? "";
    const payload =
      response.ok && contentType.includes("application/json")
        ? (((await response.json().catch(() => null)) as { country_code?: string | null } | null) ?? null)
        : null;

    setTimezone(timezoneValue);
    setCountryCode(payload?.country_code ?? "");
  };

  const saveProfile = () => {
    const parsed = profileSchema.safeParse({
      full_name: fullName,
      timezone: timezone || null,
      country_code: countryCode || null,
      notification_email: notificationEmail || null,
      hidden_clock_pages: hiddenClockPages
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your profile details.");
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(parsed.data)
      });

      const body = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        toast.error(body?.error ?? "Unable to update profile.");
        return;
      }

      toast.success("Profile updated.");
    });
  };

  const changePassword = () => {
    const parsed = passwordChangeSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your password fields.");
      return;
    }

    startPasswordTransition(async () => {
      const signInResult = await supabase.auth.signInWithPassword({
        email: user.email ?? "",
        password: parsed.data.currentPassword
      });

      if (signInResult.error) {
        toast.error("Current password is incorrect.");
        return;
      }

      const updateResult = await supabase.auth.updateUser({
        password: parsed.data.newPassword
      });

      if (updateResult.error) {
        toast.error(updateResult.error.message);
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed.");
    });
  };

  return (
    <div className="space-y-6 p-1">
      <section className="animate-fade-up rounded-[2rem] bg-[linear-gradient(135deg,rgba(255,252,247,0.98),rgba(254,243,199,0.42),rgba(204,251,241,0.32))] px-6 py-8 shadow-[0_24px_80px_-42px_rgba(120,53,15,0.16)]">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">Profile</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-stone-950">Account settings</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
          Manage your public identity, location details, and password from one secure page.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.85fr)]">
        <Card className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="inline-flex size-12 items-center justify-center rounded-[1.1rem] bg-amber-50 text-amber-700">
              <UserRound className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Identity</p>
              <h2 className="text-2xl font-bold text-stone-950">Profile details</h2>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium text-stone-700">Name</label>
              <Input onChange={(event) => setFullName(event.target.value)} value={fullName} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Email</label>
              <Input disabled value={user.email ?? ""} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Joined</label>
              <Input disabled value={joinedDate} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Timezone</label>
              <Input onChange={(event) => setTimezone(event.target.value)} value={timezone} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Country</label>
              <Input onChange={(event) => setCountryCode(event.target.value.toUpperCase())} value={countryCode} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium text-stone-700">Reminder email</label>
              <Input
                onChange={(event) => setNotificationEmail(event.target.value)}
                placeholder={user.email ?? "name@example.com"}
                type="email"
                value={notificationEmail}
              />
              <p className="text-xs text-stone-500">
                Task reminder emails use this address. Leave it as your signup email or replace it with another inbox.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button disabled={isPending} onClick={saveProfile}>
              {isPending ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
              Save profile
            </Button>
            <Button onClick={() => void refreshLocation()} variant="secondary">
              <MapPinned className="size-4" />
              Refresh location
            </Button>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="inline-flex size-12 items-center justify-center rounded-[1.1rem] bg-amber-50 text-amber-700">
                <Clock3 className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Display</p>
                <h2 className="text-2xl font-bold text-stone-950">Clock strip visibility</h2>
              </div>
            </div>

            <p className="text-sm leading-6 text-stone-600">
              Choose the pages where the top world clock strip should stay hidden.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {CLOCK_PAGE_OPTIONS.map((option) => {
                const checked = hiddenClockPages.includes(option.value);

                return (
                  <label
                    key={option.value}
                    className="flex items-center gap-3 rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800"
                  >
                    <input
                      checked={checked}
                      className="size-4 rounded border-slate-300 text-teal-500 focus:ring-teal-500"
                      onChange={(event) => {
                        setHiddenClockPages((current) =>
                          event.target.checked
                            ? [...current, option.value]
                            : current.filter((value) => value !== option.value)
                        );
                      }}
                      type="checkbox"
                    />
                    Hide on {option.label}
                  </label>
                );
              })}
            </div>
          </Card>

          <Card className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="inline-flex size-12 items-center justify-center rounded-[1.1rem] bg-amber-50 text-amber-700">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Account</p>
                <h2 className="text-2xl font-bold text-stone-950">Overview</h2>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-[1.4rem] bg-amber-50/70 px-4 py-4">
                <p className="text-sm font-semibold text-stone-900">Email</p>
                <p className="mt-1 text-sm text-stone-600">{user.email}</p>
              </div>
              <div className="rounded-[1.4rem] bg-amber-50/70 px-4 py-4">
                <p className="text-sm font-semibold text-stone-900">Timezone</p>
                <p className="mt-1 text-sm text-stone-600">{timezone || "Unknown"}</p>
              </div>
              <div className="rounded-[1.4rem] bg-amber-50/70 px-4 py-4">
                <p className="text-sm font-semibold text-stone-900">Joined</p>
                <p className="mt-1 text-sm text-stone-600">{joinedDate}</p>
              </div>
              <div className="rounded-[1.4rem] bg-amber-50/70 px-4 py-4">
                <p className="text-sm font-semibold text-stone-900">Reminder email</p>
                <p className="mt-1 text-sm text-stone-600">{notificationEmail || user.email || "Not set"}</p>
              </div>
            </div>
          </Card>

          <Card className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="inline-flex size-12 items-center justify-center rounded-[1.1rem] bg-amber-50 text-amber-700">
                <LockKeyhole className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Security</p>
                <h2 className="text-2xl font-bold text-stone-950">Change password</h2>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700">Current password</label>
                <Input onChange={(event) => setCurrentPassword(event.target.value)} type="password" value={currentPassword} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700">New password</label>
                <Input onChange={(event) => setNewPassword(event.target.value)} type="password" value={newPassword} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700">Confirm password</label>
                <Input onChange={(event) => setConfirmPassword(event.target.value)} type="password" value={confirmPassword} />
              </div>
            </div>

            <Button disabled={passwordPending} onClick={changePassword}>
              {passwordPending ? <LoaderCircle className="size-4 animate-spin" /> : <LockKeyhole className="size-4" />}
              Change password
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

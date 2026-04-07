"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

import type { User } from "@supabase/supabase-js";
import { LoaderCircle, LockKeyhole, MapPinned, Save, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { passwordChangeSchema, profileSchema } from "@/lib/validation";
import type { Profile } from "@/types";

export function ProfileWorkspace({
  user,
  profile
}: {
  user: User;
  profile: Profile | null;
}) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [fullName, setFullName] = useState(profile?.full_name ?? user.user_metadata.full_name ?? "");
  const [timezone, setTimezone] = useState(profile?.timezone ?? "");
  const [countryCode, setCountryCode] = useState(profile?.country_code ?? "");
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

  const joinedDate = new Date(profile?.created_at ?? user.created_at).toLocaleDateString();

  const refreshLocation = async () => {
    const timezoneValue = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const response = await fetch("/api/location");
    const payload = (await response.json().catch(() => null)) as { country_code?: string | null } | null;

    setTimezone(timezoneValue);
    setCountryCode(payload?.country_code ?? "");
  };

  const saveProfile = () => {
    const parsed = profileSchema.safeParse({
      full_name: fullName,
      timezone: timezone || null,
      country_code: countryCode || null
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
      <section className="animate-fade-up rounded-[2rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.97),rgba(239,248,245,0.94),rgba(240,249,255,0.92))] px-6 py-8 shadow-[0_24px_80px_-42px_rgba(15,23,42,0.22)] dark:border dark:border-gray-800 dark:bg-gray-900">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700 dark:text-gray-500">Profile</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 dark:text-white">Account settings</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-gray-300">
          Manage your public identity, location details, and password from one secure page.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.85fr)]">
        <Card className="space-y-5 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="inline-flex size-12 items-center justify-center rounded-[1.1rem] bg-slate-950/5 text-slate-700 dark:bg-gray-950 dark:text-gray-300">
              <UserRound className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-gray-500">Identity</p>
              <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Profile details</h2>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium text-slate-800 dark:text-gray-500">Name</label>
              <Input onChange={(event) => setFullName(event.target.value)} value={fullName} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-800 dark:text-gray-500">Email</label>
              <Input disabled value={user.email ?? ""} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-800 dark:text-gray-500">Joined</label>
              <Input disabled value={joinedDate} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-800 dark:text-gray-500">Timezone</label>
              <Input onChange={(event) => setTimezone(event.target.value)} value={timezone} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-800 dark:text-gray-500">Country</label>
              <Input onChange={(event) => setCountryCode(event.target.value.toUpperCase())} value={countryCode} />
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
          <Card className="space-y-5 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="inline-flex size-12 items-center justify-center rounded-[1.1rem] bg-slate-950/5 text-slate-700 dark:bg-gray-950 dark:text-gray-300">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-gray-500">Account</p>
                <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Overview</h2>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-[1.4rem] bg-slate-50/90 px-4 py-4 dark:bg-gray-950">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Email</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-gray-300">{user.email}</p>
              </div>
              <div className="rounded-[1.4rem] bg-slate-50/90 px-4 py-4 dark:bg-gray-950">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Timezone</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-gray-300">{timezone || "Unknown"}</p>
              </div>
              <div className="rounded-[1.4rem] bg-slate-50/90 px-4 py-4 dark:bg-gray-950">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Joined</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-gray-300">{joinedDate}</p>
              </div>
            </div>
          </Card>

          <Card className="space-y-5 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="inline-flex size-12 items-center justify-center rounded-[1.1rem] bg-slate-950/5 text-slate-700 dark:bg-gray-950 dark:text-gray-300">
                <LockKeyhole className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-gray-500">Security</p>
                <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Change password</h2>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800 dark:text-gray-500">Current password</label>
                <Input onChange={(event) => setCurrentPassword(event.target.value)} type="password" value={currentPassword} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800 dark:text-gray-500">New password</label>
                <Input onChange={(event) => setNewPassword(event.target.value)} type="password" value={newPassword} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800 dark:text-gray-500">Confirm password</label>
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

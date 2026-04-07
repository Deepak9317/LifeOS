"use client";

import dynamic from "next/dynamic";

import { AuthPanelShell } from "@/components/auth-panel-shell";

export const AuthPanelLoader = dynamic(
  () => import("@/components/auth-panel").then((module) => module.AuthPanel),
  {
    loading: () => <AuthPanelShell />,
    ssr: false
  }
);

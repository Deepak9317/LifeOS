"use client";

import { Moon, SunMedium } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <Button onClick={toggleTheme} size={compact ? "sm" : "md"} variant="secondary">
      {resolvedTheme === "dark" ? <SunMedium className="size-4" /> : <Moon className="size-4" />}
      {compact ? null : resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
    </Button>
  );
}

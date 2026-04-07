"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-[linear-gradient(135deg,#d97706,#f59e0b)] text-white shadow-[0_18px_35px_-18px_rgba(217,119,6,0.42)] hover:brightness-105 focus-visible:ring-amber-400",
  secondary:
    "bg-white/92 text-stone-900 ring-1 ring-amber-100 hover:bg-white focus-visible:ring-amber-400",
  ghost:
    "bg-transparent text-stone-700 hover:bg-amber-50 focus-visible:ring-amber-200",
  danger:
    "bg-rose-600 text-white hover:bg-rose-500 focus-visible:ring-rose-300"
};

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base"
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      type={type}
      {...props}
    />
  );
}

"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-[linear-gradient(135deg,#0f766e,#14b8a6)] text-white shadow-[0_18px_35px_-18px_rgba(20,184,166,0.7)] hover:brightness-105 focus-visible:ring-teal-400",
  secondary:
    "bg-white/85 text-slate-900 ring-1 ring-slate-200/90 hover:bg-white focus-visible:ring-teal-400",
  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100/85 focus-visible:ring-slate-300",
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

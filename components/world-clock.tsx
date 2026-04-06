"use client";

import { useEffect, useState } from "react";

import { Clock3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DEFAULT_WORLD_CLOCKS, WORLD_TIMEZONES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "lifeos-world-clock";

function formatTime(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  }).format(date);
}

function formatDate(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    month: "short",
    day: "numeric"
  }).format(date);
}

export function WorldClock({ className }: { className?: string }) {
  const [now, setNow] = useState(() => new Date());
  const [active, setActive] = useState<string[]>(DEFAULT_WORLD_CLOCKS);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as string[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setActive(parsed);
        }
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }

    const interval = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(active));
  }, [active]);

  const toggleZone = (key: string) => {
    setActive((current) => {
      if (current.includes(key)) {
        return current.length === 1 ? current : current.filter((item) => item !== key);
      }

      return [...current, key];
    });
  };

  return (
    <Card className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-600">
            World clock
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">Keep key timezones close</h2>
        </div>
        <Badge className="bg-slate-950 text-white ring-slate-950/10">
          <Clock3 className="mr-1 size-3.5" />
          Live
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        {WORLD_TIMEZONES.map((zone) => {
          const isActive = active.includes(zone.key);

          return (
            <Button
              key={zone.key}
              className={cn(
                "rounded-full",
                isActive ? "bg-teal-500 text-white hover:bg-teal-400" : ""
              )}
              onClick={() => toggleZone(zone.key)}
              size="sm"
              variant={isActive ? "primary" : "secondary"}
            >
              {zone.key}
            </Button>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {WORLD_TIMEZONES.filter((zone) => active.includes(zone.key)).map((zone) => (
          <div
            key={zone.key}
            className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-5 text-white"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-slate-200">{zone.label}</p>
                <h3 className="text-xl font-bold">{zone.key}</h3>
              </div>
              <Badge className="bg-white/10 text-slate-100 ring-white/10">{zone.offset}</Badge>
            </div>
            <p className="mt-6 text-3xl font-bold tracking-tight">{formatTime(now, zone.timeZone)}</p>
            <p className="mt-2 text-sm text-slate-200">{formatDate(now, zone.timeZone)}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

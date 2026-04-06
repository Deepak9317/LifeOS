"use client";

import { useEffect, useState } from "react";

import { Clock3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DEFAULT_WORLD_CLOCKS, WORLD_TIMEZONES } from "@/lib/constants";
import { cn, formatDateInZone, formatTimeInZone } from "@/lib/utils";

const STORAGE_KEY = "lifeos-world-clock";

export function WorldClock({ className }: { className?: string }) {
  const [now, setNow] = useState(() => new Date());
  const [active, setActive] = useState<string[]>([...DEFAULT_WORLD_CLOCKS]);

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
    <Card className={cn("card-hover animate-fade-up space-y-6 border-cyan-100 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(236,254,255,0.95))] [animation-delay:150ms]", className)}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
            World clock
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">World clocks</h2>
        </div>
        <Badge className="bg-cyan-500/10 text-cyan-700 ring-cyan-500/15">
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
                isActive ? "bg-cyan-600 text-white hover:bg-cyan-500" : ""
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
            className="rounded-[1.75rem] border border-cyan-100 bg-white/85 p-5 text-slate-950 ring-1 ring-cyan-50"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-slate-600">{zone.label}</p>
                <h3 className="text-xl font-bold">{zone.key}</h3>
              </div>
              <Badge className="bg-cyan-500/10 text-cyan-700 ring-cyan-500/15">{zone.offset}</Badge>
            </div>
            <p className="mt-6 text-3xl font-bold tracking-tight text-slate-950">
              {formatTimeInZone(now, zone.timeZone, { second: "2-digit" })}
            </p>
            <p className="mt-2 text-sm text-slate-600">{formatDateInZone(now, zone.timeZone)}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

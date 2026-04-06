"use client";

import { useEffect, useState } from "react";

import { WORLD_TIMEZONES } from "@/lib/constants";
import { formatDateInZone, formatTimeInZone } from "@/lib/utils";

export function WorldClockStrip() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/70 shadow-[0_20px_60px_-38px_rgba(15,23,42,0.28)] backdrop-blur">
      <div className="flex gap-3 overflow-x-auto px-3 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {WORLD_TIMEZONES.map((zone) => (
          <div
            key={zone.key}
            className="min-w-[148px] rounded-[1.25rem] border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(239,248,245,0.92))] px-3 py-2.5"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold tracking-[0.18em] text-slate-500">{zone.key}</p>
              <span className="rounded-full bg-slate-950/5 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                {zone.offset}
              </span>
            </div>
            <p className="mt-2 text-base font-semibold text-slate-900">
              {formatTimeInZone(now, zone.timeZone)}
            </p>
            <p className="text-xs text-slate-500">
              {zone.label} · {formatDateInZone(now, zone.timeZone)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

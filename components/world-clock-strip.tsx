"use client";

import { useEffect, useMemo, useState } from "react";

import { WORLD_TIMEZONES } from "@/lib/constants";
import { formatDateInZone, formatTimeInZone } from "@/lib/utils";

export function WorldClockStrip() {
  const [now, setNow] = useState(() => new Date());
  const [userTimeZone, setUserTimeZone] = useState("");

  useEffect(() => {
    setUserTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);

    const interval = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const highlightedZone = useMemo(
    () => WORLD_TIMEZONES.find((zone) => zone.timeZone === userTimeZone)?.key ?? null,
    [userTimeZone]
  );

  return (
    <div className="overflow-hidden rounded-[1.5rem] bg-white/72 shadow-[0_20px_60px_-38px_rgba(15,23,42,0.2)] backdrop-blur">
      <div className="flex gap-3 overflow-x-auto px-3 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {WORLD_TIMEZONES.map((zone) => {
          const isUserZone = zone.timeZone === userTimeZone;

          return (
            <div
              key={zone.key}
              className={`min-w-[156px] rounded-[1.25rem] px-3 py-2.5 shadow-[0_12px_30px_-26px_rgba(15,23,42,0.2)] transition ${
                isUserZone
                  ? "bg-[linear-gradient(135deg,rgba(207,250,254,0.98),rgba(220,252,231,0.96))] scale-[1.01]"
                  : "bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(239,248,245,0.92))]"
              }`}
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
                {zone.label} - {formatDateInZone(now, zone.timeZone)}
              </p>
              {isUserZone ? (
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-700">
                  Your timezone
                </p>
              ) : highlightedZone && zone.key === highlightedZone ? (
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-700">
                  Local match
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

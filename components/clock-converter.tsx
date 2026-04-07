"use client";

import { useState } from "react";

import { ArrowLeftRight, Globe2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { WORLD_TIMEZONES } from "@/lib/constants";
import {
  formatDateInZone,
  formatTimeInZone,
  toLocalDateTimeInput,
  zonedDateFromLocalInput
} from "@/lib/utils";

export function ClockConverter() {
  const [fromZone, setFromZone] = useState("IST");
  const [toZone, setToZone] = useState("EST");
  const [dateTime, setDateTime] = useState(() => toLocalDateTimeInput(new Date()));

  const source = WORLD_TIMEZONES.find((zone) => zone.key === fromZone) ?? WORLD_TIMEZONES[0];
  const target = WORLD_TIMEZONES.find((zone) => zone.key === toZone) ?? WORLD_TIMEZONES[1];
  const normalizedDate = zonedDateFromLocalInput(dateTime, source.timeZone) ?? new Date();

  return (
    <Card className="card-hover animate-fade-up space-y-5 border-sky-100 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(240,249,255,0.95))] [animation-delay:90ms]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">Time tools</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">Clock converter</h2>
        </div>
        <div className="inline-flex size-12 items-center justify-center rounded-[1.2rem] bg-sky-500/10 text-sky-700">
          <Globe2 className="size-5" />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_56px_minmax(0,1fr)]">
        <select
          className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10"
          onChange={(event) => setFromZone(event.target.value)}
          value={fromZone}
        >
          {WORLD_TIMEZONES.map((zone) => (
            <option key={zone.key} value={zone.key}>
              {zone.key} - {zone.label}
            </option>
          ))}
        </select>
        <div className="inline-flex h-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
          <ArrowLeftRight className="size-4" />
        </div>
        <select
          className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10"
          onChange={(event) => setToZone(event.target.value)}
          value={toZone}
        >
          {WORLD_TIMEZONES.map((zone) => (
            <option key={zone.key} value={zone.key}>
              {zone.key} - {zone.label}
            </option>
          ))}
        </select>
      </div>

      <Input onChange={(event) => setDateTime(event.target.value)} type="datetime-local" value={dateTime} />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-[1.35rem] bg-white/80 p-4 ring-1 ring-sky-100">
          <p className="text-xs font-semibold tracking-[0.18em] text-slate-500">{source.key}</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">
            {formatTimeInZone(normalizedDate, source.timeZone)}
          </p>
          <p className="text-sm text-slate-600">
            {source.label} - {formatDateInZone(normalizedDate, source.timeZone, { year: "numeric" })}
          </p>
        </div>
        <div className="rounded-[1.35rem] bg-sky-50/80 p-4 ring-1 ring-sky-100">
          <p className="text-xs font-semibold tracking-[0.18em] text-slate-500">{target.key}</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">
            {formatTimeInZone(normalizedDate, target.timeZone)}
          </p>
          <p className="text-sm text-slate-600">
            {target.label} - {formatDateInZone(normalizedDate, target.timeZone, { year: "numeric" })}
          </p>
        </div>
      </div>
    </Card>
  );
}

"use client";

import { useEffect, useState } from "react";

import { CloudSun, LoaderCircle } from "lucide-react";

import { Card } from "@/components/ui/card";

type WeatherPayload = {
  weather: {
    location: string;
    temperature: number;
    high: number;
    low: number;
    condition: string;
    line: string;
  } | null;
  fallback?: string;
};

export function WeatherWidget() {
  const [state, setState] = useState<WeatherPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadWeather = async () => {
      const response = await fetch("/api/weather", { method: "GET" }).catch(() => null);
      const payload =
        response?.ok
          ? (((await response.json().catch(() => null)) as WeatherPayload | null) ?? null)
          : null;

      if (!active) {
        return;
      }

      setState(payload);
      setLoading(false);
    };

    void loadWeather();

    return () => {
      active = false;
    };
  }, []);

  return (
    <Card className="card-hover animate-fade-up rounded-[1.75rem] bg-[rgba(255,253,249,0.96)] p-5 shadow-[0_20px_50px_-38px_rgba(120,53,15,0.14)] [animation-delay:140ms]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Weather</p>
          <h2 className="mt-1 text-xl font-bold text-stone-950">Outside check</h2>
        </div>
        <div className="inline-flex size-11 items-center justify-center rounded-[1rem] bg-teal-50 text-teal-700">
          {loading ? <LoaderCircle className="size-5 animate-spin" /> : <CloudSun className="size-5" />}
        </div>
      </div>

      {loading ? (
        <div className="mt-5 space-y-3">
          <div className="h-8 w-24 rounded-full bg-stone-100" />
          <div className="h-5 w-40 rounded-full bg-stone-100" />
          <div className="h-16 rounded-[1rem] bg-stone-50" />
        </div>
      ) : state?.weather ? (
        <div className="mt-5 space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-4xl font-bold text-stone-950">{state.weather.temperature}°</p>
              <p className="mt-1 text-sm text-stone-600">{state.weather.condition}</p>
            </div>
            <div className="text-right text-sm text-stone-500">
              <p>{state.weather.location}</p>
              <p className="mt-1">H {state.weather.high}° / L {state.weather.low}°</p>
            </div>
          </div>
          <div className="rounded-[1.1rem] bg-teal-50/70 px-4 py-3">
            <p className="text-sm leading-6 text-stone-700">{state.weather.line}</p>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-[1.1rem] bg-stone-50 px-4 py-4">
          <p className="text-sm leading-6 text-stone-600">
            {state?.fallback ?? "Weather details are not available yet."}
          </p>
        </div>
      )}
    </Card>
  );
}

import { NextResponse, type NextRequest } from "next/server";

type WeatherSummary = {
  location: string;
  temperature: number;
  high: number;
  low: number;
  condition: string;
  line: string;
};

const weatherLabels: Record<number, string> = {
  0: "Clear",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Cloudy",
  45: "Foggy",
  48: "Misty",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  80: "Light showers",
  81: "Showers",
  82: "Heavy showers",
  95: "Thunderstorm"
};

function getCheekyLine(code: number, temperature: number) {
  if (code === 0 && temperature >= 24) {
    return "The sky is showing off. Good day to ship something before lunch.";
  }

  if (code === 0) {
    return "Clear skies. Your dashboard has no excuse to be the messiest thing today.";
  }

  if (code >= 61 && code <= 82) {
    return "A little rain outside. Excellent weather for dramatic checkbox progress.";
  }

  if (code >= 71 && code <= 75) {
    return "Snow mode. Stay warm and let the tasks do the traveling.";
  }

  if (code === 95) {
    return "Thunder outside, calm inside. Keep the sprint quieter than the clouds.";
  }

  if (temperature >= 30) {
    return "It is warm out there. Hydrate, breathe, and keep the workload lighter than the weather.";
  }

  if (temperature <= 8) {
    return "It is brisk. Perfect excuse for coffee and one very focused work block.";
  }

  return "The weather is doing its thing. You can still win the day in a calm, boringly efficient way.";
}

export async function GET(request: NextRequest) {
  const city = request.headers.get("x-vercel-ip-city");
  const region = request.headers.get("x-vercel-ip-country-region");
  const country = request.headers.get("x-vercel-ip-country");

  if (!city) {
    return NextResponse.json(
      {
        weather: null,
        fallback: "Weather will appear when location data is available on your deployment."
      },
      { status: 200 }
    );
  }

  try {
    const query = [city, region, country].filter(Boolean).join(", ");
    const geocode = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`,
      { next: { revalidate: 1800 } }
    );

    const geocodePayload = (await geocode.json()) as {
      results?: Array<{ name: string; country?: string; latitude: number; longitude: number }>;
    };

    const match = geocodePayload.results?.[0];

    if (!match) {
      return NextResponse.json(
        {
          weather: null,
          fallback: "Weather needs a clearer location signal before it can show up here."
        },
        { status: 200 }
      );
    }

    const forecast = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${match.latitude}&longitude=${match.longitude}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`,
      { next: { revalidate: 1800 } }
    );

    const forecastPayload = (await forecast.json()) as {
      current?: { temperature_2m?: number; weather_code?: number };
      daily?: { temperature_2m_max?: number[]; temperature_2m_min?: number[] };
    };

    const temperature = Math.round(forecastPayload.current?.temperature_2m ?? 0);
    const code = forecastPayload.current?.weather_code ?? 0;
    const high = Math.round(forecastPayload.daily?.temperature_2m_max?.[0] ?? temperature);
    const low = Math.round(forecastPayload.daily?.temperature_2m_min?.[0] ?? temperature);

    const weather: WeatherSummary = {
      location: [match.name, match.country].filter(Boolean).join(", "),
      temperature,
      high,
      low,
      condition: weatherLabels[code] ?? "Weather update",
      line: getCheekyLine(code, temperature)
    };

    return NextResponse.json({ weather });
  } catch {
    return NextResponse.json(
      {
        weather: null,
        fallback: "Weather is taking the scenic route right now. Try again shortly."
      },
      { status: 200 }
    );
  }
}

import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const country =
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("x-country-code") ||
    null;

  return NextResponse.json({
    country_code: country
  });
}

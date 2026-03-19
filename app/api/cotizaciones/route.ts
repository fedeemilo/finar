import { NextResponse } from "next/server";
import { fetchCotizaciones } from "@/lib/cotizaciones";
import { getCached, setCache } from "@/lib/redis";

const CACHE_KEY = "cotizaciones:latest";
const TTL = 15 * 60; // 15 minutes

export async function GET() {
  // Try cache first
  const cached = await getCached<ReturnType<typeof fetchCotizaciones> extends Promise<infer T> ? T : never>(CACHE_KEY);
  if (cached) return NextResponse.json(cached);

  try {
    const data = await fetchCotizaciones();
    await setCache(CACHE_KEY, data, TTL);
    return NextResponse.json(data);
  } catch {
    // If fetch failed, try stale cache
    const stale = await getCached<Awaited<ReturnType<typeof fetchCotizaciones>>>(CACHE_KEY);
    if (stale) {
      return NextResponse.json({ ...stale, stale: true });
    }
    return NextResponse.json(
      { error: "No se pudieron obtener las cotizaciones" },
      { status: 503 }
    );
  }
}

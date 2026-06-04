import { NextResponse } from "next/server";
import { getCached, setCache } from "@/lib/redis";
import {
  generarNoticias,
  getMockNoticias,
  CACHE_KEY,
  STALE_KEY,
  TTL,
  STALE_TTL,
  type Noticia,
} from "@/lib/noticias";

export type { Noticia } from "@/lib/noticias";

export async function GET() {
  // 1. Caché fresca → respuesta instantánea
  const cached = await getCached<Noticia[]>(CACHE_KEY);
  if (cached) return NextResponse.json(cached);

  // 2. Caché vencida pero hay stale → respuesta instantánea
  const stale = await getCached<Noticia[]>(STALE_KEY);
  if (stale) return NextResponse.json(stale);

  // 3. Sin datos → generar on-demand (fallback; el cron mantiene caliente)
  try {
    const noticias = await generarNoticias();
    await Promise.all([
      setCache(CACHE_KEY, noticias, TTL),
      setCache(STALE_KEY, noticias, STALE_TTL),
    ]);
    return NextResponse.json(noticias);
  } catch {
    return NextResponse.json(getMockNoticias());
  }
}

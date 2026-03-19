import { NextResponse } from "next/server";
import { getCached, setCache } from "@/lib/redis";
import {
  generarAnalisis,
  CACHE_KEY,
  STALE_KEY,
  TTL,
  STALE_TTL,
} from "@/lib/analisis";

export type { AnalisisActivo, AnalisisResponse } from "@/lib/analisis";

export async function GET() {
  // 1. Caché fresca → respuesta instantánea (caso más común)
  const cached = await getCached<Awaited<ReturnType<typeof generarAnalisis>>>(CACHE_KEY);
  if (cached) return NextResponse.json(cached);

  // 2. Caché vencida pero hay datos viejos → respuesta instantánea con badge "stale"
  //    El cron en /api/analisis/revalidate se encarga de mantener el caché caliente
  const stale = await getCached<Awaited<ReturnType<typeof generarAnalisis>>>(STALE_KEY);
  if (stale) return NextResponse.json({ ...stale, stale: true });

  // 3. Sin datos (primer arranque o stale expirado) → esperar a Claude
  try {
    const analisis = await generarAnalisis();
    await Promise.all([
      setCache(CACHE_KEY, analisis, TTL),
      setCache(STALE_KEY, analisis, STALE_TTL),
    ]);
    return NextResponse.json(analisis);
  } catch (err) {
    console.error("Error generando análisis:", err);
    return NextResponse.json({ error: "No se pudo generar el análisis" }, { status: 503 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { generarAnalisis, CACHE_KEY, STALE_KEY, TTL, STALE_TTL, REFRESH_LOCK } from "@/lib/analisis";
import { setCache, redis } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Vercel envía Authorization: Bearer <CRON_SECRET> en llamadas de cron
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get("Authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const analisis = await generarAnalisis();
    await Promise.all([
      setCache(CACHE_KEY, analisis, TTL),
      setCache(STALE_KEY, analisis, STALE_TTL),
      redis.del(REFRESH_LOCK),
    ]);
    return NextResponse.json({ ok: true, timestamp: analisis.timestamp });
  } catch (err) {
    console.error("Error en revalidación de análisis:", err);
    return NextResponse.json({ error: "Revalidación fallida" }, { status: 500 });
  }
}

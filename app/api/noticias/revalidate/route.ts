import { NextRequest, NextResponse } from "next/server";
import { generarNoticias, CACHE_KEY, STALE_KEY, TTL, STALE_TTL } from "@/lib/noticias";
import { setCache } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // n8n / Vercel Cron envían Authorization: Bearer <CRON_SECRET>
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get("Authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const noticias = await generarNoticias();
    await Promise.all([
      setCache(CACHE_KEY, noticias, TTL),
      setCache(STALE_KEY, noticias, STALE_TTL),
    ]);
    return NextResponse.json({ ok: true, count: noticias.length, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error("Error en revalidación de noticias:", err);
    return NextResponse.json({ error: "Revalidación fallida" }, { status: 500 });
  }
}

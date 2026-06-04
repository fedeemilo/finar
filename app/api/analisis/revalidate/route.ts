import { NextRequest, NextResponse } from "next/server";
import { generarAnalisis, CACHE_KEY, STALE_KEY, TTL, STALE_TTL, REFRESH_LOCK } from "@/lib/analisis";
import { setCache, redis } from "@/lib/redis";
import { saveSnapshot, saveCotizaciones } from "@/lib/db";

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
    const { analisis, cotizaciones } = await generarAnalisis();

    await Promise.all([
      setCache(CACHE_KEY, analisis, TTL),
      setCache(STALE_KEY, analisis, STALE_TTL),
      redis.del(REFRESH_LOCK),
    ]);

    // Snapshot a Postgres — best-effort, un fallo de BD no debe romper el cache
    const dbResults = await Promise.allSettled([
      saveSnapshot("analisis", analisis),
      saveCotizaciones({
        oficial_venta: cotizaciones.oficial.venta,
        blue_venta: cotizaciones.blue.venta,
        mep_venta: cotizaciones.mep.venta,
        ccl_venta: cotizaciones.ccl.venta,
      }),
    ]);
    dbResults.forEach((r, i) => {
      if (r.status === "rejected") {
        console.error(`BD write ${i === 0 ? "snapshot" : "cotizaciones"} falló:`, r.reason);
      }
    });

    return NextResponse.json({ ok: true, timestamp: analisis.timestamp });
  } catch (err) {
    console.error("Error en revalidación de análisis:", err);
    return NextResponse.json({ error: "Revalidación fallida" }, { status: 500 });
  }
}

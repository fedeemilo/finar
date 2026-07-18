import { NoticiasDiariasLayout, type NoticiasData } from "@/components/NoticiasDiariasLayout";
import { SemaforoStrip } from "@/components/SemaforoStrip";
import { InvertirModal } from "@/components/InvertirModal";
import { getCached, setCache } from "@/lib/redis";
import {
  loadAvailableDates,
  loadSnapshotHaceDias,
  loadCotizacionesHistorial,
} from "@/lib/db";
import {
  generarAnalisis,
  CACHE_KEY as ANALISIS_CACHE,
  STALE_KEY as ANALISIS_STALE,
  TTL as ANALISIS_TTL,
  STALE_TTL as ANALISIS_STALE_TTL,
  type AnalisisResponse,
  type AnalisisActivo,
} from "@/lib/analisis";

export const dynamic = "force-dynamic";

async function loadAnalisis(): Promise<AnalisisResponse | null> {
  const fresh = await getCached<AnalisisResponse>(ANALISIS_CACHE);
  if (fresh) return fresh;

  const stale = await getCached<AnalisisResponse>(ANALISIS_STALE);
  if (stale) return { ...stale, stale: true };

  try {
    const { analisis } = await generarAnalisis();
    await Promise.all([
      setCache(ANALISIS_CACHE, analisis, ANALISIS_TTL),
      setCache(ANALISIS_STALE, analisis, ANALISIS_STALE_TTL),
    ]);
    return analisis;
  } catch (err) {
    console.error("Home: fallback on-demand de análisis falló", err);
    return null;
  }
}

async function loadHistoricoSemana(): Promise<
  | { activos: Record<string, AnalisisActivo>; capturedAt: string }
  | null
> {
  try {
    const snap = await loadSnapshotHaceDias<AnalisisResponse>("analisis", 7);
    if (!snap) return null;
    const activos = Object.fromEntries(snap.payload.activos.map((a) => [a.id, a]));
    return { activos, capturedAt: snap.capturedAt };
  } catch (err) {
    console.error("Home: load del histórico de 7d falló", err);
    return null;
  }
}

async function loadHistorialBlue(): Promise<number[]> {
  try {
    return await loadCotizacionesHistorial("blue_venta", 30);
  } catch (err) {
    console.error("Home: load del historial del Blue falló", err);
    return [];
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const variant = searchParams.tab === "tech" ? "tech" : "general";
  const redisKey = variant === "tech" ? "noticias:tech" : "noticias:diarias";
  const archiveKind = variant === "tech" ? "noticias-tech" : "noticias-diarias";

  const [data, fechas, analisis, historico, historialBlue] = await Promise.all([
    getCached<NoticiasData>(redisKey),
    loadAvailableDates(7, archiveKind).catch(() => [] as string[]),
    loadAnalisis(),
    loadHistoricoSemana(),
    loadHistorialBlue(),
  ]);

  const historiales: Record<string, number[]> = {};
  if (historialBlue.length >= 2) historiales.blue = historialBlue;

  return (
    <NoticiasDiariasLayout
      data={data}
      variant={variant}
      fechasDisponibles={fechas}
      homeMode
      headerActions={<InvertirModal />}
      mercadoSlot={
        <SemaforoStrip
          analisis={analisis}
          historico={historico}
          historiales={historiales}
        />
      }
    />
  );
}

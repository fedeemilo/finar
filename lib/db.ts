import { sql } from "@vercel/postgres";

export type SnapshotKind =
  | "analisis"
  | "noticias-home"
  | "noticias-diarias"
  | "noticias-tech";

export interface CotizacionesRow {
  oficial_venta: number;
  blue_venta: number;
  mep_venta: number;
  ccl_venta: number;
}

// ── WRITES ──────────────────────────────────────────────────────────────────

export async function saveSnapshot(kind: SnapshotKind, payload: unknown): Promise<void> {
  await sql`
    INSERT INTO snapshots (kind, payload)
    VALUES (${kind}, ${JSON.stringify(payload)}::jsonb)
  `;
}

export async function saveCotizaciones(c: CotizacionesRow): Promise<void> {
  await sql`
    INSERT INTO cotizaciones (captured_at, oficial_venta, blue_venta, mep_venta, ccl_venta)
    VALUES (NOW(), ${c.oficial_venta}, ${c.blue_venta}, ${c.mep_venta}, ${c.ccl_venta})
    ON CONFLICT (captured_at) DO NOTHING
  `;
}

// ── READS ───────────────────────────────────────────────────────────────────

const ARG_TZ = "America/Argentina/Buenos_Aires";

/**
 * Trae el snapshot MÁS RECIENTE de un kind para una fecha dada (YYYY-MM-DD en ARG).
 * Devuelve null si no hay ningún snapshot ese día.
 */
export async function loadSnapshotByDate<T = unknown>(
  kind: SnapshotKind,
  fecha: string
): Promise<{ payload: T; capturedAt: string } | null> {
  const { rows } = await sql<{ payload: T; captured_at: string }>`
    SELECT payload, captured_at
    FROM snapshots
    WHERE kind = ${kind}
      AND DATE(captured_at AT TIME ZONE ${ARG_TZ}) = ${fecha}::date
    ORDER BY captured_at DESC
    LIMIT 1
  `;
  if (rows.length === 0) return null;
  return { payload: rows[0].payload, capturedAt: rows[0].captured_at };
}

/**
 * Trae las últimas N fechas (en ARG) con al menos un snapshot del kind dado.
 * Default: 'analisis' (para el footer chips del home y /archivo index).
 * También usado para los chips inline de /noticias y /noticias/tech.
 */
export async function loadAvailableDates(
  limit = 7,
  kind: SnapshotKind = "analisis"
): Promise<string[]> {
  const { rows } = await sql<{ fecha: string }>`
    SELECT DISTINCT TO_CHAR(captured_at AT TIME ZONE ${ARG_TZ}, 'YYYY-MM-DD') AS fecha
    FROM snapshots
    WHERE kind = ${kind}
    ORDER BY fecha DESC
    LIMIT ${limit}
  `;
  return rows.map((r) => r.fecha);
}

/** Timestamp del snapshot más reciente de un kind. Fallback si Redis no trae actualizadoAt. */
export async function loadLatestCapturedAt(kind: SnapshotKind): Promise<string | null> {
  const { rows } = await sql<{ captured_at: string }>`
    SELECT captured_at
    FROM snapshots
    WHERE kind = ${kind}
    ORDER BY captured_at DESC
    LIMIT 1
  `;
  return rows[0]?.captured_at ?? null;
}

/**
 * Trae el snapshot MÁS RECIENTE de un kind que tenga al menos `daysAgo` días de antigüedad.
 * Usado para el bloque "¿Qué decía hace una semana?" en AssetCard.
 * Devuelve null si todavía no hay data tan vieja (primeros días después del deploy).
 */
export async function loadSnapshotHaceDias<T = unknown>(
  kind: SnapshotKind,
  daysAgo: number
): Promise<{ payload: T; capturedAt: string } | null> {
  const { rows } = await sql<{ payload: T; captured_at: string }>`
    SELECT payload, captured_at
    FROM snapshots
    WHERE kind = ${kind}
      AND captured_at <= NOW() - (${daysAgo}::int * INTERVAL '1 day')
    ORDER BY captured_at DESC
    LIMIT 1
  `;
  if (rows.length === 0) return null;
  return { payload: rows[0].payload, capturedAt: rows[0].captured_at };
}

/**
 * Trae un snapshot por ID exacto. Usado por /snap/[id] (snapshot compartible).
 */
export async function loadSnapshotById<T = unknown>(
  id: number
): Promise<{ kind: SnapshotKind; payload: T; capturedAt: string } | null> {
  const { rows } = await sql<{ kind: SnapshotKind; payload: T; captured_at: string }>`
    SELECT kind, payload, captured_at
    FROM snapshots
    WHERE id = ${id}
    LIMIT 1
  `;
  if (rows.length === 0) return null;
  return {
    kind: rows[0].kind,
    payload: rows[0].payload,
    capturedAt: rows[0].captured_at,
  };
}

/**
 * ID del análisis más reciente. Usado por el botón compartir del home.
 */
export async function loadLatestAnalisisId(): Promise<number | null> {
  const { rows } = await sql<{ id: number }>`
    SELECT id FROM snapshots
    WHERE kind = 'analisis'
    ORDER BY captured_at DESC
    LIMIT 1
  `;
  return rows.length === 0 ? null : rows[0].id;
}

export type CotizacionField = "oficial_venta" | "blue_venta" | "mep_venta" | "ccl_venta";

/**
 * Historial de un campo de cotización: 1 punto por día (el más reciente del día en ARG),
 * orden cronológico ascendente. Usado por el sparkline.
 *
 * Implementación: window function `ROW_NUMBER` que rankea por día (ARG TZ),
 * filtramos rn=1 (el más reciente del día). Más estable que DISTINCT ON o ARRAY_AGG
 * cuando el timezone se pasa como parámetro.
 */
export async function loadCotizacionesHistorial(
  field: CotizacionField,
  days = 30
): Promise<number[]> {
  const allowed: CotizacionField[] = ["oficial_venta", "blue_venta", "mep_venta", "ccl_venta"];
  if (!allowed.includes(field)) return [];

  const interval = `${days} days`;
  let rows: { v: number }[];
  switch (field) {
    case "blue_venta":
      ({ rows } = await sql<{ v: number }>`
        SELECT v FROM (
          SELECT
            blue_venta::float AS v,
            ROW_NUMBER() OVER (
              PARTITION BY DATE(captured_at AT TIME ZONE ${ARG_TZ})
              ORDER BY captured_at DESC
            ) AS rn,
            DATE(captured_at AT TIME ZONE ${ARG_TZ}) AS dia
          FROM cotizaciones
          WHERE captured_at >= NOW() - ${interval}::interval
        ) sub
        WHERE rn = 1
        ORDER BY dia ASC
      `);
      break;
    case "oficial_venta":
      ({ rows } = await sql<{ v: number }>`
        SELECT v FROM (
          SELECT
            oficial_venta::float AS v,
            ROW_NUMBER() OVER (
              PARTITION BY DATE(captured_at AT TIME ZONE ${ARG_TZ})
              ORDER BY captured_at DESC
            ) AS rn,
            DATE(captured_at AT TIME ZONE ${ARG_TZ}) AS dia
          FROM cotizaciones
          WHERE captured_at >= NOW() - ${interval}::interval
        ) sub
        WHERE rn = 1
        ORDER BY dia ASC
      `);
      break;
    case "mep_venta":
      ({ rows } = await sql<{ v: number }>`
        SELECT v FROM (
          SELECT
            mep_venta::float AS v,
            ROW_NUMBER() OVER (
              PARTITION BY DATE(captured_at AT TIME ZONE ${ARG_TZ})
              ORDER BY captured_at DESC
            ) AS rn,
            DATE(captured_at AT TIME ZONE ${ARG_TZ}) AS dia
          FROM cotizaciones
          WHERE captured_at >= NOW() - ${interval}::interval
        ) sub
        WHERE rn = 1
        ORDER BY dia ASC
      `);
      break;
    case "ccl_venta":
      ({ rows } = await sql<{ v: number }>`
        SELECT v FROM (
          SELECT
            ccl_venta::float AS v,
            ROW_NUMBER() OVER (
              PARTITION BY DATE(captured_at AT TIME ZONE ${ARG_TZ})
              ORDER BY captured_at DESC
            ) AS rn,
            DATE(captured_at AT TIME ZONE ${ARG_TZ}) AS dia
          FROM cotizaciones
          WHERE captured_at >= NOW() - ${interval}::interval
        ) sub
        WHERE rn = 1
        ORDER BY dia ASC
      `);
      break;
  }
  return rows.map((r) => r.v);
}

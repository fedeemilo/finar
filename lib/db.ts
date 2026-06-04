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

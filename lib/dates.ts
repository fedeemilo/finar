// Helpers conscientes del timezone ARG.
// Necesarios porque Vercel functions corren en US por default —
// `new Date().toISOString().slice(0,10)` puede dar la fecha equivocada cerca
// de la medianoche local del usuario.

const ARG_TZ = "America/Argentina/Buenos_Aires";

/** "Hoy" en ARG como string YYYY-MM-DD. */
export function todayArg(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ARG_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/**
 * Días enteros entre `fecha` (YYYY-MM-DD) y hoy en ARG.
 * Positivo si `fecha` es pasada, 0 si es hoy.
 */
export function daysFromTodayArg(fecha: string): number {
  const [yT, mT, dT] = fecha.split("-").map(Number);
  const [yH, mH, dH] = todayArg().split("-").map(Number);
  const target = Date.UTC(yT, mT - 1, dT);
  const today = Date.UTC(yH, mH - 1, dH);
  return Math.round((today - target) / 86400000);
}

/** Máximo de días hacia atrás para chips inline. Más viejo → solo en página de archivo. */
export const MAX_CHIP_DAYS_AGO = 7;

/** Etiqueta corta y humana para chips/listas: "Hoy", "Ayer", "Hace 3 días", "12 may". */
export function fechaChipLabel(fecha: string): string {
  const diff = daysFromTodayArg(fecha);
  if (diff === 0) return "Hoy";
  if (diff === 1) return "Ayer";
  if (diff < 7) return `Hace ${diff} días`;
  if (diff === 7) return "Hace 1 semana";
  const [y, m, d] = fecha.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
  });
}

/** Hora corta en ARG desde un ISO: "18:04". Null si la fecha no es válida. */
export function horaCortaArg(iso: string): string | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: ARG_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

/** Fecha legible completa: "jueves, 4 de junio de 2026". */
export function fechaLegibleArg(fecha: string): string {
  const [y, m, d] = fecha.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Etiqueta compacta para grillas de archivo: "dom, 12 jul". */
export function fechaDiaCorto(fecha: string): string {
  const [y, m, d] = fecha.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/** Label de mes para agrupar archivo: "julio de 2026". */
export function mesLabel(yyyyMm: string): string {
  const [y, m] = yyyyMm.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });
}

export interface FechasPorMes {
  key: string;
  label: string;
  fechas: string[];
}

/** Agrupa fechas YYYY-MM-DD por mes, orden descendente (más reciente primero). */
export function groupFechasByMonth(fechas: string[]): FechasPorMes[] {
  const map = new Map<string, string[]>();
  for (const fecha of fechas) {
    const key = fecha.slice(0, 7);
    const bucket = map.get(key);
    if (bucket) bucket.push(fecha);
    else map.set(key, [fecha]);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, monthFechas]) => ({
      key,
      label: mesLabel(key),
      fechas: monthFechas,
    }));
}

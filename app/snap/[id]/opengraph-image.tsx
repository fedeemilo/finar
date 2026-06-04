import { ImageResponse } from "next/og";
import { loadSnapshotById } from "@/lib/db";
import type { AnalisisResponse } from "@/lib/analisis";

export const runtime = "nodejs";
export const alt = "FinAR · Semáforo de activos";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const NOMBRES: Record<string, string> = {
  mep: "Dólar MEP",
  blue: "Dólar Blue",
  "plazo-fijo": "Plazo Fijo",
  cedears: "CEDEARs",
  cripto: "Cripto",
  oro: "Oro",
};

const STATUS_COLOR: Record<string, string> = {
  green: "#34d399",
  yellow: "#fbbf24",
  red: "#f87171",
};

const STATUS_LABEL: Record<string, string> = {
  green: "Buen momento",
  yellow: "Precaución",
  red: "Momento difícil",
};

function fechaCorta(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    timeZone: "America/Argentina/Buenos_Aires",
  });
}

function hora(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  });
}

export default async function Image({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const snap = await loadSnapshotById<AnalisisResponse>(id);

  // Fallback genérico si el snapshot no existe o no es de análisis
  if (!snap || snap.kind !== "analisis") {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #0a0a0a 0%, #18181b 100%)",
            color: "#fafafa",
            fontSize: 64,
            fontWeight: 900,
          }}
        >
          FinAR
        </div>
      ),
      { ...size }
    );
  }

  const activos = snap.payload.activos;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1c1c1f 50%, #0a1a14 100%)",
          padding: "56px 64px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Top row: brand + fecha */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <span style={{ fontSize: 56, fontWeight: 900, color: "#fafafa", letterSpacing: -1 }}>
              Fin
            </span>
            <span style={{ fontSize: 56, fontWeight: 900, color: "#00e6aa", letterSpacing: -1 }}>
              AR
            </span>
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#71717a",
                background: "rgba(255,255,255,0.08)",
                padding: "4px 10px",
                borderRadius: 6,
                marginLeft: 8,
                letterSpacing: 1,
              }}
            >
              BETA
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <span style={{ fontSize: 22, fontWeight: 600, color: "#e4e4e7" }}>
              {fechaCorta(snap.capturedAt)} · {hora(snap.capturedAt)}
            </span>
            <span style={{ fontSize: 14, color: "#71717a", marginTop: 4 }}>
              hora ARG
            </span>
          </div>
        </div>

        {/* Título */}
        <div style={{ display: "flex", marginTop: 36, marginBottom: 28 }}>
          <span style={{ fontSize: 38, fontWeight: 800, color: "#fafafa", lineHeight: 1.2 }}>
            Semáforo de activos
          </span>
        </div>

        {/* Grid 3 columnas × 2 filas */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            flex: 1,
          }}
        >
          {activos.slice(0, 6).map((a) => {
            const nombre = NOMBRES[a.id] ?? a.id;
            const color = STATUS_COLOR[a.status] ?? "#71717a";
            const label = STATUS_LABEL[a.status] ?? a.status;
            return (
              <div
                key={a.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "calc(33.333% - 11px)",
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${color}40`,
                  borderRadius: 16,
                  padding: 20,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 999,
                      background: color,
                    }}
                  />
                  <span style={{ fontSize: 14, color, fontWeight: 600 }}>{label}</span>
                </div>
                <span style={{ fontSize: 22, fontWeight: 700, color: "#fafafa", marginBottom: 6 }}>
                  {nombre}
                </span>
                <span style={{ fontSize: 14, color: "#a1a1aa", lineHeight: 1.4 }}>
                  {a.veredicto.length > 60 ? a.veredicto.slice(0, 57) + "…" : a.veredicto}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 24,
            paddingTop: 16,
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <span style={{ fontSize: 16, color: "#71717a" }}>finar.fedmilo.com</span>
          <span style={{ fontSize: 14, color: "#52525b" }}>
            ¿En qué me conviene invertir hoy?
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}

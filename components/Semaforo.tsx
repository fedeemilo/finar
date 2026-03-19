"use client";

import { useEffect, useState } from "react";
import { AssetCard, AssetCardData, AssetCardSkeleton } from "./AssetCard";
import type { AnalisisResponse } from "@/app/api/analisis/route";

const ASSET_META: Record<string, { nombre: string; icono: string; glosarioTerm?: string }> = {
  mep:         { nombre: "Dólar MEP",      icono: "💵", glosarioTerm: "MEP" },
  ccl:         { nombre: "Dólar CCL",      icono: "🌍", glosarioTerm: "CCL" },
  "plazo-fijo":{ nombre: "Plazo Fijo",     icono: "🏦", glosarioTerm: "Plazo_Fijo" },
  cedears:     { nombre: "CEDEARs",        icono: "📊", glosarioTerm: "CEDEAR" },
  cripto:      { nombre: "Cripto (BTC/ETH)",icono: "₿", glosarioTerm: "BTC" },
  oro:         { nombre: "Oro (GLD)",      icono: "🥇", glosarioTerm: "GLD" },
};

export function Semaforo() {
  const [assets, setAssets] = useState<AssetCardData[] | null>(null);
  const [contexto, setContexto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [stale, setStale] = useState(false);

  useEffect(() => {
    fetch("/api/analisis")
      .then((r) => r.json())
      .then((data: AnalisisResponse) => {
        const mapped: AssetCardData[] = data.activos.map((a) => ({
          id: a.id,
          nombre: ASSET_META[a.id]?.nombre ?? a.id,
          icono: ASSET_META[a.id]?.icono ?? "📌",
          status: a.status,
          veredicto: a.veredicto,
          porque: a.porque,
          glosarioTerm: ASSET_META[a.id]?.glosarioTerm,
        }));
        setAssets(mapped);
        setContexto(data.contexto ?? null);
        setStale(data.stale ?? false);
      })
      .catch(() => setAssets([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-4 w-3/4 bg-white/5 rounded-full animate-pulse mb-5" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <AssetCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Contexto general de Claude */}
      {contexto && (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 flex gap-3 items-start">
          <span className="text-lg flex-shrink-0">🧠</span>
          <p className="text-white/60 text-sm leading-relaxed">
            {contexto}
            {stale && (
              <span className="ml-2 text-amber-400/60 text-xs">(datos anteriores)</span>
            )}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {assets?.map((asset) => (
          <AssetCard key={asset.id} data={asset} />
        ))}
      </div>
    </div>
  );
}

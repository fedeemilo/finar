"use client";

import { useEffect, useState } from "react";
import {
  ArrowRightLeft,
  Banknote,
  Landmark,
  Globe,
  Bitcoin,
  Gem,
  type LucideIcon,
} from "lucide-react";
import { AssetCard, AssetCardData, AssetCardSkeleton } from "./AssetCard";
import type { AnalisisResponse } from "@/app/api/analisis/route";

const ASSET_META: Record<string, { nombre: string; icono: LucideIcon; glosarioTerm?: string }> = {
  mep:          { nombre: "Dólar MEP",        icono: ArrowRightLeft, glosarioTerm: "MEP" },
  blue:         { nombre: "Dólar Blue",       icono: Banknote,       glosarioTerm: "Blue" },
  "plazo-fijo": { nombre: "Plazo Fijo",       icono: Landmark,       glosarioTerm: "Plazo_Fijo" },
  cedears:      { nombre: "CEDEARs",          icono: Globe,          glosarioTerm: "CEDEAR" },
  cripto:       { nombre: "Cripto (BTC/ETH)", icono: Bitcoin,        glosarioTerm: "BTC" },
  oro:          { nombre: "Oro (GLD)",        icono: Gem,            glosarioTerm: "GLD" },
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
          icono: ASSET_META[a.id]?.icono ?? Banknote,
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
        <div className="h-4 w-3/4 bg-black/5 dark:bg-white/5 rounded-full animate-pulse mb-5" />
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
        <div className="rounded-xl border border-black/[0.07] dark:border-white/5 bg-black/[0.03] dark:bg-white/[0.02] px-4 py-3 flex gap-3 items-start">
          <span className="text-lg flex-shrink-0">🧠</span>
          <p className="text-gray-500 dark:text-white/60 text-sm leading-relaxed">
            {contexto}
            {stale && (
              <span className="ml-2 text-amber-500/60 dark:text-amber-400/60 text-xs">(datos anteriores)</span>
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

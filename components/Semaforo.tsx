"use client";

import { useEffect, useState } from "react";
import {
  ArrowRightLeft,
  Banknote,
  Landmark,
  Globe,
  Bitcoin,
  Gem,
  Brain,
  type LucideIcon,
} from "lucide-react";
import { AssetCard, AssetCardData, AssetCardSkeleton } from "./AssetCard";
import type { AnalisisResponse } from "@/app/api/analisis/route";

const LOADING_STEPS = [
  { text: "Consultando cotizaciones del dólar en tiempo real...", delay: 0 },
  { text: "Revisando las últimas noticias económicas...",         delay: 6000 },
  { text: "Claude está analizando cada activo...",                delay: 12000 },
  { text: "Evaluando riesgos y oportunidades del mercado...",     delay: 20000 },
  { text: "Calculando el semáforo de hoy...",                     delay: 28000 },
  { text: "Casi listo, un momento más...",                        delay: 36000 },
];

function LoadingMessage() {
  const [stepIndex, setStepIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    LOADING_STEPS.forEach((step, i) => {
      if (i === 0) return;
      timers.push(
        setTimeout(() => {
          setVisible(false);
          setTimeout(() => {
            setStepIndex(i);
            setVisible(true);
          }, 300);
        }, step.delay)
      );
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex items-center gap-2 h-5 mb-5">
      <span
        className={`text-sm text-gray-500 dark:text-white/40 transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        {LOADING_STEPS[stepIndex].text}
      </span>
    </div>
  );
}

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
        <LoadingMessage />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
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
        <div className="rounded-xl border border-black/[0.12] dark:border-white/5 bg-white/70 dark:bg-white/[0.02] px-4 py-3 flex gap-3 items-start">
          <Brain size={22} className="flex-shrink-0 mt-0.5 text-gray-500 dark:text-white/40" strokeWidth={1.75} />
          <p className="text-gray-600 dark:text-white/60 text-sm leading-relaxed">
            {contexto}
            {stale && (
              <span className="ml-2 text-amber-500/60 dark:text-amber-400/60 text-xs">(datos anteriores)</span>
            )}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
        {assets?.map((asset) => (
          <AssetCard key={asset.id} data={asset} />
        ))}
      </div>
    </div>
  );
}

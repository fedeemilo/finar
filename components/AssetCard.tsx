"use client";

import { useState } from "react";
import { GlosarioTooltip } from "./GlosarioTooltip";
import { Sparkline } from "./Sparkline";
import {
  ChevronDown,
  ArrowRightLeft,
  Banknote,
  Landmark,
  Globe,
  Bitcoin,
  Gem,
  TrendingUp,
  TrendingDown,
  type LucideIcon,
} from "lucide-react";

export type SemaforoStatus = "green" | "yellow" | "red";

export interface AssetCardData {
  id: string;
  status: SemaforoStatus;
  veredicto: string;
  porque: string;
}

export interface AssetHistorico {
  activo: { status: SemaforoStatus; veredicto: string };
  capturedAt: string;
}

const STATUS_RANK: Record<SemaforoStatus, number> = { red: 1, yellow: 2, green: 3 };

function daysSince(iso: string): number {
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(1, Math.round(ms / 86400000));
}

const ASSET_META: Record<string, { nombre: string; icono: LucideIcon; glosarioTerm?: string }> = {
  mep:          { nombre: "Dólar MEP",        icono: ArrowRightLeft, glosarioTerm: "MEP" },
  blue:         { nombre: "Dólar Blue",       icono: Banknote,       glosarioTerm: "Blue" },
  "plazo-fijo": { nombre: "Plazo Fijo",       icono: Landmark,       glosarioTerm: "Plazo_Fijo" },
  cedears:      { nombre: "CEDEARs",          icono: Globe,          glosarioTerm: "CEDEAR" },
  cripto:       { nombre: "Cripto (BTC/ETH)", icono: Bitcoin,        glosarioTerm: "BTC" },
  oro:          { nombre: "Oro (GLD)",        icono: Gem,            glosarioTerm: "GLD" },
};

const STATUS_CONFIG = {
  green: {
    color: "bg-emerald-400",
    shadow: "shadow-emerald-400/30",
    label: "Buen momento",
    text: "text-emerald-500 dark:text-emerald-400",
    ring: "ring-emerald-400/20",
    cardBorder: "border-emerald-400/25",
  },
  yellow: {
    color: "bg-amber-400",
    shadow: "shadow-amber-400/30",
    label: "Precaución",
    text: "text-amber-500 dark:text-amber-400",
    ring: "ring-amber-400/20",
    cardBorder: "border-amber-400/25",
  },
  red: {
    color: "bg-red-400",
    shadow: "shadow-red-400/30",
    label: "Momento difícil",
    text: "text-red-500 dark:text-red-400",
    ring: "ring-red-400/20",
    cardBorder: "border-red-400/25",
  },
};

export function AssetCard({
  data,
  historico,
  historialPrecio,
}: {
  data: AssetCardData;
  historico?: AssetHistorico;
  historialPrecio?: number[];
}) {
  const [expanded, setExpanded] = useState(false);
  const config = STATUS_CONFIG[data.status];
  const meta = ASSET_META[data.id] ?? { nombre: data.id, icono: Banknote };
  const Icono = meta.icono;

  // Cálculo de cambio histórico — solo se renderiza si hay snapshot de hace N días
  const historicoConfig = historico ? STATUS_CONFIG[historico.activo.status] : null;
  const historicoDias = historico ? daysSince(historico.capturedAt) : 0;
  const trendDiff = historico ? STATUS_RANK[data.status] - STATUS_RANK[historico.activo.status] : 0;

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className={`w-full text-left rounded-2xl border bg-white/80 dark:bg-white/[0.03] backdrop-blur-sm p-5 transition-all duration-300 hover:bg-white dark:hover:bg-white/[0.06] active:scale-[0.98] ${config.cardBorder}`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5 p-2 rounded-xl bg-black/[0.07] dark:bg-white/5">
          <Icono size={22} className="text-gray-600 dark:text-white/50" strokeWidth={1.75} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {/* Status dot with pulse */}
            <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-50 ${config.color}`}
              />
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${config.color}`}
              />
            </span>
            <span className={`text-xs font-medium ${config.text}`}>
              {config.label}
            </span>
          </div>

          {/* Name */}
          <div className="text-gray-800 dark:text-white/90 font-semibold text-base mb-1">
            {meta.glosarioTerm ? (
              <GlosarioTooltip term={meta.glosarioTerm}>
                {meta.nombre}
              </GlosarioTooltip>
            ) : (
              meta.nombre
            )}
          </div>

          {/* Veredicto */}
          <p className="text-gray-600 dark:text-white/60 text-sm leading-relaxed">
            {data.veredicto}
          </p>

          {/* Sparkline (solo si vienen datos históricos suficientes) */}
          {historialPrecio && historialPrecio.length >= 2 && (
            <div className="mt-3">
              <Sparkline points={historialPrecio} />
            </div>
          )}
        </div>

        {/* Chevron */}
        <ChevronDown
          className={`flex-shrink-0 mt-1 text-gray-400 dark:text-white/30 transition-transform duration-300 ${
            expanded ? "rotate-180" : ""
          }`}
          size={18}
        />
      </div>

      {/* Expanded content */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          expanded ? "max-h-[28rem] opacity-100 mt-4" : "max-h-0 opacity-0"
        }`}
      >
        <div className={`border-t ${config.cardBorder} pt-4`}>
          <p className="text-xs text-gray-500 dark:text-white/40 uppercase tracking-wider mb-2 font-medium">
            ¿Por qué?
          </p>
          <div className="max-h-36 overflow-y-auto pr-1">
            <p className="text-gray-700 dark:text-white/70 text-sm leading-relaxed">{data.porque}</p>
          </div>

          {historico && historicoConfig && (
            <div className="mt-4 pt-3 border-t border-black/[0.07] dark:border-white/[0.07]">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <p className="text-[10px] text-gray-500 dark:text-white/40 uppercase tracking-wider font-medium">
                  Hace {historicoDias} {historicoDias === 1 ? "día" : "días"}
                </p>
                <span className={`relative inline-block h-1.5 w-1.5 rounded-full ${historicoConfig.color}`} />
                <span className={`text-[11px] font-medium ${historicoConfig.text}`}>
                  {historicoConfig.label}
                </span>
                {trendDiff > 0 && (
                  <span className="ml-auto flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    <TrendingUp size={10} strokeWidth={2.5} />
                    mejoró
                  </span>
                )}
                {trendDiff < 0 && (
                  <span className="ml-auto flex items-center gap-0.5 text-[10px] text-red-500 dark:text-red-400 font-medium">
                    <TrendingDown size={10} strokeWidth={2.5} />
                    empeoró
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 dark:text-white/50 italic leading-relaxed">
                &ldquo;{historico.activo.veredicto}&rdquo;
              </p>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

export function AssetCardSkeleton() {
  return (
    <div className="rounded-2xl border border-black/[0.12] dark:border-white/5 bg-white/80 dark:bg-white/[0.03] p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-8 h-8 bg-black/10 dark:bg-white/10 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-2.5 bg-black/10 dark:bg-white/10 rounded-full w-20" />
          <div className="h-4 bg-black/10 dark:bg-white/10 rounded-full w-32" />
          <div className="h-3 bg-black/10 dark:bg-white/10 rounded-full w-full" />
          <div className="h-3 bg-black/10 dark:bg-white/10 rounded-full w-4/5" />
        </div>
      </div>
    </div>
  );
}

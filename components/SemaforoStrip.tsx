"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Archive } from "lucide-react";
import { Semaforo, type HistoricoData } from "@/components/Semaforo";
import type { AnalisisResponse } from "@/lib/analisis";

const ASSET_NAMES: Record<string, string> = {
  mep: "MEP",
  blue: "Blue",
  "plazo-fijo": "Plazo fijo",
  cedears: "CEDEARs",
  cripto: "Cripto",
  oro: "Oro",
};

const STATUS_DOT: Record<string, string> = {
  green: "bg-emerald-400",
  yellow: "bg-amber-400",
  red: "bg-red-400",
};

export function SemaforoStrip({
  analisis,
  historico,
  historiales,
}: {
  analisis: AnalisisResponse | null;
  historico?: HistoricoData | null;
  historiales?: Record<string, number[]>;
}) {
  const [open, setOpen] = useState(false);

  if (!analisis || analisis.activos.length === 0) {
    return (
      <div id="mercado" className="scroll-mt-14 py-2">
        <p className="text-zinc-500 dark:text-zinc-500 text-sm">
          El semáforo de activos no está disponible ahora.
        </p>
      </div>
    );
  }

  return (
    <section id="mercado" className="scroll-mt-14">
      <div className="flex items-end justify-between gap-3 mb-5">
        <div>
          <h2 className="text-[11px] font-semibold tracking-[0.14em] uppercase text-zinc-400 dark:text-zinc-600">
            Mercado en 30 segundos
          </h2>
          <p className="text-zinc-500 dark:text-zinc-500 text-sm mt-1">
            Semáforo de activos · tocá para ver el detalle
          </p>
        </div>
        <Link
          href="/archivo"
          className="flex items-center gap-1 text-[11px] font-medium text-zinc-400 dark:text-zinc-600 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          <Archive size={12} strokeWidth={1.75} />
          Archivo
        </Link>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left border-t border-zinc-200 dark:border-zinc-800 pt-5 group"
        aria-expanded={open}
      >
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5">
          {analisis.activos.map((activo) => (
            <span
              key={activo.id}
              className="inline-flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[activo.status] ?? "bg-zinc-400"}`}
              />
              <span className="font-medium tracking-tight">
                {ASSET_NAMES[activo.id] ?? activo.id}
              </span>
            </span>
          ))}
          <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            {open ? "Ocultar" : "Ver detalle"}
            <ChevronDown
              size={14}
              strokeWidth={2}
              className={`transition-transform ${open ? "rotate-180" : ""}`}
            />
          </span>
        </div>
        {analisis.contexto && !open && (
          <p className="text-zinc-500 dark:text-zinc-500 text-sm mt-4 leading-relaxed line-clamp-2">
            {analisis.contexto}
          </p>
        )}
      </button>

      {open && (
        <div className="mt-6 pt-2">
          <Semaforo analisis={analisis} historico={historico} historiales={historiales} />
        </div>
      )}
    </section>
  );
}

import { Brain } from "lucide-react";
import { AssetCard } from "./AssetCard";
import type { AnalisisResponse } from "@/lib/analisis";

export function Semaforo({ analisis }: { analisis: AnalisisResponse | null }) {
  if (!analisis || analisis.activos.length === 0) {
    return (
      <div className="rounded-2xl border border-black/[0.12] dark:border-white/5 bg-white/70 dark:bg-white/[0.02] p-6 text-center">
        <p className="text-gray-500 dark:text-white/40 text-sm">
          No pudimos cargar el análisis ahora. Volvé en unos minutos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-gray-500 dark:text-white/40 text-sm">
        Tocá cada activo para entender por qué.
      </p>

      {analisis.contexto && (
        <div className="rounded-xl border border-black/[0.12] dark:border-white/5 bg-white/70 dark:bg-white/[0.02] px-4 py-3 flex gap-3 items-start">
          <Brain size={22} className="flex-shrink-0 mt-0.5 text-gray-500 dark:text-white/40" strokeWidth={1.75} />
          <p className="text-gray-600 dark:text-white/60 text-sm leading-relaxed">
            {analisis.contexto}
            {analisis.stale && (
              <span className="ml-2 text-amber-500/60 dark:text-amber-400/60 text-xs">(datos anteriores)</span>
            )}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
        {analisis.activos.map((activo) => (
          <AssetCard key={activo.id} data={activo} />
        ))}
      </div>
    </div>
  );
}

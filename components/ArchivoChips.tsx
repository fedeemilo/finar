import Link from "next/link";
import { Archive } from "lucide-react";
import { fechaChipLabel, todayArg } from "@/lib/dates";

export function ArchivoChips({ fechas }: { fechas: string[] }) {
  const hoy = todayArg();
  const anteriores = fechas.filter((f) => f !== hoy);

  if (anteriores.length === 0) return null;

  return (
    <section className="rounded-2xl border border-black/[0.12] dark:border-white/5 bg-white/70 dark:bg-white/[0.02] p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-white/70">
          Ver días anteriores
        </h3>
        <Link
          href="/archivo"
          className="flex items-center gap-1 text-xs text-gray-500 dark:text-white/40 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          <Archive size={12} />
          Todo el archivo
        </Link>
      </div>
      <div className="flex flex-wrap gap-2">
        {anteriores.slice(0, 6).map((fecha) => (
          <Link
            key={fecha}
            href={`/archivo/${fecha}`}
            className="text-xs font-medium text-gray-600 dark:text-white/60 bg-black/[0.05] dark:bg-white/[0.05] hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:bg-emerald-400/10 dark:hover:text-emerald-300 px-3 py-1.5 rounded-full transition-colors capitalize"
          >
            {fechaChipLabel(fecha)}
          </Link>
        ))}
      </div>
    </section>
  );
}

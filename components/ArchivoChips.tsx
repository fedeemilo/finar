import Link from "next/link";
import { Archive } from "lucide-react";
import { fechaChipLabel, todayArg, daysFromTodayArg, MAX_CHIP_DAYS_AGO } from "@/lib/dates";

export function ArchivoChips({ fechas }: { fechas: string[] }) {
  // BD totalmente vacía → escondemos el bloque (caso muy temprano post-deploy)
  if (fechas.length === 0) return null;

  const hoy = todayArg();
  const anteriores = fechas
    .filter((f) => f !== hoy)
    .filter((f) => {
      const days = daysFromTodayArg(f);
      return days > 0 && days <= MAX_CHIP_DAYS_AGO;
    });
  const hayArchivoViejo = fechas.some((f) => {
    if (f === hoy) return false;
    return daysFromTodayArg(f) > MAX_CHIP_DAYS_AGO;
  });

  return (
    <section className="rounded-2xl border border-black/[0.12] dark:border-white/5 bg-white/70 dark:bg-white/[0.02] p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-white/70">
          {anteriores.length > 0 ? "Ver días anteriores" : "Archivo histórico"}
        </h3>
        <Link
          href="/archivo"
          className="flex items-center gap-1 text-xs text-gray-500 dark:text-white/40 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          <Archive size={12} />
          Todo el archivo
        </Link>
      </div>

      {anteriores.length > 0 ? (
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
      ) : hayArchivoViejo ? (
        <p className="text-xs text-gray-500 dark:text-white/40 leading-relaxed">
          Los últimos {MAX_CHIP_DAYS_AGO} días aparecen acá. Para fechas anteriores, usá el archivo completo.
        </p>
      ) : (
        <p className="text-xs text-gray-500 dark:text-white/40 leading-relaxed">
          Acá vas a poder revisar cómo cambia el semáforo día a día. Volvé mañana — el primer snapshot se archiva al cierre de hoy.
        </p>
      )}
    </section>
  );
}

import Link from "next/link";
import { Archive } from "lucide-react";
import { fechaChipLabel, todayArg, daysFromTodayArg, MAX_CHIP_DAYS_AGO } from "@/lib/dates";

const MAX_CHIPS = 4;

export function NoticiasArchivoChips({
  fechas,
  variant,
  fechaActual,
}: {
  fechas: string[];
  variant: "general" | "tech";
  fechaActual?: string;
}) {
  const exclude = fechaActual ?? todayArg();
  const hayArchivo = fechas.some((f) => f !== exclude);
  if (!hayArchivo) return null;

  const recientes = fechas
    .filter((f) => f !== exclude)
    .filter((f) => {
      const days = daysFromTodayArg(f);
      return days > 0 && days <= MAX_CHIP_DAYS_AGO;
    })
    .slice(0, MAX_CHIPS);

  const archiveIndex =
    variant === "tech" ? "/noticias/tech/archivo" : "/noticias/archivo";
  const archiveBase =
    variant === "tech" ? "/noticias/tech/archivo" : "/noticias/archivo";
  const accent =
    variant === "tech"
      ? "hover:bg-indigo-500/10 hover:text-indigo-700 dark:hover:bg-indigo-400/10 dark:hover:text-indigo-300"
      : "hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:bg-emerald-400/10 dark:hover:text-emerald-300";
  const linkAccent =
    variant === "tech"
      ? "text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
      : "text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300";

  return (
    <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center gap-x-3 gap-y-2">
        {recientes.length > 0 && (
          <>
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              {fechaActual ? "Otros días" : "Días anteriores"}
            </span>
            <div className="flex flex-wrap gap-1.5 items-center">
              {recientes.map((fecha) => (
                <Link
                  key={fecha}
                  href={`${archiveBase}/${fecha}`}
                  className={`text-[11px] font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/60 ${accent} px-2.5 py-1 rounded-full transition-colors capitalize`}
                >
                  {fechaChipLabel(fecha)}
                </Link>
              ))}
            </div>
          </>
        )}
        <Link
          href={archiveIndex}
          className={`${recientes.length > 0 ? "ml-auto" : ""} flex items-center gap-1 text-[11px] font-medium ${linkAccent} transition-colors`}
        >
          <Archive size={11} />
          Todo el archivo
        </Link>
      </div>
    </div>
  );
}

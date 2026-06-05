import Link from "next/link";
import { fechaChipLabel, todayArg } from "@/lib/dates";

export function NoticiasArchivoChips({
  fechas,
  variant,
  fechaActual,
}: {
  fechas: string[];
  variant: "general" | "tech";
  fechaActual?: string;
}) {
  // Si estamos en archivo, excluimos esa fecha (no linkeás a vos mismo).
  // Si estamos en live, excluimos hoy en ARG.
  const exclude = fechaActual ?? todayArg();
  const anteriores = fechas.filter((f) => f !== exclude);

  if (anteriores.length === 0) return null;

  const basePath = variant === "tech" ? "/noticias/tech/archivo" : "/noticias/archivo";
  const accent =
    variant === "tech"
      ? "hover:bg-indigo-500/10 hover:text-indigo-700 dark:hover:bg-indigo-400/10 dark:hover:text-indigo-300"
      : "hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:bg-emerald-400/10 dark:hover:text-emerald-300";

  return (
    <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-3 overflow-x-auto">
        <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex-shrink-0">
          {fechaActual ? "Otros días" : "Días anteriores"}
        </span>
        <div className="flex gap-1.5 items-center">
          {anteriores.slice(0, 7).map((fecha) => (
            <Link
              key={fecha}
              href={`${basePath}/${fecha}`}
              className={`text-[11px] font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/60 ${accent} px-2.5 py-1 rounded-full transition-colors whitespace-nowrap capitalize`}
            >
              {fechaChipLabel(fecha)}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

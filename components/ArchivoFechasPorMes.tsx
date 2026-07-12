import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { groupFechasByMonth, fechaDiaCorto, fechaChipLabel } from "@/lib/dates";

type Style = "home" | "noticias";

const STYLES: Record<
  Style,
  {
    details: string;
    summary: string;
    count: string;
    chevron: string;
    grid: string;
    link: string;
    linkHover: string;
  }
> = {
  home: {
    details: "rounded-xl border border-black/[0.12] dark:border-white/5 bg-white/70 dark:bg-white/[0.02] overflow-hidden",
    summary:
      "flex items-center justify-between gap-3 px-4 py-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden select-none",
    count: "text-gray-500 dark:text-white/40 text-xs",
    chevron: "text-gray-400 dark:text-white/30 transition-transform group-open:rotate-90",
    grid: "grid grid-cols-2 sm:grid-cols-3 gap-2 px-4 pb-4 pt-1",
    link: "text-gray-700 dark:text-white/70 bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/5",
    linkHover:
      "hover:bg-emerald-500/10 hover:text-emerald-700 hover:border-emerald-500/20 dark:hover:bg-emerald-400/10 dark:hover:text-emerald-300",
  },
  noticias: {
    details: "rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 overflow-hidden",
    summary:
      "flex items-center justify-between gap-3 px-4 py-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden select-none",
    count: "text-zinc-500 dark:text-zinc-500 text-xs",
    chevron: "text-zinc-400 dark:text-zinc-600 transition-transform group-open:rotate-90",
    grid: "grid grid-cols-2 sm:grid-cols-3 gap-2 px-4 pb-4 pt-1",
    link: "text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60",
    linkHover:
      "hover:bg-emerald-500/10 hover:text-emerald-700 hover:border-emerald-500/30 dark:hover:bg-emerald-400/10 dark:hover:text-emerald-300",
  },
};

const NOTICIAS_TECH_LINK_HOVER =
  "hover:bg-indigo-500/10 hover:text-indigo-700 hover:border-indigo-500/30 dark:hover:bg-indigo-400/10 dark:hover:text-indigo-300";

export function ArchivoFechasPorMes({
  fechas,
  baseHref,
  style,
  accent = "emerald",
}: {
  fechas: string[];
  baseHref: string;
  style: Style;
  accent?: "emerald" | "indigo";
}) {
  const groups = groupFechasByMonth(fechas);
  const s = STYLES[style];
  const linkHover = style === "noticias" && accent === "indigo" ? NOTICIAS_TECH_LINK_HOVER : s.linkHover;

  return (
    <div className="space-y-3">
      {groups.map((group, i) => (
        <details key={group.key} open={i === 0} className={`group ${s.details}`}>
          <summary className={s.summary}>
            <span className="text-base font-semibold capitalize text-inherit">
              {group.label}
            </span>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={s.count}>
                {group.fechas.length} {group.fechas.length === 1 ? "día" : "días"}
              </span>
              <ChevronRight size={14} className={s.chevron} />
            </div>
          </summary>
          <div className={s.grid}>
            {group.fechas.map((fecha) => (
              <Link
                key={fecha}
                href={`${baseHref}/${fecha}`}
                className={`text-xs font-medium px-3 py-2 rounded-lg transition-colors capitalize ${s.link} ${linkHover}`}
                title={fechaChipLabel(fecha)}
              >
                {fechaDiaCorto(fecha)}
              </Link>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}

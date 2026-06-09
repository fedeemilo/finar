import Link from "next/link";
import { ArrowLeft, Archive, Calendar } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NoticiasTabNav } from "@/components/NoticiasTabNav";
import { fechaLegibleArg, daysFromTodayArg } from "@/lib/dates";

type Variant = "general" | "tech";

const VARIANT_META: Record<
  Variant,
  {
    liveHref: string;
    archiveBase: string;
    title: string;
    description: string;
    accentHover: string;
    arrowHover: string;
  }
> = {
  general: {
    liveHref: "/noticias",
    archiveBase: "/noticias/archivo",
    title: "Archivo de noticias",
    description: "Todos los resúmenes diarios de noticias generales. Revisá qué pasó cada día.",
    accentHover: "hover:text-emerald-700 dark:hover:text-emerald-300",
    arrowHover: "group-hover:text-emerald-600 dark:group-hover:text-emerald-400",
  },
  tech: {
    liveHref: "/noticias/tech",
    archiveBase: "/noticias/tech/archivo",
    title: "Archivo tech",
    description: "Todos los resúmenes diarios de noticias tech: desarrollo, IA, seguridad e infra.",
    accentHover: "hover:text-indigo-700 dark:hover:text-indigo-300",
    arrowHover: "group-hover:text-indigo-600 dark:group-hover:text-indigo-400",
  },
};

function diasDesdeHoyTexto(fecha: string): string {
  const diff = daysFromTodayArg(fecha);
  if (diff === 0) return "Hoy";
  if (diff === 1) return "Ayer";
  return `hace ${diff} días`;
}

export function NoticiasArchivoIndex({
  fechas,
  variant,
}: {
  fechas: string[];
  variant: Variant;
}) {
  const meta = VARIANT_META[variant];

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link
            href={meta.liveHref}
            className={`flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 ${meta.accentHover} transition-colors text-sm font-medium`}
          >
            <ArrowLeft size={14} />
            Volver al día actual
          </Link>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-amber-700 dark:text-amber-300 bg-amber-200/70 dark:bg-amber-500/15 px-2 py-0.5 rounded">
              <Archive size={10} strokeWidth={2.5} />
              Archivo
            </span>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <NoticiasTabNav active={variant} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <section className="text-center pt-2">
          <Calendar
            size={36}
            className="mx-auto mb-4 text-zinc-300 dark:text-zinc-700"
            strokeWidth={1.5}
          />
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-white mb-3">
            {meta.title}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-500 text-base max-w-md mx-auto leading-relaxed">
            {meta.description}
          </p>
        </section>

        {fechas.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 p-8 text-center">
            <p className="text-zinc-500 dark:text-zinc-500 text-sm leading-relaxed">
              Todavía no hay días archivados. El primer snapshot aparece después de la primera corrida del cron.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {fechas.map((fecha) => (
              <li key={fecha}>
                <Link
                  href={`${meta.archiveBase}/${fecha}`}
                  className="group flex items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:bg-zinc-50 dark:hover:bg-zinc-900 px-5 py-4 transition-colors"
                >
                  <div>
                    <p className="text-zinc-900 dark:text-white font-semibold text-base capitalize">
                      {fechaLegibleArg(fecha)}
                    </p>
                    <p className="text-zinc-500 dark:text-zinc-500 text-xs mt-0.5">
                      {diasDesdeHoyTexto(fecha)}
                    </p>
                  </div>
                  <span
                    className={`text-zinc-400 dark:text-zinc-600 ${meta.arrowHover} transition-colors text-sm`}
                  >
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

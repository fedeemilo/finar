import Link from "next/link";
import { ArrowLeft, Archive, Calendar } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { loadAvailableDates } from "@/lib/db";
import { fechaLegibleArg, daysFromTodayArg } from "@/lib/dates";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "FinAR · Archivo histórico",
  description: "Todos los días con análisis disponible. Mirá cómo se veía el mercado argentino día por día según FinAR.",
};

function diasDesdeHoyTexto(fecha: string): string {
  const diff = daysFromTodayArg(fecha);
  if (diff === 0) return "Hoy";
  if (diff === 1) return "Ayer";
  return `hace ${diff} días`;
}

export default async function ArchivoIndexPage() {
  const fechas = await loadAvailableDates(60);

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(180deg, var(--bg-start) 0%, var(--bg-end) 100%)" }}
    >
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-amber-500/40 dark:border-amber-400/20 bg-amber-50/70 dark:bg-amber-950/20">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-gray-600 dark:text-white/60 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-xs font-medium"
          >
            <ArrowLeft size={14} />
            <span>Volver al hoy</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-amber-700 dark:text-amber-300 bg-amber-200/70 dark:bg-amber-500/15 px-2 py-0.5 rounded">
              <Archive size={10} strokeWidth={2.5} />
              Archivo
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        <section className="text-center pt-4">
          <Calendar size={36} className="mx-auto mb-4 text-gray-400 dark:text-white/30" strokeWidth={1.5} />
          <h1 className="text-3xl sm:text-4xl font-black text-gray-800 dark:text-white tracking-tight mb-3">
            Archivo histórico
          </h1>
          <p className="text-gray-600 dark:text-white/50 text-base max-w-md mx-auto leading-relaxed">
            Mirá cómo se veía el mercado argentino día por día según FinAR.
          </p>
        </section>

        {fechas.length === 0 ? (
          <div className="rounded-2xl border border-black/[0.12] dark:border-white/5 bg-white/70 dark:bg-white/[0.02] p-8 text-center">
            <p className="text-gray-500 dark:text-white/40 text-sm">
              Todavía no hay días archivados. Volvé mañana — el primer snapshot aparece después de la primera corrida del cron.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {fechas.map((fecha) => (
              <li key={fecha}>
                <Link
                  href={`/archivo/${fecha}`}
                  className="flex items-center justify-between rounded-xl border border-black/[0.12] dark:border-white/5 bg-white/70 dark:bg-white/[0.02] hover:bg-white dark:hover:bg-white/[0.05] px-5 py-4 transition-colors group"
                >
                  <div>
                    <p className="text-gray-800 dark:text-white/90 font-semibold text-base capitalize">
                      {fechaLegibleArg(fecha)}
                    </p>
                    <p className="text-gray-500 dark:text-white/40 text-xs mt-0.5">
                      {diasDesdeHoyTexto(fecha)}
                    </p>
                  </div>
                  <span className="text-gray-400 dark:text-white/30 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors text-sm">
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

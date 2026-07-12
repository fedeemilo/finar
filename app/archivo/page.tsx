import Link from "next/link";
import { ArrowLeft, Archive, Calendar } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { loadAvailableDates } from "@/lib/db";
import { ArchivoFechasPorMes } from "@/components/ArchivoFechasPorMes";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "FinAR · Archivo histórico",
  description: "Todos los días con análisis disponible. Mirá cómo se veía el mercado argentino día por día según FinAR.",
};

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
          <ArchivoFechasPorMes fechas={fechas} baseHref="/archivo" style="home" />
        )}
      </main>
    </div>
  );
}

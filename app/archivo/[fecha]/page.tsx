import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Archive } from "lucide-react";
import { Semaforo } from "@/components/Semaforo";
import { NoticiasSection } from "@/components/NoticiasSection";
import { ThemeToggle } from "@/components/ThemeToggle";
import { loadSnapshotByDate } from "@/lib/db";
import { fechaLegibleArg } from "@/lib/dates";
import type { AnalisisResponse } from "@/lib/analisis";
import type { Noticia } from "@/lib/noticias";

export const dynamic = "force-dynamic";

const FECHA_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export async function generateMetadata({ params }: { params: { fecha: string } }) {
  if (!FECHA_REGEX.test(params.fecha)) return {};
  const fechaLegible = fechaLegibleArg(params.fecha);
  return {
    title: `FinAR · Archivo del ${fechaLegible}`,
    description: `Cómo se veía el mercado argentino el ${fechaLegible} según el análisis de FinAR: veredictos sobre Dólar MEP, Blue, CEDEARs, cripto y oro.`,
  };
}

export default async function ArchivoFechaPage({ params }: { params: { fecha: string } }) {
  if (!FECHA_REGEX.test(params.fecha)) notFound();

  const [analisisSnapshot, noticiasSnapshot] = await Promise.all([
    loadSnapshotByDate<AnalisisResponse>("analisis", params.fecha),
    loadSnapshotByDate<Noticia[]>("noticias-home", params.fecha),
  ]);

  if (!analisisSnapshot && !noticiasSnapshot) notFound();

  const analisis = analisisSnapshot?.payload ?? null;
  const noticias = noticiasSnapshot?.payload ?? null;
  const fechaLegible = fechaLegibleArg(params.fecha);

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(180deg, var(--bg-start) 0%, var(--bg-end) 100%)" }}
    >
      {/* Sticky header con badge ARCHIVO — color ámbar para diferenciar del home */}
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

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-12">
        {/* Hero */}
        <section className="text-center pt-4">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-800 dark:text-white tracking-tight mb-3 capitalize">
            {fechaLegible}
          </h1>
          <p className="text-gray-600 dark:text-white/50 text-base max-w-md mx-auto leading-relaxed">
            Cómo se veía el mercado argentino ese día. Snapshot del análisis y las noticias.
          </p>
        </section>

        {/* Semáforo */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-gray-800 dark:text-white font-bold text-lg">Semáforo de activos</h2>
            <div className="flex gap-1 items-center ml-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="w-2 h-2 rounded-full bg-red-400" />
            </div>
          </div>
          <Semaforo analisis={analisis} />
        </section>

        {/* Divider */}
        <div className="border-t border-black/[0.12] dark:border-white/5" />

        {/* Noticias */}
        <section>
          <h2 className="text-gray-800 dark:text-white font-bold text-lg mb-1">
            Qué pasaba en el mundo financiero
          </h2>
          <p className="text-gray-500 dark:text-white/40 text-sm mb-5">
            Lo más relevante de ese día, resumido en dos oraciones.
          </p>
          <NoticiasSection noticias={noticias} />
        </section>

        {/* CTA volver al hoy */}
        <section className="rounded-2xl border border-emerald-400/30 dark:border-emerald-400/20 bg-emerald-50/70 dark:bg-emerald-900/10 p-6 text-center">
          <p className="text-gray-700 dark:text-white/70 text-sm mb-3">
            ¿Y hoy cómo está el panorama?
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-sm font-semibold hover:underline"
          >
            Ver el análisis actual →
          </Link>
        </section>

        {/* Footer */}
        <footer className="text-center pb-8 space-y-3">
          <p className="text-gray-500 dark:text-white/20 text-xs max-w-md mx-auto">
            Este es un snapshot histórico. Los veredictos y noticias reflejan el estado del mercado el {fechaLegible}, no la situación actual.
          </p>
          <p className="text-gray-400 dark:text-white/20 text-xs">
            <Link href="/archivo" className="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">
              Ver todos los días disponibles →
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
}

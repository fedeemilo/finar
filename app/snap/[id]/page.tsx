import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Camera } from "lucide-react";
import { Semaforo } from "@/components/Semaforo";
import { NoticiasSection } from "@/components/NoticiasSection";
import { ThemeToggle } from "@/components/ThemeToggle";
import { loadSnapshotById, loadSnapshotByDate } from "@/lib/db";
import { fechaLegibleArg } from "@/lib/dates";
import type { AnalisisResponse } from "@/lib/analisis";
import type { Noticia } from "@/lib/noticias";

export const dynamic = "force-dynamic";

function parseId(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null;
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function fechaArgFromIso(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function horaArgFromIso(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  });
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const id = parseId(params.id);
  if (id === null) return {};

  const snap = await loadSnapshotById<AnalisisResponse>(id);
  if (!snap || snap.kind !== "analisis") return {};

  const fechaLegible = fechaLegibleArg(fechaArgFromIso(snap.capturedAt));
  const hora = horaArgFromIso(snap.capturedAt);
  const greens = snap.payload.activos.filter((a) => a.status === "green").length;
  const reds = snap.payload.activos.filter((a) => a.status === "red").length;

  return {
    title: `FinAR · Semáforo del ${fechaLegible} (${hora})`,
    description: `${greens} activos en verde, ${reds} en rojo. ${snap.payload.contexto}`,
    openGraph: {
      title: `FinAR · Semáforo del ${fechaLegible}`,
      description: snap.payload.contexto,
      type: "article",
    },
  };
}

export default async function SnapshotPage({ params }: { params: { id: string } }) {
  const id = parseId(params.id);
  if (id === null) notFound();

  const snap = await loadSnapshotById<AnalisisResponse>(id);
  if (!snap || snap.kind !== "analisis") notFound();

  // Noticias del mismo día en ARG (para mostrar contexto completo del momento)
  const fechaArg = fechaArgFromIso(snap.capturedAt);
  const noticiasSnapshot = await loadSnapshotByDate<Noticia[]>("noticias-home", fechaArg);

  const analisis = snap.payload;
  const noticias = noticiasSnapshot?.payload ?? null;
  const fechaLegible = fechaLegibleArg(fechaArg);
  const hora = horaArgFromIso(snap.capturedAt);

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(180deg, var(--bg-start) 0%, var(--bg-end) 100%)" }}
    >
      {/* Sticky header con badge SNAPSHOT — color emerald para diferenciar del archivo (ámbar) */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-emerald-500/40 dark:border-emerald-400/20 bg-emerald-50/70 dark:bg-emerald-950/20">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-gray-600 dark:text-white/60 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-xs font-medium"
          >
            <ArrowLeft size={14} />
            <span>Ver el hoy</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-emerald-700 dark:text-emerald-300 bg-emerald-200/70 dark:bg-emerald-500/15 px-2 py-0.5 rounded">
              <Camera size={10} strokeWidth={2.5} />
              Snapshot
            </span>
            <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">{hora}</span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-12">
        {/* Hero */}
        <section className="text-center pt-4">
          <p className="text-[10px] uppercase tracking-widest font-bold text-emerald-600 dark:text-emerald-400 mb-2">
            Semáforo capturado
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-800 dark:text-white tracking-tight mb-3 capitalize">
            {fechaLegible}
          </h1>
          <p className="text-gray-600 dark:text-white/50 text-base max-w-md mx-auto leading-relaxed">
            Snapshot del análisis a las {hora} (ARG). Compartilo como una foto del momento.
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

        {noticias && noticias.length > 0 && (
          <>
            <div className="border-t border-black/[0.12] dark:border-white/5" />
            <section>
              <h2 className="text-gray-800 dark:text-white font-bold text-lg mb-1">
                Noticias del día
              </h2>
              <p className="text-gray-500 dark:text-white/40 text-sm mb-5">
                Contexto del mercado el {fechaLegible.split(",")[1]?.trim() ?? fechaLegible}.
              </p>
              <NoticiasSection noticias={noticias} />
            </section>
          </>
        )}

        {/* CTA volver al hoy */}
        <section className="rounded-2xl border border-emerald-400/30 dark:border-emerald-400/20 bg-emerald-50/70 dark:bg-emerald-900/10 p-6 text-center">
          <p className="text-gray-700 dark:text-white/70 text-sm mb-3">
            ¿Y ahora cómo está el panorama?
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-sm font-semibold hover:underline"
          >
            Ver el análisis actual →
          </Link>
        </section>

        {/* Footer */}
        <footer className="text-center pb-8">
          <p className="text-gray-500 dark:text-white/20 text-xs max-w-md mx-auto">
            Snapshot fijo. Los veredictos reflejan el análisis a las {hora} del {fechaLegible}.
          </p>
        </footer>
      </main>
    </div>
  );
}

import Link from "next/link";
import { Semaforo } from "@/components/Semaforo";
import { NoticiasSection } from "@/components/NoticiasSection";
import { Recomendador } from "@/components/Recomendador";
import { GlosarioTooltip } from "@/components/GlosarioTooltip";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Newspaper } from "lucide-react";
import { getCached, setCache } from "@/lib/redis";
import {
  generarAnalisis,
  CACHE_KEY as ANALISIS_CACHE,
  STALE_KEY as ANALISIS_STALE,
  TTL as ANALISIS_TTL,
  STALE_TTL as ANALISIS_STALE_TTL,
  type AnalisisResponse,
} from "@/lib/analisis";
import {
  generarNoticias,
  CACHE_KEY as NOTICIAS_CACHE,
  STALE_KEY as NOTICIAS_STALE,
  TTL as NOTICIAS_TTL,
  STALE_TTL as NOTICIAS_STALE_TTL,
  type Noticia,
} from "@/lib/noticias";

export const dynamic = "force-dynamic";

async function loadAnalisis(): Promise<AnalisisResponse | null> {
  const fresh = await getCached<AnalisisResponse>(ANALISIS_CACHE);
  if (fresh) return fresh;

  const stale = await getCached<AnalisisResponse>(ANALISIS_STALE);
  if (stale) return { ...stale, stale: true };

  try {
    const { analisis } = await generarAnalisis();
    await Promise.all([
      setCache(ANALISIS_CACHE, analisis, ANALISIS_TTL),
      setCache(ANALISIS_STALE, analisis, ANALISIS_STALE_TTL),
    ]);
    return analisis;
  } catch (err) {
    console.error("Home: fallback on-demand de análisis falló", err);
    return null;
  }
}

async function loadNoticias(): Promise<Noticia[] | null> {
  const fresh = await getCached<Noticia[]>(NOTICIAS_CACHE);
  if (fresh) return fresh;

  const stale = await getCached<Noticia[]>(NOTICIAS_STALE);
  if (stale) return stale;

  try {
    const noticias = await generarNoticias();
    await Promise.all([
      setCache(NOTICIAS_CACHE, noticias, NOTICIAS_TTL),
      setCache(NOTICIAS_STALE, noticias, NOTICIAS_STALE_TTL),
    ]);
    return noticias;
  } catch (err) {
    console.error("Home: fallback on-demand de noticias falló", err);
    return null;
  }
}

function formatHoraArg(iso?: string): string {
  const date = iso ? new Date(iso) : new Date();
  return date.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  });
}

function LastUpdated({ timestamp }: { timestamp?: string }) {
  return (
    <span className="text-gray-500 dark:text-white/30 text-xs">
      Actualizado: {formatHoraArg(timestamp)}
    </span>
  );
}

export default async function Home() {
  const [analisis, noticias] = await Promise.all([loadAnalisis(), loadNoticias()]);

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(180deg, var(--bg-start) 0%, var(--bg-end) 100%)" }}
    >
      {/* Sticky header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-black/[0.12] dark:border-white/5">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight text-gray-800 dark:text-white">
              Fin
              <span
                style={{
                  background: "linear-gradient(135deg, #00c896, #00e6aa)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                AR
              </span>
            </span>
            <span className="text-[10px] text-gray-500 dark:text-white/30 bg-black/[0.08] dark:bg-white/5 px-1.5 py-0.5 rounded-md font-medium">
              BETA
            </span>
          </div>
          <div className="flex items-center gap-3">
            <LastUpdated timestamp={analisis?.timestamp} />
            <Link
              href="/noticias"
              className="flex items-center gap-1.5 text-stone-500 dark:text-white/40 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-xs font-medium"
            >
              <Newspaper size={14} />
              Noticias
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-12">
        {/* Hero */}
        <section className="text-center pt-4">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-800 dark:text-white tracking-tight mb-3">
            ¿En qué me conviene{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #00c896, #00e6aa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              invertir hoy?
            </span>
          </h1>
          <p className="text-gray-600 dark:text-white/50 text-base max-w-sm mx-auto leading-relaxed">
            Tu amigo que sabe de finanzas te explica en simple. Sin jerga, sin
            gráficos raros.
          </p>
        </section>

        {/* Semáforo de activos */}
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

        {/* Recomendador */}
        <section>
          <h2 className="text-gray-800 dark:text-white font-bold text-lg mb-1">
            Tengo plata. ¿Qué hago?
          </h2>
          <p className="text-gray-500 dark:text-white/40 text-sm mb-5">
            Ingresá tu monto y te armamos una recomendación personalizada.
          </p>
          <Recomendador />
        </section>

        {/* Divider */}
        <div className="border-t border-black/[0.12] dark:border-white/5" />

        {/* Noticias */}
        <section>
          <h2 className="text-gray-800 dark:text-white font-bold text-lg mb-1">
            Qué pasa en el mundo financiero
          </h2>
          <p className="text-gray-500 dark:text-white/40 text-sm mb-5">
            Lo más relevante, resumido en dos oraciones. Sin tecnicismos.
          </p>
          <NoticiasSection noticias={noticias} />
        </section>

        {/* Glosario CTA */}
        <section className="rounded-2xl border border-black/[0.12] dark:border-white/5 bg-white/70 dark:bg-white/[0.02] p-6 text-center">
          <p className="text-gray-600 dark:text-white/50 text-sm mb-2">
            ¿Ves alguna palabra que no entendés?
          </p>
          <p className="text-gray-500 dark:text-white/30 text-xs">
            Cualquier término financiero en la app tiene un{" "}
            <span className="text-emerald-500 dark:text-emerald-400 font-medium">?</span> al lado.
            Tocalo para ver qué significa.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {["MEP", "CEDEAR", "CCL", "Plazo Fijo", "USDT"].map((term) => (
              <GlosarioTooltip key={term} term={term.replace(" ", "_")}>
                <span className="text-gray-600 dark:text-white/50 text-sm">{term}</span>
              </GlosarioTooltip>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center pb-8 space-y-3">
          <p className="text-gray-500 dark:text-white/20 text-xs">
            FinAR no es asesoramiento financiero formal. Siempre consultá con un
            profesional antes de invertir.
          </p>
          <p className="flex items-center justify-center gap-1 text-gray-400 dark:text-white/20 text-xs">
            Hecho con
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-red-400 dark:text-red-400/60">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
            </svg>
            por
            <a
              href="https://fedmilo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 dark:text-white/30 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors font-medium"
            >
              fedmilo
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}

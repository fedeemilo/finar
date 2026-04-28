import { getCached } from "@/lib/redis";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Zap, Newspaper, Clock } from "lucide-react";
import { NoticiaImagenFallback } from "@/components/NoticiaImagenFallback";
import { ThemeToggle } from "@/components/ThemeToggle";

export const dynamic = "force-dynamic";

interface NoticiaItem {
  titulo: string;
  descripcion: string;
  fuente: string;
  url: string;
  imagen: string;
}

interface NoticiasData {
  fecha: string;
  resumen: string;
  top3: NoticiaItem[];
  tendencias: string[];
  conclusion: string;
}

function formatFecha(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function EmptyState() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <Newspaper size={48} className="mx-auto mb-4 text-zinc-300 dark:text-zinc-700" strokeWidth={1.5} />
        <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200 mb-2">
          Todavía no hay noticias hoy
        </h2>
        <p className="text-zinc-500 dark:text-zinc-500 text-sm leading-relaxed mb-6">
          El resumen diario se genera a las 9am. Volvé más tarde.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-medium hover:underline"
        >
          <ArrowLeft size={14} />
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

export default async function NoticiasPage() {
  const data = await getCached<NoticiasData>("noticias:diarias");
  if (!data) return <EmptyState />;

  const [hero, ...secondary] = data.top3;
  const fechaLegible = formatFecha(data.fecha);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">

      {/* ── Top nav ── */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft size={14} />
            FinAR
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-zinc-500 dark:text-zinc-500 text-xs">
              <Clock size={11} />
              <span>Actualizado 9am</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* ── Masthead editorial ── */}
      <div className="border-b-[3px] border-zinc-900 dark:border-white bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-white leading-none">
              El día en noticias
            </h1>
            <p className="text-zinc-500 dark:text-zinc-500 text-sm mt-2 capitalize">{fechaLegible}</p>
          </div>
          <div className="hidden sm:block text-right text-xs text-zinc-500 dark:text-zinc-500 leading-relaxed flex-shrink-0">
            <p className="font-medium text-zinc-700 dark:text-zinc-300">5 fuentes · Análisis IA</p>
            <p>LN · Ámbito · BBC · Perfil · Clarín</p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* ── HERO: primera noticia, formato portada ── */}
        <section className="mb-10">
          <a
            href={hero.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block"
          >
            <div className="relative h-[340px] sm:h-[500px] overflow-hidden bg-zinc-800">
              <div className="absolute inset-0">
                <NoticiaImagenFallback
                  imagen={hero.imagen}
                  titulo={hero.titulo}
                  fuente={hero.fuente}
                />
              </div>
              {/* Gradient overlay — más denso abajo para legibilidad */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/10" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
                <span className="inline-block bg-emerald-500 text-white text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 mb-4">
                  {hero.fuente}
                </span>
                <h2 className="text-white text-2xl sm:text-4xl font-black leading-tight mb-3 group-hover:text-emerald-300 transition-colors duration-200 max-w-4xl">
                  {hero.titulo}
                </h2>
                <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-3xl line-clamp-2 sm:line-clamp-3">
                  {hero.descripcion}
                </p>
                <div className="flex items-center gap-1.5 mt-5 text-white/50 text-xs">
                  <ExternalLink size={11} />
                  <span>Leer nota completa</span>
                </div>
              </div>
            </div>
          </a>
        </section>

        {/* ── NOTICIAS SECUNDARIAS: grid 2 columnas ── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-8 pb-10 mb-10 border-b border-zinc-200 dark:border-zinc-800">
          {secondary.map((noticia, i) => (
            <a
              key={i}
              href={noticia.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col"
            >
              <div className="h-52 overflow-hidden bg-zinc-100 dark:bg-zinc-800 mb-4 flex-shrink-0">
                <div className="w-full h-full transition-transform duration-300 group-hover:scale-[1.03]">
                  <NoticiaImagenFallback
                    imagen={noticia.imagen}
                    titulo={noticia.titulo}
                    fuente={noticia.fuente}
                  />
                </div>
              </div>

              <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400 mb-2">
                {noticia.fuente}
              </span>

              <h3 className="text-zinc-900 dark:text-white font-bold text-xl leading-snug mb-3 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors duration-200">
                {noticia.titulo}
              </h3>

              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed flex-1">
                {noticia.descripcion}
              </p>

              <div className="flex items-center gap-1.5 mt-4 text-zinc-500 dark:text-zinc-500 text-xs">
                <ExternalLink size={11} />
                <span>Leer nota completa</span>
              </div>
            </a>
          ))}
        </section>

        {/* ── BLOQUE INFERIOR: resumen + tendencias + conclusión ── */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-12">

          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-10">

            {/* Resumen ejecutivo */}
            <div>
              <h2 className="text-[10px] font-bold tracking-widest uppercase text-zinc-500 dark:text-zinc-500 pb-2 mb-4 border-b-2 border-zinc-900 dark:border-white">
                Resumen ejecutivo
              </h2>
              <p className="text-zinc-700 dark:text-zinc-300 text-lg leading-relaxed">
                {data.resumen}
              </p>
            </div>

            {/* Tendencias */}
            <div>
              <h2 className="text-[10px] font-bold tracking-widest uppercase text-zinc-500 dark:text-zinc-500 pb-2 mb-6 border-b-2 border-zinc-900 dark:border-white">
                Tendencias del día
              </h2>
              <div className="space-y-6">
                {data.tendencias.map((tendencia, i) => (
                  <div key={i} className="flex gap-5 items-start">
                    {/* Número decorativo — ghost element intencional en ambos modos */}
                    <span className="text-5xl font-black text-zinc-200 dark:text-zinc-800 leading-none flex-shrink-0 select-none w-10 text-right">
                      {i + 1}
                    </span>
                    <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed pt-2">
                      {tendencia}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar: conclusión + créditos */}
          <div className="lg:border-l lg:border-zinc-200 lg:dark:border-zinc-800 lg:pl-10">
            <h2 className="text-[10px] font-bold tracking-widest uppercase text-zinc-500 dark:text-zinc-500 pb-2 mb-4 border-b-2 border-zinc-900 dark:border-white">
              Conclusión clave
            </h2>

            <div className="bg-zinc-900 dark:bg-zinc-800 p-6">
              <Zap size={18} className="text-emerald-400 mb-4" />
              <p className="text-white font-semibold text-base leading-relaxed">
                {data.conclusion}
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
              <p className="text-zinc-500 dark:text-zinc-500 text-xs leading-relaxed">
                Resumen generado diariamente con Claude Opus. Fuentes: La Nación, Ámbito Financiero, BBC Mundo, Perfil y Clarín.
              </p>
              <p className="text-zinc-500 dark:text-zinc-600 text-xs leading-relaxed">
                FinAR no es un medio de comunicación. Este análisis es generado por IA y puede contener errores.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <div className="border-t-[3px] border-zinc-900 dark:border-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
          <Link
            href="/"
            className="text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-sm font-medium"
          >
            ← Volver a FinAR
          </Link>
          <span className="text-zinc-500 dark:text-zinc-500 text-xs capitalize">
            {fechaLegible}
          </span>
        </div>
      </div>
    </div>
  );
}

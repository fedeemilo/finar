import { getCached } from "@/lib/redis";
import Link from "next/link";
import { ArrowLeft, ExternalLink, TrendingUp, Zap, Newspaper } from "lucide-react";
import { NoticiaImagenFallback } from "@/components/NoticiaImagenFallback";

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
    <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <Newspaper size={48} className="mx-auto mb-4 text-stone-300 dark:text-zinc-600" strokeWidth={1.5} />
        <h2 className="text-xl font-bold text-stone-700 dark:text-zinc-300 mb-2">
          Todavía no hay noticias hoy
        </h2>
        <p className="text-stone-500 dark:text-zinc-500 text-sm leading-relaxed mb-6">
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

  const fechaLegible = formatFecha(data.fecha);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-stone-50/90 dark:bg-zinc-950/90 backdrop-blur-xl border-b border-stone-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-stone-500 dark:text-zinc-400 hover:text-stone-800 dark:hover:text-zinc-200 transition-colors text-sm font-medium"
          >
            <ArrowLeft size={15} />
            FinAR
          </Link>
          <span className="text-stone-400 dark:text-zinc-600 text-xs capitalize">{fechaLegible}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-10">

        {/* Hero */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-400/10 px-2 py-1 rounded-full">
              Resumen diario
            </span>
            <span className="text-stone-400 dark:text-zinc-600 text-xs">· 9am</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-zinc-100 tracking-tight leading-tight mb-6">
            El día en noticias
          </h1>

          {/* Resumen ejecutivo */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 p-6 shadow-sm">
            <p className="text-[10px] font-bold tracking-widest uppercase text-stone-400 dark:text-zinc-500 mb-3">
              Resumen ejecutivo
            </p>
            <p className="text-stone-700 dark:text-zinc-300 text-base sm:text-lg leading-relaxed font-medium">
              {data.resumen}
            </p>
          </div>
        </section>

        {/* Top 3 noticias */}
        <section>
          <h2 className="text-[10px] font-bold tracking-widest uppercase text-stone-400 dark:text-zinc-500 mb-4">
            Las 3 más importantes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {data.top3.map((noticia, i) => (
              <a
                key={i}
                href={noticia.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-md hover:border-stone-300 dark:hover:border-zinc-700 transition-all duration-200 flex flex-col"
              >
                {/* Imagen */}
                <div className="h-44 overflow-hidden flex-shrink-0">
                  <NoticiaImagenFallback
                    imagen={noticia.imagen}
                    titulo={noticia.titulo}
                    fuente={noticia.fuente}
                  />
                </div>

                {/* Contenido */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold tracking-wide uppercase text-stone-400 dark:text-zinc-500">
                      {noticia.fuente}
                    </span>
                    <ExternalLink
                      size={12}
                      className="text-stone-300 dark:text-zinc-600 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors"
                    />
                  </div>
                  <h3 className="text-stone-900 dark:text-zinc-100 font-bold text-sm leading-snug mb-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                    {noticia.titulo}
                  </h3>
                  <p className="text-stone-500 dark:text-zinc-400 text-xs leading-relaxed flex-1">
                    {noticia.descripcion}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Tendencias */}
        <section>
          <h2 className="text-[10px] font-bold tracking-widest uppercase text-stone-400 dark:text-zinc-500 mb-4">
            Tendencias del día
          </h2>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm divide-y divide-stone-100 dark:divide-zinc-800">
            {data.tendencias.map((tendencia, i) => (
              <div key={i} className="flex items-start gap-3 p-4">
                <TrendingUp
                  size={15}
                  className="text-emerald-500 dark:text-emerald-400 mt-0.5 flex-shrink-0"
                />
                <p className="text-stone-600 dark:text-zinc-400 text-sm leading-relaxed">
                  {tendencia}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Conclusión */}
        <section>
          <div className="bg-zinc-900 dark:bg-zinc-800 rounded-2xl p-6 flex gap-4">
            <Zap size={20} className="text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-zinc-500 mb-2">
                Conclusión clave
              </p>
              <p className="text-zinc-100 font-semibold text-base leading-relaxed">
                {data.conclusion}
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center pb-6">
          <p className="text-stone-400 dark:text-zinc-600 text-xs">
            Resumen generado automáticamente con Claude · Fuentes: La Nación, Ámbito, BBC Mundo, Perfil, Clarín
          </p>
        </footer>
      </main>
    </div>
  );
}

import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Zap,
  Newspaper,
  Code2,
  Clock,
  Archive,
  type LucideIcon,
} from "lucide-react";
import { NoticiaImagenFallback } from "@/components/NoticiaImagenFallback";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NoticiasTabNav } from "@/components/NoticiasTabNav";
import { NoticiasArchivoChips } from "@/components/NoticiasArchivoChips";
import { fechaLegibleArg } from "@/lib/dates";

interface NoticiaItem {
  titulo: string;
  descripcion: string;
  fuente?: string;
  categoria?: string;
  url: string;
  imagen: string;
}

const CATEGORIA_LABELS: Record<string, string> = {
  framework: "Framework",
  ai: "IA",
  security: "Seguridad",
  infra: "Infra",
  devops: "DevOps",
  industry: "Industria",
  opensource: "Open Source",
  hardware: "Hardware",
  politica: "Política",
  economia: "Economía",
  sociedad: "Sociedad",
  internacional: "Internacional",
  geopolitica: "Geopolítica",
  ciencia: "Ciencia",
  cultura: "Cultura",
  deportes: "Deportes",
  clima: "Clima",
  tecnologia: "Tecnología",
};

function noticiaFuente(noticia: NoticiaItem): string {
  if (noticia.fuente) return noticia.fuente;
  if (noticia.categoria) {
    return CATEGORIA_LABELS[noticia.categoria] ?? noticia.categoria;
  }
  try {
    return new URL(noticia.url).hostname.replace(/^www\./, "");
  } catch {
    return "Fuente";
  }
}

export interface NoticiasData {
  fecha: string;
  resumen: string;
  top3: NoticiaItem[];
  tendencias: string[];
  conclusion: string;
}

type Variant = "general" | "tech";

interface VariantMeta {
  liveHref: string;
  liveTitle: string;
  archiveTitle: string;
  sources: string;
  sourcesCredits: string;
  emptyHora: string;
  emptyIcon: LucideIcon;
  emptyTitle: string;
  // Tailwind classes específicas por variante
  badgeBg: string;          // bg de la badge de fuente en hero
  cardSourceText: string;   // texto fuente en cards secundarias
  cardTitleHover: string;   // hover de título en cards secundarias
  heroTitleHover: string;   // hover de título en hero
  zapColor: string;         // color del icono Zap
  emptyAccent: string;      // color del link "Volver al inicio" en EmptyState
}

const VARIANTS: Record<Variant, VariantMeta> = {
  general: {
    liveHref: "/noticias",
    liveTitle: "El día en noticias",
    archiveTitle: "El día en noticias",
    sources: "LN · Ámbito · BBC · Perfil · Clarín",
    sourcesCredits: "La Nación, Ámbito Financiero, BBC Mundo, Perfil y Clarín",
    emptyHora: "9am",
    emptyIcon: Newspaper,
    emptyTitle: "Todavía no hay noticias hoy",
    badgeBg: "bg-emerald-500",
    cardSourceText: "text-emerald-600 dark:text-emerald-400",
    cardTitleHover: "group-hover:text-emerald-700 dark:group-hover:text-emerald-300",
    heroTitleHover: "group-hover:text-emerald-300",
    zapColor: "text-emerald-400",
    emptyAccent: "text-emerald-600 dark:text-emerald-400",
  },
  tech: {
    liveHref: "/noticias/tech",
    liveTitle: "Tech del día",
    archiveTitle: "Tech del día",
    sources: "HN · dev.to · GitHub · Next.js · TechCrunch",
    sourcesCredits: "Hacker News, dev.to, GitHub Blog, Next.js y TechCrunch",
    emptyHora: "9:30am",
    emptyIcon: Code2,
    emptyTitle: "Todavía no hay noticias tech hoy",
    badgeBg: "bg-indigo-500",
    cardSourceText: "text-indigo-600 dark:text-indigo-400",
    cardTitleHover: "group-hover:text-indigo-700 dark:group-hover:text-indigo-300",
    heroTitleHover: "group-hover:text-indigo-300",
    zapColor: "text-indigo-400",
    emptyAccent: "text-indigo-600 dark:text-indigo-400",
  },
};

export function NoticiasDiariasLayout({
  data,
  variant,
  archivoFecha,
  fechasDisponibles,
}: {
  data: NoticiasData | null;
  variant: Variant;
  archivoFecha?: string;
  fechasDisponibles?: string[];
}) {
  const meta = VARIANTS[variant];
  const isArchivo = !!archivoFecha;

  if (!data) {
    const Icon = meta.emptyIcon;
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <Icon size={48} className="mx-auto mb-4 text-zinc-300 dark:text-zinc-700" strokeWidth={1.5} />
          <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200 mb-2">
            {isArchivo ? "No hay noticias archivadas para este día" : meta.emptyTitle}
          </h2>
          <p className="text-zinc-500 dark:text-zinc-500 text-sm leading-relaxed mb-6">
            {isArchivo
              ? "Quizás el cron no había arrancado ese día. Probá con otra fecha."
              : `El resumen diario se genera a las ${meta.emptyHora}. Volvé más tarde.`}
          </p>
          <Link
            href={isArchivo ? meta.liveHref : "/"}
            className={`inline-flex items-center gap-2 ${meta.emptyAccent} text-sm font-medium hover:underline`}
          >
            <ArrowLeft size={14} />
            {isArchivo ? "Volver al día actual" : "Volver al inicio"}
          </Link>
        </div>
      </div>
    );
  }

  const [hero, ...secondary] = data.top3;
  const fechaLegible = fechaLegibleArg(data.fecha);

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
            {isArchivo ? (
              <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-amber-700 dark:text-amber-300 bg-amber-200/70 dark:bg-amber-500/15 px-2 py-0.5 rounded">
                <Archive size={10} strokeWidth={2.5} />
                Archivo
              </span>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5 text-zinc-500 dark:text-zinc-500 text-xs">
                <Clock size={11} />
                <span>Actualizado {meta.emptyHora}</span>
              </div>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* ── Tab nav ── */}
      <NoticiasTabNav active={variant} />

      {/* ── Chips de días disponibles (live + archivo) ── */}
      {fechasDisponibles && fechasDisponibles.length > 0 && (
        <NoticiasArchivoChips
          fechas={fechasDisponibles}
          variant={variant}
          fechaActual={archivoFecha}
        />
      )}

      {/* ── Masthead editorial ── */}
      <div className="border-b-[3px] border-zinc-900 dark:border-white bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-white leading-none">
              {isArchivo ? meta.archiveTitle : meta.liveTitle}
            </h1>
            <p className="text-zinc-500 dark:text-zinc-500 text-sm mt-2 capitalize">{fechaLegible}</p>
          </div>
          <div className="hidden sm:block text-right text-xs text-zinc-500 dark:text-zinc-500 leading-relaxed flex-shrink-0">
            <p className="font-medium text-zinc-700 dark:text-zinc-300">5 fuentes · Análisis IA</p>
            <p>{meta.sources}</p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* ── HERO ── */}
        <section className="mb-10">
          <a href={hero.url} target="_blank" rel="noopener noreferrer" className="group block">
            <div className="relative h-[340px] sm:h-[500px] overflow-hidden bg-zinc-800">
              <div className="absolute inset-0">
                <NoticiaImagenFallback
                  imagen={hero.imagen}
                  titulo={hero.titulo}
                  fuente={noticiaFuente(hero)}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/10" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
                <span
                  className={`inline-block ${meta.badgeBg} text-white text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 mb-4`}
                >
                  {noticiaFuente(hero)}
                </span>
                <h2
                  className={`text-white text-2xl sm:text-4xl font-black leading-tight mb-3 ${meta.heroTitleHover} transition-colors duration-200 max-w-4xl`}
                >
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

        {/* ── NOTICIAS SECUNDARIAS ── */}
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
                    fuente={noticiaFuente(noticia)}
                  />
                </div>
              </div>
              <span
                className={`text-[10px] font-bold tracking-widest uppercase ${meta.cardSourceText} mb-2`}
              >
                {noticiaFuente(noticia)}
              </span>
              <h3
                className={`text-zinc-900 dark:text-white font-bold text-xl leading-snug mb-3 ${meta.cardTitleHover} transition-colors duration-200`}
              >
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

        {/* ── BLOQUE INFERIOR ── */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-12">
          <div className="lg:col-span-2 space-y-10">
            <div>
              <h2 className="text-[10px] font-bold tracking-widest uppercase text-zinc-500 dark:text-zinc-500 pb-2 mb-4 border-b-2 border-zinc-900 dark:border-white">
                Resumen ejecutivo
              </h2>
              <p className="text-zinc-700 dark:text-zinc-300 text-lg leading-relaxed">
                {data.resumen}
              </p>
            </div>

            <div>
              <h2 className="text-[10px] font-bold tracking-widest uppercase text-zinc-500 dark:text-zinc-500 pb-2 mb-6 border-b-2 border-zinc-900 dark:border-white">
                Tendencias del día
              </h2>
              <div className="space-y-6">
                {data.tendencias.map((tendencia, i) => (
                  <div key={i} className="flex gap-5 items-start">
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

          <div className="lg:border-l lg:border-zinc-200 lg:dark:border-zinc-800 lg:pl-10">
            <h2 className="text-[10px] font-bold tracking-widest uppercase text-zinc-500 dark:text-zinc-500 pb-2 mb-4 border-b-2 border-zinc-900 dark:border-white">
              Conclusión clave
            </h2>
            <div className="bg-zinc-900 dark:bg-zinc-800 p-6">
              <Zap size={18} className={`${meta.zapColor} mb-4`} />
              <p className="text-white font-semibold text-base leading-relaxed">
                {data.conclusion}
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
              <p className="text-zinc-500 dark:text-zinc-500 text-xs leading-relaxed">
                Resumen generado diariamente con Claude Opus. Fuentes: {meta.sourcesCredits}.
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
            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors text-sm font-medium"
          >
            ← Volver a FinAR
          </Link>
          <span className="text-zinc-500 dark:text-zinc-500 text-xs capitalize">{fechaLegible}</span>
        </div>
      </div>
    </div>
  );
}

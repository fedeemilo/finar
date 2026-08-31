import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Newspaper,
  Code2,
  Clock,
  Archive,
  type LucideIcon,
} from "lucide-react";
import { NoticiaImagenFallback } from "@/components/NoticiaImagenFallback";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FinarBrand } from "@/components/FinarBrand";
import { NoticiasTabNav } from "@/components/NoticiasTabNav";
import { NoticiasArchivoChips } from "@/components/NoticiasArchivoChips";
import { NoticiaResumen, ResumenExclusiveProvider } from "@/components/NoticiaResumen";
import { fechaLegibleArg, horaCortaArg } from "@/lib/dates";

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
  top3: NoticiaItem[];
  actualizadoAt?: string;
  resumen?: string;
  tendencias?: string[];
  conclusion?: string;
}

type Variant = "general" | "tech";

interface VariantMeta {
  liveHref: string;
  liveTitle: string;
  archiveTitle: string;
  sources: string;
  emptyHora: string;
  emptyIcon: LucideIcon;
  emptyTitle: string;
  badgeBg: string;
  cardSourceText: string;
  cardTitleHover: string;
  heroTitleHover: string;
  emptyAccent: string;
}

const VARIANTS: Record<Variant, VariantMeta> = {
  general: {
    liveHref: "/",
    liveTitle: "El día en noticias",
    archiveTitle: "El día en noticias",
    sources: "LN · Ámbito · Cronista · Infobae · Clarín · BBC",
    emptyHora: "9am",
    emptyIcon: Newspaper,
    emptyTitle: "Todavía no hay noticias hoy",
    badgeBg: "bg-emerald-500",
    cardSourceText: "text-emerald-600 dark:text-emerald-400",
    cardTitleHover: "group-hover:text-emerald-700 dark:group-hover:text-emerald-300",
    heroTitleHover: "group-hover:text-emerald-300",
    emptyAccent: "text-emerald-600 dark:text-emerald-400",
  },
  tech: {
    liveHref: "/?tab=tech",
    liveTitle: "Tech del día",
    archiveTitle: "Tech del día",
    sources: "HN · The Verge · Ars · TechCrunch · GitHub",
    emptyHora: "9:30am",
    emptyIcon: Code2,
    emptyTitle: "Todavía no hay noticias tech hoy",
    badgeBg: "bg-indigo-500",
    cardSourceText: "text-indigo-600 dark:text-indigo-400",
    cardTitleHover: "group-hover:text-indigo-700 dark:group-hover:text-indigo-300",
    heroTitleHover: "group-hover:text-indigo-300",
    emptyAccent: "text-indigo-600 dark:text-indigo-400",
  },
};

function SecondaryNote({
  noticia,
  meta,
  dense = false,
}: {
  noticia: NoticiaItem;
  meta: VariantMeta;
  dense?: boolean;
}) {
  const fuente = noticiaFuente(noticia);

  return (
    <article
      className={`group flex h-full ${dense ? "flex-col sm:flex-row gap-4" : "flex-col"}`}
    >
      <a
        href={noticia.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0 ${
          dense ? "h-44 sm:h-auto sm:w-[42%] sm:min-h-[148px]" : "h-52 mb-4"
        }`}
      >
        <div className="w-full h-full transition-transform duration-300 group-hover:scale-[1.03]">
          <NoticiaImagenFallback
            imagen={noticia.imagen}
            titulo={noticia.titulo}
            fuente={fuente}
          />
        </div>
      </a>
      <div className="flex flex-col min-w-0 flex-1">
        <span
          className={`text-[10px] font-bold tracking-widest uppercase ${meta.cardSourceText} mb-1.5`}
        >
          {fuente}
        </span>
        <a href={noticia.url} target="_blank" rel="noopener noreferrer">
          <h3
            className={`text-zinc-900 dark:text-white font-bold leading-snug mb-2 ${
              dense ? "text-base sm:text-lg" : "text-xl"
            } ${meta.cardTitleHover} transition-colors duration-200`}
          >
            {noticia.titulo}
          </h3>
        </a>
        <div className="flex-1">
          <NoticiaResumen
            texto={noticia.descripcion}
            tone="card"
            clamp="line-clamp-3"
          />
        </div>
        <a
          href={noticia.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-3 text-zinc-500 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 text-xs self-start"
        >
          <ExternalLink size={11} />
          <span>Leer nota completa</span>
        </a>
      </div>
    </article>
  );
}

export function NoticiasDiariasLayout({
  data,
  variant,
  archivoFecha,
  fechasDisponibles,
  homeMode = false,
  actualizadoAt,
}: {
  data: NoticiasData | null;
  variant: Variant;
  archivoFecha?: string;
  fechasDisponibles?: string[];
  homeMode?: boolean;
  actualizadoAt?: string | null;
}) {
  const meta = VARIANTS[variant];
  const isArchivo = !!archivoFecha;

  if (!data) {
    const Icon = meta.emptyIcon;
    const emptyBody = (
      <div className="text-center max-w-sm mx-auto py-16 px-4">
        <Icon size={48} className="mx-auto mb-4 text-zinc-300 dark:text-zinc-700" strokeWidth={1.5} />
        <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200 mb-2">
          {isArchivo ? "No hay noticias archivadas para este día" : meta.emptyTitle}
        </h2>
        <p className="text-zinc-500 dark:text-zinc-500 text-sm leading-relaxed mb-6">
          {isArchivo
            ? "Quizás el cron no había arrancado ese día. Probá con otra fecha."
            : `El resumen diario se genera a las ${meta.emptyHora}. Volvé más tarde.`}
        </p>
        {!homeMode && (
          <Link
            href={isArchivo ? meta.liveHref : "/"}
            className={`inline-flex items-center gap-2 ${meta.emptyAccent} text-sm font-medium hover:underline`}
          >
            <ArrowLeft size={14} />
            {isArchivo ? "Volver al día actual" : "Volver al inicio"}
          </Link>
        )}
      </div>
    );

    if (!homeMode) {
      return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center px-4">
          {emptyBody}
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950">
        <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
            <FinarBrand />
            <ThemeToggle />
          </div>
        </div>
        <NoticiasTabNav active={variant} />
        {emptyBody}
      </div>
    );
  }

  const [hero, ...rest] = data.top3;
  const rail = rest.slice(0, 2);
  const bottom = rest.slice(2);
  const fechaLegible = fechaLegibleArg(data.fecha);
  const horaActualizado = actualizadoAt ? horaCortaArg(actualizadoAt) : null;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          {homeMode ? (
            <FinarBrand />
          ) : (
            <Link
              href={meta.liveHref}
              className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors text-sm font-medium"
            >
              <ArrowLeft size={14} />
              FinAR
            </Link>
          )}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {isArchivo ? (
              <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-amber-700 dark:text-amber-300 bg-amber-200/70 dark:bg-amber-500/15 px-2 py-0.5 rounded">
                <Archive size={10} strokeWidth={2.5} />
                Archivo
              </span>
            ) : (
              horaActualizado && (
                <div className="hidden sm:flex items-center gap-1.5 text-zinc-500 dark:text-zinc-500 text-xs">
                  <Clock size={11} />
                  <span>Actualizado {horaActualizado}</span>
                </div>
              )
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>

      <NoticiasTabNav active={variant} />

      {fechasDisponibles && fechasDisponibles.length > 0 && (
        <NoticiasArchivoChips
          fechas={fechasDisponibles}
          variant={variant}
          fechaActual={archivoFecha}
        />
      )}

      <div className="border-b-[3px] border-zinc-900 dark:border-white bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-white leading-none">
              {isArchivo ? meta.archiveTitle : meta.liveTitle}
            </h1>
            <p className="text-zinc-500 dark:text-zinc-500 text-sm mt-2 capitalize">{fechaLegible}</p>
          </div>
          <div className="hidden sm:block text-right text-xs text-zinc-500 dark:text-zinc-500 leading-relaxed flex-shrink-0">
            <p className="font-medium text-zinc-700 dark:text-zinc-300">
              {data.top3.length} {data.top3.length === 1 ? "nota" : "notas"} · Curado por IA
            </p>
            <p>{meta.sources}</p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <ResumenExclusiveProvider>
        <section
          className={
            rail.length > 0
              ? "grid grid-cols-1 lg:grid-cols-12 lg:grid-rows-2 gap-6 lg:gap-8 mb-10"
              : "mb-10"
          }
        >
          <article
            className={
              rail.length > 0
                ? "relative bg-zinc-800 min-h-[340px] sm:min-h-[420px] lg:min-h-0 lg:col-span-7 lg:row-span-2"
                : "relative bg-zinc-800 min-h-[340px] sm:min-h-[460px]"
            }
          >
            <div className="absolute inset-0 overflow-hidden">
              <NoticiaImagenFallback
                imagen={hero.imagen}
                titulo={hero.titulo}
                fuente={noticiaFuente(hero)}
              />
            </div>
            <div className="absolute inset-0 overflow-hidden bg-gradient-to-t from-black/95 via-black/60 to-black/15" />
            <div className="relative z-10 flex flex-col justify-end p-6 sm:p-8 min-h-[340px] h-full">
              <span
                className={`inline-block self-start ${meta.badgeBg} text-white text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 mb-4`}
              >
                {noticiaFuente(hero)}
              </span>
              <a
                href={hero.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group max-w-4xl"
              >
                <h2
                  className={`text-white text-2xl sm:text-3xl lg:text-[2.15rem] font-black leading-tight mb-3 ${meta.heroTitleHover} transition-colors duration-200`}
                >
                  {hero.titulo}
                </h2>
              </a>
              <NoticiaResumen
                texto={hero.descripcion}
                tone="hero"
                clamp="line-clamp-4"
              />
              <a
                href={hero.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-5 text-white/55 hover:text-white/80 text-xs transition-colors self-start"
              >
                <ExternalLink size={11} />
                <span>Leer nota completa</span>
              </a>
            </div>
          </article>

          {rail.map((noticia, i) => (
            <div key={i} className="lg:col-span-5">
              <SecondaryNote noticia={noticia} meta={meta} dense />
            </div>
          ))}
        </section>

        {bottom.length > 0 && (
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-2 pb-4">
            {bottom.map((noticia, i) => (
              <SecondaryNote key={i} noticia={noticia} meta={meta} />
            ))}
          </section>
        )}
        </ResumenExclusiveProvider>
      </main>

      <div className="border-t-[3px] border-zinc-900 dark:border-white mt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          {homeMode ? (
            <p className="text-zinc-500 dark:text-zinc-500 text-xs text-center sm:text-left">
              Resúmenes generados por IA. Las notas originales son de cada medio.
            </p>
          ) : (
            <Link
              href={meta.liveHref}
              className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors text-sm font-medium"
            >
              ← Volver al día actual
            </Link>
          )}
          <span className="text-zinc-500 dark:text-zinc-500 text-xs capitalize">{fechaLegible}</span>
        </div>
      </div>
    </div>
  );
}

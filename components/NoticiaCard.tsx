"use client";

import type { Noticia } from "@/lib/noticias";
import { ExternalLink } from "lucide-react";

const CATEGORIA_CONFIG: Record<Noticia["categoria"], { dot: string; label: string }> = {
  Mundo:     { dot: "bg-blue-400",    label: "text-blue-500 dark:text-blue-400" },
  Argentina: { dot: "bg-emerald-400", label: "text-emerald-600 dark:text-emerald-400" },
  Mercados:  { dot: "bg-purple-400",  label: "text-purple-500 dark:text-purple-400" },
};

export function NoticiaCard({ noticia }: { noticia: Noticia }) {
  const config = CATEGORIA_CONFIG[noticia.categoria];

  return (
    <div className="group rounded-2xl border border-black/[0.12] dark:border-white/5 bg-white/80 dark:bg-white/[0.03] hover:bg-white dark:hover:bg-white/[0.05] transition-colors duration-200 overflow-hidden">
      <div className="p-5 pb-4">
        {/* Meta row */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot}`} />
          <span className={`text-xs font-medium ${config.label}`}>{noticia.categoria}</span>
          <span className="text-gray-400 dark:text-white/15 text-xs">·</span>
          <span className="text-gray-500 dark:text-white/25 text-xs">{noticia.fuente}</span>
          {noticia.url && noticia.url !== "#" && (
            <a
              href={noticia.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex items-center gap-1 text-gray-400 dark:text-white/20 hover:text-gray-600 dark:hover:text-white/50 transition-colors"
            >
              <ExternalLink size={11} />
            </a>
          )}
        </div>

        {/* Título */}
        <h3 className="text-gray-800 dark:text-white/90 font-semibold text-[15px] leading-snug mb-2">
          {noticia.titulo}
        </h3>

        {/* Resumen */}
        <p className="text-gray-600 dark:text-white/45 text-sm leading-relaxed">
          {noticia.resumen}
        </p>
      </div>

      {/* ¿Qué significa? — separado visualmente */}
      <div className="mx-5 mb-5 pl-3 border-l-2 border-emerald-500/40 dark:border-emerald-400/40">
        <p className="text-[11px] text-emerald-600/70 dark:text-emerald-400/70 font-medium mb-0.5 uppercase tracking-wide">
          Para vos
        </p>
        <p className="text-gray-700 dark:text-white/65 text-sm leading-relaxed">
          {noticia.queSIgnificaParaMi}
        </p>
      </div>
    </div>
  );
}

export function NoticiaCardSkeleton() {
  return (
    <div className="rounded-2xl border border-black/[0.12] dark:border-white/5 bg-white/80 dark:bg-white/[0.03] p-5 animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-1.5 rounded-full bg-black/10 dark:bg-white/10" />
        <div className="h-3 w-16 bg-black/10 dark:bg-white/10 rounded-full" />
      </div>
      <div className="h-4 bg-black/10 dark:bg-white/10 rounded-full w-3/4 mb-2" />
      <div className="space-y-1.5 mb-4">
        <div className="h-3 bg-black/10 dark:bg-white/10 rounded-full w-full" />
        <div className="h-3 bg-black/10 dark:bg-white/10 rounded-full w-5/6" />
      </div>
      <div className="pl-3 border-l-2 border-black/5 dark:border-white/5 space-y-1.5">
        <div className="h-2.5 bg-black/10 dark:bg-white/10 rounded-full w-12" />
        <div className="h-3 bg-black/10 dark:bg-white/10 rounded-full w-full" />
      </div>
    </div>
  );
}

"use client";

import type { Noticia } from "@/app/api/noticias/route";
import { ExternalLink } from "lucide-react";

const CATEGORIA_CONFIG: Record<Noticia["categoria"], { dot: string; label: string }> = {
  Mundo:     { dot: "bg-blue-400",    label: "text-blue-400" },
  Argentina: { dot: "bg-emerald-400", label: "text-emerald-400" },
  Mercados:  { dot: "bg-purple-400",  label: "text-purple-400" },
};

export function NoticiaCard({ noticia }: { noticia: Noticia }) {
  const config = CATEGORIA_CONFIG[noticia.categoria];

  return (
    <div className="group rounded-2xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.05] transition-colors duration-200 overflow-hidden">
      <div className="p-5 pb-4">
        {/* Meta row */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot}`} />
          <span className={`text-xs font-medium ${config.label}`}>{noticia.categoria}</span>
          <span className="text-white/15 text-xs">·</span>
          <span className="text-white/25 text-xs">{noticia.fuente}</span>
          {noticia.url && noticia.url !== "#" && (
            <a
              href={noticia.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex items-center gap-1 text-white/20 hover:text-white/50 transition-colors"
            >
              <ExternalLink size={11} />
            </a>
          )}
        </div>

        {/* Título */}
        <h3 className="text-white/90 font-semibold text-[15px] leading-snug mb-2">
          {noticia.titulo}
        </h3>

        {/* Resumen */}
        <p className="text-white/45 text-sm leading-relaxed">
          {noticia.resumen}
        </p>
      </div>

      {/* ¿Qué significa? — separado visualmente */}
      <div className="mx-5 mb-5 pl-3 border-l-2 border-emerald-400/40">
        <p className="text-[11px] text-emerald-400/70 font-medium mb-0.5 uppercase tracking-wide">
          Para vos
        </p>
        <p className="text-white/65 text-sm leading-relaxed">
          {noticia.queSIgnificaParaMi}
        </p>
      </div>
    </div>
  );
}

export function NoticiaCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
        <div className="h-3 w-16 bg-white/10 rounded-full" />
      </div>
      <div className="h-4 bg-white/10 rounded-full w-3/4 mb-2" />
      <div className="space-y-1.5 mb-4">
        <div className="h-3 bg-white/10 rounded-full w-full" />
        <div className="h-3 bg-white/10 rounded-full w-5/6" />
      </div>
      <div className="pl-3 border-l-2 border-white/5 space-y-1.5">
        <div className="h-2.5 bg-white/10 rounded-full w-12" />
        <div className="h-3 bg-white/10 rounded-full w-full" />
      </div>
    </div>
  );
}

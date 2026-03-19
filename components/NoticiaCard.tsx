"use client";

import type { Noticia } from "@/app/api/noticias/route";
import { ExternalLink } from "lucide-react";

const CATEGORIA_CONFIG = {
  Mundo: { color: "bg-blue-500/20 text-blue-300", emoji: "🌍" },
  Argentina: { color: "bg-emerald-500/20 text-emerald-300", emoji: "🇦🇷" },
  Mercados: { color: "bg-purple-500/20 text-purple-300", emoji: "📈" },
};

export function NoticiaCard({ noticia }: { noticia: Noticia }) {
  const config = CATEGORIA_CONFIG[noticia.categoria];

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-sm p-5 transition-all duration-300 hover:bg-white/[0.05]">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <span className="text-xl flex-shrink-0">{config.emoji}</span>
        <div className="flex-1 min-w-0">
          <span
            className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mb-1.5 ${config.color}`}
          >
            {noticia.categoria}
          </span>
          <h3 className="text-white/90 font-semibold text-sm leading-snug">
            {noticia.titulo}
          </h3>
        </div>
      </div>

      {/* Resumen */}
      <p className="text-white/60 text-sm leading-relaxed mb-3">
        {noticia.resumen}
      </p>

      {/* Qué significa para mí — always visible */}
      <div className="rounded-xl bg-emerald-400/5 border border-emerald-400/15 px-4 py-3">
        <p className="text-xs text-emerald-400 font-medium mb-1">
          ¿Qué significa para mí?
        </p>
        <p className="text-white/75 text-sm">{noticia.queSIgnificaParaMi}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3">
        <span className="text-white/30 text-xs">{noticia.fuente}</span>
        {noticia.url && noticia.url !== "#" && (
          <a
            href={noticia.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            Ver nota
            <ExternalLink size={10} />
          </a>
        )}
      </div>
    </div>
  );
}

export function NoticiaCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 animate-pulse">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-6 h-6 bg-white/10 rounded" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-white/10 rounded-full w-16" />
          <div className="h-4 bg-white/10 rounded-full w-3/4" />
        </div>
      </div>
      <div className="space-y-2 mb-3">
        <div className="h-3 bg-white/10 rounded-full w-full" />
        <div className="h-3 bg-white/10 rounded-full w-5/6" />
      </div>
      <div className="h-16 bg-emerald-400/5 rounded-xl" />
    </div>
  );
}

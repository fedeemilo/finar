"use client";

import Link from "next/link";
import { Newspaper, ArrowRight } from "lucide-react";

function TickerPreview({ text, live }: { text: string; live: boolean }) {
  if (!live) {
    return (
      <p className="text-gray-500 dark:text-white/45 text-xs mt-0.5 truncate">{text}</p>
    );
  }

  return (
    <div className="relative mt-0.5 h-4 overflow-hidden">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-6 z-10 bg-gradient-to-r from-emerald-500/[0.06] to-transparent dark:from-emerald-400/[0.06]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-8 z-10 bg-gradient-to-l from-emerald-500/[0.06] to-transparent dark:from-emerald-400/[0.06]"
        aria-hidden
      />
      <div className="flex w-max animate-ticker motion-reduce:animate-none gap-8">
        <span className="text-gray-500 dark:text-white/45 text-xs whitespace-nowrap">{text}</span>
        <span className="text-gray-500 dark:text-white/45 text-xs whitespace-nowrap" aria-hidden>
          {text}
        </span>
      </div>
    </div>
  );
}

export function NoticiasHomeLink({ previews }: { previews?: string[] }) {
  const items = previews?.filter(Boolean) ?? [];
  const tickerText =
    items.length > 0
      ? items.join("   ·   ")
      : "Resumen diario con IA · General y Tech";

  return (
    <Link
      href="/"
      className="group flex items-center gap-4 rounded-2xl border border-emerald-500/25 dark:border-emerald-400/20 bg-emerald-500/[0.06] dark:bg-emerald-400/[0.06] hover:bg-emerald-500/10 dark:hover:bg-emerald-400/10 px-4 py-3.5 transition-colors"
    >
      <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-emerald-500/15 dark:bg-emerald-400/15 flex items-center justify-center">
        <Newspaper size={20} className="text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-gray-800 dark:text-white font-semibold text-sm">
            El día en noticias
          </p>
          {items.length > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse motion-reduce:animate-none" />
              Hoy
            </span>
          )}
        </div>
        <TickerPreview text={tickerText} live={items.length > 0} />
      </div>
      <ArrowRight
        size={16}
        className="flex-shrink-0 text-emerald-600 dark:text-emerald-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
      />
    </Link>
  );
}

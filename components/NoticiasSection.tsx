"use client";

import { useEffect, useState } from "react";
import { NoticiaCard, NoticiaCardSkeleton } from "./NoticiaCard";
import type { Noticia } from "@/app/api/noticias/route";

export function NoticiasSection() {
  const [noticias, setNoticias] = useState<Noticia[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/noticias")
      .then((r) => r.json())
      .then((data: Noticia[]) => setNoticias(data))
      .catch(() => setNoticias([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <NoticiaCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!noticias || noticias.length === 0) {
    return (
      <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-8 text-center">
        <p className="text-white/40">No hay noticias disponibles ahora.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {noticias.map((noticia) => (
        <NoticiaCard key={noticia.id} noticia={noticia} />
      ))}
    </div>
  );
}

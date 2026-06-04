import { NoticiaCard } from "./NoticiaCard";
import type { Noticia } from "@/lib/noticias";

export function NoticiasSection({ noticias }: { noticias: Noticia[] | null }) {
  if (!noticias || noticias.length === 0) {
    return (
      <div className="rounded-2xl border border-black/[0.07] dark:border-white/5 bg-black/[0.03] dark:bg-white/[0.03] p-8 text-center">
        <p className="text-gray-500 dark:text-white/40 text-sm">No hay noticias disponibles ahora.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {noticias.map((noticia) => (
        <NoticiaCard key={noticia.id} noticia={noticia} />
      ))}
    </div>
  );
}

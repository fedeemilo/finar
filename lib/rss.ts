import Parser from "rss-parser";

export interface RssArticle {
  titulo: string;
  descripcion: string;
  url: string;
  fuente: string;
  fecha: Date;
}

const parser = new Parser({
  timeout: 8000,
  headers: { "User-Agent": "FinAR/1.0 (+https://finar.ar)" },
});

const FEEDS = [
  { url: "https://www.cronista.com/rss/", fuente: "El Cronista" },
  { url: "https://www.iprofesional.com/rss/", fuente: "iProfesional" },
  { url: "https://www.ambito.com/rss/home.xml", fuente: "Ámbito" },
  { url: "https://www.lanacion.com.ar/arc/outboundfeeds/rss/", fuente: "La Nación" },
  { url: "https://www.infobae.com/feeds/rss/economia/", fuente: "Infobae" },
  { url: "https://feeds.bbci.co.uk/mundo/rss.xml", fuente: "BBC Mundo" },
  { url: "https://www.perfil.com/feed", fuente: "Perfil" },
];

async function fetchFeed(url: string, fuente: string): Promise<RssArticle[]> {
  try {
    const feed = await parser.parseURL(url);
    return (feed.items ?? []).slice(0, 6).map((item) => ({
      titulo: item.title?.trim() ?? "",
      descripcion: item.contentSnippet?.trim() ?? item.summary?.trim() ?? "",
      url: item.link ?? "#",
      fuente,
      fecha: item.pubDate ? new Date(item.pubDate) : new Date(),
    }));
  } catch {
    return [];
  }
}

export async function fetchAllFeeds(): Promise<RssArticle[]> {
  const results = await Promise.allSettled(
    FEEDS.map((f) => fetchFeed(f.url, f.fuente))
  );

  const articles = results
    .filter((r): r is PromiseFulfilledResult<RssArticle[]> => r.status === "fulfilled")
    .flatMap((r) => r.value)
    .filter((a) => a.titulo.length > 0);

  // Ordenar por más recientes primero
  articles.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

  return articles;
}

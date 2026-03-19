import { NextResponse } from "next/server";
import { anthropic, SYSTEM_PROMPT } from "@/lib/claude";
import { getCached, setCache } from "@/lib/redis";
import { fetchAllFeeds } from "@/lib/rss";

const CACHE_KEY = "noticias:processed";
const TTL = 60 * 60; // 1 hora

export interface Noticia {
  id: string;
  titulo: string;
  resumen: string;
  queSIgnificaParaMi: string;
  categoria: "Mundo" | "Argentina" | "Mercados";
  url: string;
  fuente: string;
}

async function fetchAndProcessNoticias(): Promise<Noticia[]> {
  const articles = await fetchAllFeeds();

  if (articles.length === 0) return getMockNoticias();

  // Pasamos los 20 más recientes a Claude para que seleccione los 5 mejores
  const articlesText = articles
    .slice(0, 20)
    .map((a, i) => `${i + 1}. [${a.fuente}] ${a.titulo}${a.descripcion ? ` — ${a.descripcion.slice(0, 120)}` : ""}`)
    .join("\n");

  const stream = anthropic.messages.stream({
    model: "claude-haiku-4-5",
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Tenés estas noticias de hoy de distintos medios argentinos e internacionales.

Seleccioná las 5 que sean MÁS relevantes para alguien que quiere invertir en Argentina. Priorizá noticias sobre: dólar, inflación, tasas, economía argentina, mercados financieros, cripto, reservas del BCRA. Ignorá noticias de política pura, deportes, farándula o sociedad que no impacten en inversiones.

Para cada noticia seleccionada, generá este JSON:
- id: número del 1 al 5
- titulo: título en español claro (máx 10 palabras)
- resumen: 2 oraciones simples explicando la noticia
- queSIgnificaParaMi: qué impacto concreto tiene para un inversor argentino (1 oración directa)
- categoria: una de "Argentina", "Mundo" o "Mercados"

Respondé SOLO con un array JSON válido, sin markdown ni texto extra.

Noticias disponibles:
${articlesText}`,
      },
    ],
  });

  const finalMessage = await stream.finalMessage();
  const text = finalMessage.content.find((b) => b.type === "text")?.text ?? "[]";

  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("No JSON array found");
    const parsed = JSON.parse(jsonMatch[0]);

    return parsed.map((n: Omit<Noticia, "url" | "fuente"> & { id: number | string }, i: number) => {
      // Buscar el artículo original por título aproximado
      const original = articles.find((a) =>
        a.titulo.toLowerCase().includes(
          String(n.titulo).toLowerCase().slice(0, 20)
        )
      ) ?? articles[i];

      return {
        ...n,
        id: String(n.id ?? i + 1),
        url: original?.url ?? "#",
        fuente: original?.fuente ?? "Fuente",
      };
    });
  } catch {
    return getMockNoticias();
  }
}

function getMockNoticias(): Noticia[] {
  return [
    {
      id: "1",
      titulo: "Actualizando noticias del día",
      resumen: "Estamos obteniendo las noticias más recientes. Volvé en unos minutos para ver el análisis actualizado.",
      queSIgnificaParaMi: "Las fuentes de noticias están siendo consultadas ahora mismo.",
      categoria: "Argentina",
      url: "#",
      fuente: "FinAR",
    },
  ];
}

export async function GET() {
  const cached = await getCached<Noticia[]>(CACHE_KEY);
  if (cached) return NextResponse.json(cached);

  try {
    const noticias = await fetchAndProcessNoticias();
    await setCache(CACHE_KEY, noticias, TTL);
    return NextResponse.json(noticias);
  } catch {
    const stale = await getCached<Noticia[]>(CACHE_KEY);
    if (stale) return NextResponse.json(stale);
    return NextResponse.json(getMockNoticias());
  }
}

import { NextResponse } from "next/server";
import { anthropic, SYSTEM_PROMPT } from "@/lib/claude";
import { getCached, setCache } from "@/lib/redis";

const CACHE_KEY = "noticias:processed";
const TTL = 60 * 60; // 1 hour

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
  const apiKey = process.env.NEWS_API_KEY;

  if (!apiKey) {
    // Return mock data if no API key
    return getMockNoticias();
  }

  const queries = [
    "argentina economia pesos dolares inflacion",
    "federal reserve interest rates markets",
    "bitcoin crypto mercados financieros",
  ];

  const allArticles: { title: string; description: string; url: string; source: { name: string } }[] = [];

  for (const q of queries) {
    try {
      const res = await fetch(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&language=es&pageSize=2&sortBy=publishedAt&apiKey=${apiKey}`
      );
      if (res.ok) {
        const data = await res.json();
        allArticles.push(...(data.articles || []));
      }
    } catch {
      // continue with other queries
    }
  }

  if (allArticles.length === 0) return getMockNoticias();

  // Process with Claude
  const articlesText = allArticles
    .slice(0, 5)
    .map((a, i) => `${i + 1}. ${a.title}: ${a.description || ""}`)
    .join("\n");

  const stream = anthropic.messages.stream({
    model: "claude-opus-4-6",
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Tenés estas noticias financieras. Para cada una, generá un JSON con:
- id: número del 1 al n
- titulo: el título en español simple (máx 10 palabras)
- resumen: resumen en máximo 2 oraciones simples en español rioplatense
- queSIgnificaParaMi: qué impacto tiene esto para un argentino común (1 oración)
- categoria: una de "Mundo", "Argentina" o "Mercados"

Respondé SOLO con un array JSON válido, sin markdown ni explicaciones.

Noticias:
${articlesText}`,
      },
    ],
  });

  const finalMessage = await stream.finalMessage();
  const text = finalMessage.content.find((b) => b.type === "text")?.text ?? "[]";

  try {
    const parsed = JSON.parse(text.trim());
    return parsed.map((n: Omit<Noticia, 'url' | 'fuente'> & { id: number | string }, i: number) => ({
      ...n,
      id: String(n.id || i + 1),
      url: allArticles[i]?.url || "#",
      fuente: allArticles[i]?.source?.name || "Fuente",
    }));
  } catch {
    return getMockNoticias();
  }
}

function getMockNoticias(): Noticia[] {
  return [
    {
      id: "1",
      titulo: "La FED mantiene tasas altas en EEUU",
      resumen:
        "La Reserva Federal de Estados Unidos decidió no bajar las tasas de interés por el momento. Quieren asegurarse de que la inflación esté controlada antes de hacer cambios.",
      queSIgnificaParaMi:
        "Las tasas altas hacen que el dólar sea más fuerte, lo que puede presionar al peso argentino.",
      categoria: "Mundo",
      url: "#",
      fuente: "Reuters",
    },
    {
      id: "2",
      titulo: "Bitcoin supera los USD 70.000",
      resumen:
        "El Bitcoin volvió a subir con fuerza y superó los 70 mil dólares. Los inversores esperan que siga subiendo tras la aprobación de ETFs.",
      queSIgnificaParaMi:
        "Si tenés cripto, es un buen momento para evaluar si querés vender parte y asegurar ganancias.",
      categoria: "Mercados",
      url: "#",
      fuente: "CoinDesk",
    },
    {
      id: "3",
      titulo: "Argentina reduce el déficit fiscal",
      resumen:
        "El gobierno logró un superávit fiscal por primera vez en muchos años. Esto significa que el Estado está gastando menos de lo que recauda.",
      queSIgnificaParaMi:
        "Una señal positiva para la economía: menos necesidad de emitir pesos, lo que podría ayudar a frenar la inflación.",
      categoria: "Argentina",
      url: "#",
      fuente: "Infobae",
    },
    {
      id: "4",
      titulo: "Sube el precio del petróleo a nivel global",
      resumen:
        "El barril de petróleo subió por tensiones en Medio Oriente. Esto afecta a muchos países que dependen de importar energía.",
      queSIgnificaParaMi:
        "Para Argentina puede encarecer importaciones, pero también sube el precio de empresas petroleras como YPF.",
      categoria: "Mundo",
      url: "#",
      fuente: "Bloomberg",
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

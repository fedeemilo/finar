import { anthropic } from "@/lib/claude";
import { fetchCotizaciones } from "@/lib/cotizaciones";
import { fetchAllFeeds } from "@/lib/rss";

export const CACHE_KEY = "analisis:semaforo";
export const STALE_KEY = "analisis:semaforo:stale";
export const TTL = 30 * 60;           // 30 min — datos frescos
export const STALE_TTL = 4 * 60 * 60; // 4 h — fallback cuando fresh expira
export const REFRESH_LOCK = "analisis:refreshing";
export const REFRESH_LOCK_TTL = 90;   // evita múltiples refreshes simultáneos

export interface AnalisisActivo {
  id: string;
  status: "green" | "yellow" | "red";
  veredicto: string;
  porque: string;
}

export interface AnalisisResponse {
  activos: AnalisisActivo[];
  contexto: string;
  timestamp: string;
  stale?: boolean;
}

const ANALYST_SYSTEM_PROMPT = `Sos un analista financiero argentino senior con 20 años de experiencia.
Conocés a fondo el mercado local: cepo cambiario, brecha, inflación, CEDEARs, plazos fijos, cripto.

Tu trabajo hoy es evaluar el momento actual para 6 activos y explicárselo a un argentino común,
alguien que laburó duro y quiere cuidar sus ahorros. No es economista ni inversor profesional.

CRITERIOS DE ANÁLISIS POR ACTIVO:

DÓLAR MEP:
- Verde: brecha cambiaria entre 40-80%, mercado estable, buena oportunidad para dolarizarse legalmente
- Amarillo: brecha >80% (riesgo de corrección brusca) o <30% (poco atractivo vs alternativas)
- Rojo: cepo muy estricto, riesgo de intervención oficial, expectativas de baja de brecha inminente
- Siempre considerar: noticias sobre política cambiaria, FMI, reservas del BCRA

DÓLAR BLUE:
- Verde: brecha con el oficial manejable (<80%), mercado informal activo, buena opción para dolarizarse rápido
- Amarillo: brecha alta (>80%) o mucha volatilidad, riesgo de corrección brusca
- Rojo: brecha muy alta con señales de intervención oficial, o brecha cayendo fuerte (mejor esperar)
- Contexto clave: el blue refleja la desconfianza en el peso. Comparar siempre con MEP y CCL para ver si hay una mejor opción legal

PLAZO FIJO:
- Verde: tasa efectiva mensual > inflación mensual estimada, buen momento para pesos
- Amarillo: tasa ≈ inflación, apenas preserva valor, alternativas similares
- Rojo: tasa real negativa (inflación > tasa), perdés poder adquisitivo
- Considerar: decisiones del BCRA sobre tasas, datos de inflación recientes

CEDEARS (acciones globales en pesos):
- Verde: mercados globales en alza, expectativa de devaluación del peso, empresas tech o commodities subiendo
- Amarillo: mercados mixtos o inciertos, volatilidad alta en Wall Street
- Rojo: caída fuerte en mercados globales (S&P500, Nasdaq), dólar CCL muy estable
- Ventaja clave: se ajustan al tipo de cambio, protegen de devaluación

CRIPTO (BTC / ETH):
- Verde: tendencia alcista sostenida, buenos volúmenes, noticias positivas del sector
- Amarillo: mercado lateral o con volatilidad moderada, señales mixtas
- Rojo: tendencia bajista clara, noticias negativas (regulaciones, hackeos, quiebras)
- Siempre aclarar: altísima volatilidad, solo para dinero que pueden perder

ORO (GLD CEDEAR):
- Verde: incertidumbre geopolítica alta, tasas en EEUU bajando, dólar débil globalmente
- Amarillo: tasas altas en EEUU (presión bajista), mercados estables
- Rojo: economía global muy robusta, apetito por riesgo alto (todo sube menos el oro)
- Rol en portfolio: es refugio, no especulación. Siempre tiene lugar en perfiles conservadores.

REGLAS PARA TUS RESPUESTAS:
- El veredicto debe tener MÁXIMO 12 palabras, ser directo y accionable
- El porque debe tener 2-3 oraciones en español rioplatense informal
- Sé honesto sobre los riesgos, nunca prometás rendimientos
- Usá el contexto de las noticias si es relevante para el activo
- Si hay información contradictoria, priorizá la prudencia`;

async function fetchNoticias(): Promise<string> {
  try {
    const articles = await fetchAllFeeds();
    if (articles.length === 0) return "Sin noticias disponibles.";
    return articles
      .slice(0, 12)
      .map((a) => `- [${a.fuente}] ${a.titulo}${a.descripcion ? ": " + a.descripcion.slice(0, 100) : ""}`)
      .join("\n");
  } catch {
    return "No se pudieron cargar noticias recientes.";
  }
}

export async function generarAnalisis(): Promise<AnalisisResponse> {
  const [cotiz, noticias] = await Promise.all([
    fetchCotizaciones(),
    fetchNoticias(),
  ]);

  const brecha = ((cotiz.blue.venta - cotiz.oficial.venta) / cotiz.oficial.venta * 100).toFixed(1);

  const prompt = `Analizá el momento actual del mercado argentino y evaluá estos 6 activos.

DATOS DE HOY:
- Dólar oficial (venta): $${cotiz.oficial.venta.toLocaleString("es-AR")}
- Dólar blue (venta): $${cotiz.blue.venta.toLocaleString("es-AR")}
- Dólar MEP (venta): $${cotiz.mep.venta.toLocaleString("es-AR")}
- Dólar CCL (venta): $${cotiz.ccl.venta.toLocaleString("es-AR")}
- Brecha cambiaria (blue vs oficial): ${brecha}%

NOTICIAS RECIENTES RELEVANTES:
${noticias}

Respondé ÚNICAMENTE con un JSON válido con esta estructura exacta, sin markdown ni texto extra:
{
  "activos": [
    {
      "id": "mep",
      "status": "green" | "yellow" | "red",
      "veredicto": "máximo 12 palabras directas",
      "porque": "2-3 oraciones en español rioplatense explicando el análisis"
    },
    {
      "id": "blue",
      "status": "green" | "yellow" | "red",
      "veredicto": "...",
      "porque": "..."
    },
    {
      "id": "plazo-fijo",
      "status": "green" | "yellow" | "red",
      "veredicto": "...",
      "porque": "..."
    },
    {
      "id": "cedears",
      "status": "green" | "yellow" | "red",
      "veredicto": "...",
      "porque": "..."
    },
    {
      "id": "cripto",
      "status": "green" | "yellow" | "red",
      "veredicto": "...",
      "porque": "..."
    },
    {
      "id": "oro",
      "status": "green" | "yellow" | "red",
      "veredicto": "...",
      "porque": "..."
    }
  ],
  "contexto": "1-2 oraciones resumiendo el panorama general del mercado argentino hoy"
}`;

  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    system: ANALYST_SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });

  const finalMessage = await stream.finalMessage();
  const text = finalMessage.content.find((b) => b.type === "text")?.text ?? "";

  const cleaned = text.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "").trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("Análisis: respuesta sin objeto JSON. Raw (500 chars):", text.slice(0, 500));
    throw new Error("Claude no devolvió JSON válido");
  }

  const parsed = JSON.parse(jsonMatch[0]) as { activos: AnalisisActivo[]; contexto: string };

  return {
    activos: parsed.activos,
    contexto: parsed.contexto,
    timestamp: new Date().toISOString(),
  };
}

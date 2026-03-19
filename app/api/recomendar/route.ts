import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { anthropic, SYSTEM_PROMPT } from "@/lib/claude";
import { fetchCotizaciones } from "@/lib/cotizaciones";
import { getCached, redis } from "@/lib/redis";
import { FREE_LIMIT, LIMIT_TTL_SECONDS } from "@/lib/constants";

export interface RecomendacionItem {
  activo: string;
  porcentaje: number;
  descripcion: string;
  emoji: string;
}

export interface RecomendacionResponse {
  resumen: string;
  items: RecomendacionItem[];
  advertencia?: string;
}

function getClientIP(req: NextRequest): string {
  const headersList = headers();
  const forwarded = headersList.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headersList.get("x-real-ip") ?? req.ip ?? "unknown";
}

export async function GET(req: NextRequest) {
  const ip = getClientIP(req);
  const key = `recomendar:uses:${ip}`;
  const [used, ttl] = await Promise.all([
    getCached<number>(key).then((v) => v ?? 0),
    redis.ttl(key), // segundos restantes hasta que expire, -1 si no existe
  ]);
  return NextResponse.json({ used, limit: FREE_LIMIT, ttl });
}

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);
  const key = `recomendar:uses:${ip}`;

  // Verificar límite en backend (fuente de verdad)
  const used = (await getCached<number>(key)) ?? 0;
  if (used >= FREE_LIMIT) {
    return NextResponse.json(
      { error: "limit_reached", used, limit: FREE_LIMIT },
      { status: 429 }
    );
  }

  const body = await req.json();
  const { amount, currency, riskProfile } = body as {
    amount: number;
    currency: "ARS" | "USD";
    riskProfile: "low" | "medium" | "high";
  };

  if (!amount || !currency || !riskProfile) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  let cotizacionesContext = "";
  try {
    const cotiz =
      (await getCached<Awaited<ReturnType<typeof fetchCotizaciones>>>(
        "cotizaciones:latest"
      )) ?? (await fetchCotizaciones());
    cotizacionesContext = `
Cotizaciones actuales:
- Dólar oficial: $${cotiz.oficial.venta}
- Dólar blue: $${cotiz.blue.venta}
- Dólar MEP: $${cotiz.mep.venta}
- Dólar CCL: $${cotiz.ccl.venta}`;
  } catch {
    cotizacionesContext = "Cotizaciones no disponibles.";
  }

  const perfilMap = {
    low: "conservador (quiere proteger su dinero, mínimo riesgo)",
    medium: "moderado (quiere hacer crecer su dinero con riesgo controlado)",
    high: "arriesgado (puede tolerar pérdidas para buscar mayores ganancias)",
  };

  const stream = anthropic.messages.stream({
    model: "claude-haiku-4-5",
    max_tokens: 1000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Tengo ${currency === "ARS" ? "$" : "USD"} ${Number(amount).toLocaleString("es-AR")} y soy un inversor ${perfilMap[riskProfile]}.

${cotizacionesContext}

Dame una recomendación de cómo distribuir este dinero. Respondé SOLO con un JSON válido con este formato exacto:
{
  "resumen": "Una oración simple explicando la estrategia general",
  "items": [
    {
      "activo": "Nombre del activo",
      "porcentaje": 40,
      "descripcion": "Por qué este activo, en 1 oración simple",
      "emoji": "un emoji representativo"
    }
  ],
  "advertencia": "Una advertencia importante si aplica (opcional)"
}

Los porcentajes deben sumar 100. Máximo 4 activos. Sin markdown, solo JSON.`,
      },
    ],
  });

  const finalMessage = await stream.finalMessage();
  const text = finalMessage.content.find((b) => b.type === "text")?.text ?? "";

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");
    const data = JSON.parse(jsonMatch[0]) as RecomendacionResponse;

    // Incrementar contador solo si Claude respondió bien
    await redis.set(key, used + 1, { ex: LIMIT_TTL_SECONDS });

    // Analytics: contadores de uso
    const today = new Date().toISOString().slice(0, 10); // "2026-03-19"
    const hour = new Date().getUTCHours(); // 0-23
    await Promise.allSettled([
      redis.incr("stats:total"),
      redis.incr(`stats:day:${today}`),
      redis.incr(`stats:hour:${today}:${hour}`),
      redis.incr(`stats:profile:${riskProfile}`),
      redis.sadd(`stats:ips:${today}`, ip),
    ]);

    return NextResponse.json({ ...data, usesLeft: FREE_LIMIT - (used + 1) });
  } catch (err) {
    console.error("Recomendar parse error:", err, "\nRaw:", text);
    return NextResponse.json(
      { error: "No se pudo generar la recomendación" },
      { status: 500 }
    );
  }
}

# FinAR — Instrucciones para agentes

## Qué es este proyecto

FinAR es un asesor financiero para argentinos. Responde "¿En qué me conviene invertir hoy?" usando Claude como analista de mercado real, cotizaciones en tiempo real y noticias económicas.

URL producción: (pendiente — ver README)
Repo: https://github.com/fedeemilo/finar

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 14 App Router |
| Lenguaje | TypeScript strict |
| Estilos | Tailwind CSS v3 + variables CSS custom |
| Componentes | shadcn/ui v4 con `@base-ui/react` (NO Radix) |
| AI | Anthropic SDK — `claude-opus-4-6` (análisis) y `claude-haiku-4-5` (recomendador) |
| Cache / Rate limit | Upstash Redis |
| Noticias | NewsAPI |
| Deploy | Vercel |

---

## Estructura de archivos clave

```
app/
  page.tsx                  — Página principal
  layout.tsx                — Font, TooltipProvider
  globals.css               — Variables CSS dark theme, sin @import shadcn
  admin/page.tsx            — Dashboard de uso (protegido por ?key=)
  api/
    analisis/route.ts       — Claude analiza el mercado (Opus, 30min cache)
    recomendar/route.ts     — Wizard de recomendación (Haiku, rate limit IP)
    cotizaciones/route.ts   — Proxy Bluelytics (15min cache)
    noticias/route.ts       — NewsAPI + Claude resumen (1h cache)

lib/
  claude.ts                 — Cliente Anthropic + SYSTEM_PROMPT
  redis.ts                  — Cliente Upstash + helpers getCached/setCache
  cotizaciones.ts           — Fetch api.bluelytics.com.ar/v2/latest
  constants.ts              — FREE_LIMIT, LIMIT_TTL_SECONDS (safe para client+server)

components/
  Semaforo.tsx              — Grilla de activos con status Claude
  AssetCard.tsx             — Card expandible con dot animado
  Recomendador.tsx          — Wizard 2 pasos + resultado + paywall
  GlosarioTooltip.tsx       — Tooltip con términos financieros
  ui/                       — Componentes shadcn/base-ui
```

---

## Variables de entorno requeridas

```bash
ANTHROPIC_API_KEY=          # Anthropic Console
UPSTASH_REDIS_REST_URL=     # Upstash dashboard
UPSTASH_REDIS_REST_TOKEN=   # Upstash dashboard
NEWS_API_KEY=               # newsapi.org
ADMIN_SECRET=               # Clave para /admin?key=XXX (inventala, cualquier string)
```

---

## Decisiones de arquitectura importantes

### @base-ui/react vs Radix
shadcn v4 usa `@base-ui/react`, NO `@radix-ui`. Las APIs son distintas:
- `TooltipProvider` usa `delay` (no `delayDuration`)
- `TooltipTrigger` usa `render={<span />}` (no `asChild`)
- `Progress` no aplica width automático desde `value` — usar `<div>` con `style={{ width: \`${n}%\` }}`

### Tailwind CSS v3
El proyecto usa Tailwind v3. NO agregar `@import "shadcn/tailwind.css"` ni imports de shadcn v4 en globals.css — rompe el build.

### Boundary server/client
`lib/constants.ts` existe específicamente para exportar constantes que usan tanto routes de servidor como componentes cliente. NO importar desde archivos de route en componentes cliente (next/headers es server-only).

### Modelos Claude
- `/api/analisis` → `claude-opus-4-6` (razonamiento complejo, 30min cache en Redis)
- `/api/recomendar` → `claude-haiku-4-5` (formato simple, más barato, menos carga)
- Cliente Anthropic tiene `maxRetries: 3` para manejar errores 529 overloaded

### Extracción de JSON de Claude
Siempre usar regex antes de `JSON.parse`:
```typescript
const jsonMatch = text.match(/\{[\s\S]*\}/);
if (!jsonMatch) throw new Error("No JSON found");
const data = JSON.parse(jsonMatch[0]);
```
Claude a veces envuelve el JSON en bloques markdown.

### Rate limiting
- Fuente de verdad: Redis key `recomendar:uses:{ip}` con TTL de 12 horas
- Mirror cliente: localStorage key `finar_rec_uses`
- Al montar Recomendador: fetch GET /api/recomendar, tomar el mayor entre ambos
- GET /api/recomendar devuelve `{ used, limit, ttl }` — ttl en segundos para calcular hora de renovación

### Analytics en Redis
Los contadores se incrementan solo en POST /api/recomendar exitoso:
- `stats:total` — contador global
- `stats:day:YYYY-MM-DD` — por día
- `stats:hour:YYYY-MM-DD:H` — por hora UTC
- `stats:profile:{low|medium|high}` — por perfil de riesgo
- `stats:ips:YYYY-MM-DD` — Set de IPs únicas del día

### Dashboard admin
Ruta: `/admin?key={ADMIN_SECRET}`
- Si la key no coincide → 404 (nunca revelar que existe)
- Server component, lee Redis directo, no usa JS extra
- `export const dynamic = "force-dynamic"` para evitar cache de Next.js

### Progress bars en Recomendador
NO usar el componente `<Progress>` de shadcn/base-ui. Usar div custom:
```tsx
<div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
  <div style={{ width: `${item.porcentaje}%`, background: "linear-gradient(...)" }} />
</div>
```

---

## Convenciones de código

- Componentes en `components/` son Client Components (`"use client"`) salvo excepción
- API routes en `app/api/` son Server Components por defecto
- Siempre usar `Promise.allSettled` para operaciones de analytics — nunca fallar una respuesta por un contador
- Cache con `getCached<T>()` de redis.ts — retorna null si no existe o falla
- Fallback a stale cache si Claude falla (ver analisis/route.ts)

---

## Tarea base al deployar

**Antes de cada deploy, siempre:**
1. Incrementar versión en `package.json` (patch → minor → major según cambios)
2. Agregar entrada en `CHANGELOG.md` con fecha, versión y resumen de cambios
3. Commit con mensaje `chore: bump version to X.X.X`

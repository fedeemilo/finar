# FinAR — Instrucciones para agentes

## Qué es este proyecto

FinAR es un asesor financiero para argentinos. Responde "¿En qué me conviene invertir hoy?" usando Claude como analista de mercado real, cotizaciones en tiempo real y noticias económicas.

URL producción: https://finar.fedmilo.com
Repo: https://github.com/fedeemilo/finar

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 14 App Router |
| Lenguaje | TypeScript strict |
| Estilos | Tailwind CSS v3 + variables CSS custom |
| Componentes | shadcn/ui v4 con `@base-ui/react` (NO Radix) |
| AI | Anthropic SDK — `claude-sonnet-4-6` (análisis) y `claude-haiku-4-5` (recomendador) |
| Cache / Rate limit | Upstash Redis |
| Noticias | NewsAPI |
| Deploy | Vercel |

---

## Estructura de archivos clave

```
app/
  page.tsx                          — Página principal (async server component, lee Redis con fallback on-demand)
  layout.tsx                        — Font, TooltipProvider, FOUC prevention script
  globals.css                       — Variables CSS dark/light theme, sin @import shadcn
  admin/page.tsx                    — Dashboard de uso (protegido por ?key=)
  noticias/page.tsx                 — Noticias general (Redis `noticias:diarias`)
  noticias/tech/page.tsx            — Noticias tech (Redis `noticias:tech`)
  noticias/archivo/page.tsx         — Índice archivo general (BD, hasta 60 días)
  noticias/archivo/[fecha]/page.tsx — Snapshot diario general
  noticias/tech/archivo/page.tsx    — Índice archivo tech
  noticias/tech/archivo/[fecha]/page.tsx — Snapshot diario tech
  api/
    analisis/route.ts               — GET on-demand con stale-while-revalidate (fallback; no se llama desde el home ya)
    analisis/revalidate/route.ts    — Endpoint con CRON_SECRET para que n8n regenere el cache
    noticias/route.ts               — GET on-demand análogo al de analisis
    noticias/revalidate/route.ts    — Endpoint con CRON_SECRET para que n8n regenere noticias
    recomendar/route.ts             — Wizard de recomendación (Haiku, rate limit IP)
    cotizaciones/route.ts           — Proxy Bluelytics (15min cache)

lib/
  analisis.ts               — generarAnalisis(), constantes de cache, interfaces (NO en route.ts)
  noticias.ts               — generarNoticias(), constantes de cache, Noticia interface (espejo de analisis.ts)
  claude.ts                 — Cliente Anthropic + SYSTEM_PROMPT
  redis.ts                  — Cliente Upstash + helpers getCached/setCache
  cotizaciones.ts           — Fetch api.bluelytics.com.ar/v2/latest
  rss.ts                    — Fetch feeds RSS para noticias del análisis
  constants.ts              — FREE_LIMIT, LIMIT_TTL_SECONDS (safe para client+server)

components/
  Semaforo.tsx                  — Server component: recibe `analisis` prop, renderiza grilla (sin fetch propio)
  AssetCard.tsx                 — Client component: contiene ASSET_META (íconos Lucide), maneja expansión
  NoticiaCard.tsx               — Client component: card de noticia con "Para vos"
  NoticiasSection.tsx           — Server component: recibe `noticias` prop (sin fetch propio)
  Recomendador.tsx              — Wizard 2 pasos + resultado + paywall
  ThemeToggle.tsx               — Toggle dark/light mode (sun/moon)
  GlosarioTooltip.tsx           — Tooltip con términos financieros
  NoticiaImagenFallback.tsx     — Imagen con fallback por degradado según fuente (client component)
  NoticiasArchivoChips.tsx      — Chips inline (≤7 días, máx 4) + link a archivo completo
  NoticiasArchivoIndex.tsx      — Layout índice `/noticias/archivo` y `/noticias/tech/archivo`
  FinarBrand.tsx                — Logo + wordmark + badge BETA (navbar home)
  ui/                           — Componentes shadcn/base-ui

n8n/
  news_summary_n8n.json              — Refresca `noticias:diarias` (Opus + scraping og:image), 2x/día (09:00 + 18:00 ARG)
  tech_summary_n8n.json              — Refresca `noticias:tech`, 2x/día (09:30 + 18:30 ARG)
  home_analisis_refresh_n8n.json     — Pega a `/api/analisis/revalidate` cada 4hs (03,07,11,15,19,23 ARG)
  home_noticias_refresh_n8n.json     — Pega a `/api/noticias/revalidate` cada 4hs (mismas horas)
```

---

## Variables de entorno requeridas

```bash
ANTHROPIC_API_KEY=          # Anthropic Console
UPSTASH_REDIS_REST_URL=     # Upstash dashboard
UPSTASH_REDIS_REST_TOKEN=   # Upstash dashboard
NEWS_API_KEY=               # newsapi.org
ADMIN_SECRET=               # Clave para /admin?key=XXX (inventala, cualquier string)
CRON_SECRET=                # Opcional — Vercel lo envía como Bearer token al cron de revalidación
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

**No pasar funciones/componentes React como props entre server → client.** Los íconos de `lucide-react` son funciones; si un server component los pasa como prop a un client component, RSC tira: *"Functions cannot be passed directly to Client Components"*. Patrón usado en [components/Semaforo.tsx](components/Semaforo.tsx) + [components/AssetCard.tsx](components/AssetCard.tsx): el server pasa solo data serializable (`{id, status, veredicto, porque}`) y el client mantiene su propio map `id → {nombre, icono, glosarioTerm}` (ASSET_META vive en `AssetCard.tsx`).

### Modelos Claude
- `/api/analisis` → `claude-sonnet-4-6` (cold start ~6-10s, stale-while-revalidate cubre al usuario)
- `/api/recomendar` → `claude-haiku-4-5` (formato simple, más barato, menos carga)
- `news_summary_v2.json` (n8n) → `claude-opus-4-6` (corre 1 vez/día a las 9am, costo ~$0.10-0.20/día, calidad máxima justificada)
- Cliente Anthropic tiene `maxRetries: 3` para manejar errores 529 overloaded
- **NO usar `claude-opus-4-6` en endpoints de usuario** — cold start de 30-40s es inaceptable sin cache
- El error 529 "Overloaded" de la API de Anthropic es transitorio — reintentar es suficiente

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
- Al montar Recomendador: fetch GET /api/recomendar, sincronizar con servidor
- **Bug corregido (v0.1.7):** `Math.max(local, server)` nunca permitía que el límite se renovara porque localStorage persistía el valor 3 aunque Redis expirara. Fix: si `ttl <= 0` (key expirada), confiar en el servidor y resetear localStorage. Solo usar `Math.max` cuando `ttl > 0`.
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

### Dark / Light mode
- Toggle en el header (`ThemeToggle.tsx`) — guarda en `localStorage` key `theme`
- Script inline en `<head>` de `layout.tsx` previene FOUC antes de que React hidrate
- `<html>` tiene `suppressHydrationWarning` para evitar mismatch en SSR
- Variables CSS en `globals.css`: `:root` para light, `.dark` para dark
  - Fondo: `--bg-start`, `--bg-end` (gradiente de página)
  - Colores: `--background`, `--foreground`, `--border`
- En componentes usar siempre `dark:` variants — nunca hardcodear colores oscuros
- Fondo de cards en light mode: `bg-white/80` (NO `bg-black/[0.04]` — es invisible sobre fondo crema)
- Bordes en light mode: `border-black/[0.12]` (NO `border-black/[0.07]` — muy sutil)

### Home server-rendered desde Redis
A partir de v0.2.0 la home no fetchea desde el cliente. `app/page.tsx` es async server component que:
1. Llama `loadAnalisis()` + `loadNoticias()` en `Promise.all`
2. Cada loader: fresh cache → stale cache → fallback on-demand (genera con Claude + escribe Redis)
3. Pasa la data como prop a `<Semaforo analisis={...} />` y `<NoticiasSection noticias={...} />`

El HTML llega con contenido en el primer paint — sin skeletons. Si los workflows n8n de refresh están corriendo, el fallback on-demand casi nunca se ejecuta (Redis siempre tiene fresh). Si Redis está vacío Y Claude falla, se renderiza un mensaje "no se pudo cargar" inline (no EmptyState — el home tiene que tener contenido).

`force-dynamic` en page.tsx evita que Next.js intente cachear el HTML.

`LastUpdated` del header usa el `timestamp` del análisis con `timeZone: "America/Argentina/Buenos_Aires"` fijo — consistente entre server y client, sin hydration mismatch.

### Stale-while-revalidate (análisis + noticias)
Mismo patrón para los 2 endpoints del home:

| | Análisis | Noticias |
|---|---|---|
| Fresh key | `analisis:semaforo` | `noticias:processed` |
| Fresh TTL | 30 min | 1 h |
| Stale key | `analisis:semaforo:stale` | `noticias:processed:stale` |
| Stale TTL | 4 h | 6 h |
| Revalidate endpoint | `/api/analisis/revalidate` | `/api/noticias/revalidate` |
| Cron n8n | `home_analisis_refresh_n8n.json` | `home_noticias_refresh_n8n.json` |
| Frecuencia | cada 4hs (03,07,11,15,19,23 ARG) | misma |

- Ambos `/revalidate` requieren `Authorization: Bearer ${CRON_SECRET}` si la env var está seteada
- El home (`app/page.tsx`) y los GET `/api/*` siempre sirven stale instantáneamente si fresh expiró
- El cron borra el lock `REFRESH_LOCK` tras regenerar análisis para evitar doble refresh simultáneo (noticias no tiene lock — corre rápido)
- **NO usar `unstable_after`** — no disponible en Next.js 14.2.x

### Restricción de exports en route files de Next.js
- Los archivos `app/api/*/route.ts` solo pueden exportar handlers HTTP (`GET`, `POST`, etc.) y config (`dynamic`, `runtime`)
- Toda lógica compartida debe vivir en `lib/` — por eso existen `lib/analisis.ts` y `lib/noticias.ts`
- Exportar funciones arbitrarias desde un route file causa error de build
- Re-exportar tipos sí está permitido (`export type { Foo } from "@/lib/x"`)

### Páginas de noticias (`/noticias`, `/noticias/tech`)

- **Live:** Redis keys `noticias:diarias` (general) y `noticias:tech` (tech), escritas por n8n 2x/día.
- **Archivo por fecha:** snapshots en Postgres (`kind`: `noticias-diarias` | `noticias-tech`) → `/noticias/archivo/[fecha]` y `/noticias/tech/archivo/[fecha]`.
- **Índice archivo:** `/noticias/archivo` y `/noticias/tech/archivo` listan hasta 60 fechas (`NoticiasArchivoIndex`).
- **Chips inline:** `NoticiasArchivoChips` muestra máx 4 fechas de los últimos 7 días (`MAX_CHIP_DAYS_AGO` en `lib/dates.ts`) + link "Todo el archivo".

**Estructura del JSON en Redis (top3):**
```typescript
{
  fecha: string;
  resumen: string;
  top3: [{
    titulo: string;
    descripcion: string;
    url: string;
    imagen: string;        // og:image scrapeada, o ""
    fuente?: string;       // nombre del medio (legacy / ideal)
    categoria?: string;    // lo que devuelve Claude hoy (general: politica|economia|…; tech: ai|security|…)
  }];
  tendencias: string[];
  conclusion: string;
}
```

`NoticiasDiariasLayout` usa `noticiaFuente()` para resolver label: `fuente` → `categoria` mapeada → hostname de `url` → `"Fuente"`.

**TTL Redis:** 90000 segundos (~25h). Se sobreescribe cada ejecución del workflow (SET sin acumulación).

**Diseño:** editorial estilo portal de noticias — `max-w-7xl`, hero full-width con gradient overlay, grid 2 columnas para noticias secundarias, sidebar de conclusión con bordes de 3px estilo diario.

**`NoticiaImagenFallback`** es un client component que maneja `onError` de la imagen. Fallback por degradado según fuente/categoría. **Siempre** guardar contra `fuente` undefined antes de `.toLowerCase()`.

**Contraste light mode:** nunca usar `text-zinc-400` para texto informativo sobre fondo blanco — mínimo `text-zinc-500` (contrast ratio ~4.6:1). `text-zinc-300` es invisible en light mode.

### Workflows n8n

Hay 4 workflows activos:

| Archivo | Qué hace | Frecuencia |
|---|---|---|
| `news_summary_n8n.json` | Genera `noticias:diarias` (RSS → Opus → og:image → Redis) | 09:00 + 18:00 ARG |
| `tech_summary_n8n.json` | Genera `noticias:tech` (mismo pipeline con feeds tech) | 09:30 + 18:30 ARG |
| `home_analisis_refresh_n8n.json` | HTTP GET a `/api/analisis/revalidate` | cada 4hs ARG |
| `home_noticias_refresh_n8n.json` | HTTP GET a `/api/noticias/revalidate` | cada 4hs ARG |

Los 2 workflows del home son muy simples (Schedule Trigger + HTTP Request con `Authorization: Bearer ${CRON_SECRET}`). Al importar reemplazar los placeholders `REEMPLAZAR-DOMINIO` y `REEMPLAZAR_CRON_SECRET`.

### Workflow `news_summary_n8n.json` — pipeline detallado

Flujo activo. **Nunca usar `news_summary.json` original** — está deprecado.

**Pipeline:**
```
Schedule (09:00 + 18:00 ARG)
→ 5 RSS feeds en paralelo (LN, Ámbito, BBC, Perfil, Clarín)
→ Limit 10 c/u → Merge (50 artículos)
→ Python: formatear artículos con texto + imagen RSS si existe
→ Claude Opus 4.6: generar JSON estructurado (resumen, top3, tendencias, conclusion)
→ Parsear JSON Claude (validar estructura, agregar fecha)
→ Preparar scraping: split en 3 items (uno por URL del top3)
→ Scrape artículo: HTTP GET con User-Agent, timeout 10s, continueOnFail
→ Extraer og:image: regex sobre HTML, decodificar &amp; → &
→ Agregar resultados: Aggregate node → 1 item con array de 3
→ Reconstruir con imágenes: inyectar og:image en data, armar upstashBody
→ Guardar en Upstash Redis: POST al REST API con comando ["SET", key, value, "EX", "90000"]
```

**Credencial Upstash en n8n:** tipo "Header Auth", Header Name: `Authorization`, Header Value: `Bearer {UPSTASH_REDIS_REST_TOKEN}`. URL del nodo HTTP apunta al root de Upstash (sin path).

**Body de Upstash:** enviar como raw `application/json` con el array stringificado `JSON.stringify(["SET", ...])`. Si se envía como JSON body del nodo n8n, lo envuelve en objeto y falla con "expected JSON array".

**og:image:** las URLs extraídas del HTML pueden tener entidades HTML (`&amp;`). Siempre decodificar con `.replace(/&amp;/g, '&')` antes de guardar.

**Retry en Claude:** el nodo "Analizar con Claude" puede fallar con error 529 (overloaded). Configurar "Retry On Fail" en el nodo con 3 intentos y 10s de espera.

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
3. Si hubo cambios de arquitectura, modelos, componentes o decisiones clave → actualizar `CLAUDE.md` y/o `README.md`
4. Commit con mensaje `chore: bump version to X.X.X`

# Changelog

## [0.2.3] — 2026-07-12

### Agregado
- **Vercel Web Analytics**: `@vercel/analytics` + `<Analytics />` en `app/layout.tsx`.

---

## [0.2.2] — 2026-07-12

### Agregado
- **Home → Noticias más visible**: card CTA bajo el hero con ticker de titulares en vivo (`NoticiasHomeLink`), pill en navbar desktop, headlines desde Redis diarias/tech.
- **Análisis noticias mejorado**: separador "Análisis del día", mini-nav sticky solo en mobile (`Notas · Análisis · Patrones`), resumen colapsable en mobile, primera oración en negrita en tendencias (`TendenciaTexto`).
- **Archivo por mes**: `ArchivoFechasPorMes` agrupa fechas en acordeones mensuales en `/archivo`, `/noticias/archivo` y `/noticias/tech/archivo`.

### Corregido
- **Recomendador en mobile**: eliminado skeleton `animate-pulse` y `backdrop-blur` que titilaban al cargar.
- **Ticker home**: animación siempre activa cuando hay titulares (bug en detección de overflow).

### Cambiado
- Sección análisis en noticias: reorden mobile (resumen → lo esencial → patrones), anchors `#analisis` / `#patrones` separados, mini-nav oculta en desktop.
- Prompts n8n (`news_summary`, `tech_summary`): tendencias con primera oración autocontenida para mejor parsing en UI.
- Animación ticker: 24s por ciclo.

---

## [0.2.1] — 2026-06-09

### Corregido
- **`/noticias/tech` crasheaba en prod**: el workflow n8n guarda `categoria` en `top3`, no `fuente`. `NoticiaImagenFallback` llamaba `.toLowerCase()` sobre `undefined` al mostrar el fallback de imagen. Fix: helper `noticiaFuente()` en `NoticiasDiariasLayout` + guard defensivo en el componente.

### Agregado
- **`/noticias/archivo`** y **`/noticias/tech/archivo`**: páginas índice de archivo histórico (hasta 60 días), espejo de `/archivo` del home. Componente compartido `NoticiasArchivoIndex`.
- Chips de noticias: link **"Todo el archivo"** hacia el índice correspondiente.

### Cambiado
- Chips inline (noticias + home): máximo **4 chips**, solo fechas de los **últimos 7 días** (`MAX_CHIP_DAYS_AGO` en `lib/dates.ts`). Fechas más viejas solo en la página de archivo.

---

## [0.2.0] — 2026-06-03

### Cambiado
- **Home renderiza server-side desde Redis**: `Semaforo` y `NoticiasSection` ya no son client components con `useEffect + fetch`. Reciben datos por prop. Adiós skeletons + `LoadingMessage`. La página llega con contenido en el primer paint, igual que `/noticias`.
- `app/page.tsx`: ahora es async server component. Llama `getCached` + fallback on-demand (genera con Claude y escribe Redis si está vacío). `Promise.all` paraleliza análisis + noticias.
- `LastUpdated` del header ahora muestra el `timestamp` real del análisis (timezone ARG fijo) — no la hora del render.
- Lógica de generación de noticias migrada a `lib/noticias.ts` (espejo de `lib/analisis.ts`). El endpoint `/api/noticias` ahora es un thin handler que importa del lib.
- Noticias del home ahora tienen `STALE_KEY` + `STALE_TTL` (6h) igual que análisis — mismo patrón stale-while-revalidate.

### Agregado
- `app/api/noticias/revalidate/route.ts`: endpoint con auth `CRON_SECRET` para que n8n regenere el cache (espejo de `/api/analisis/revalidate`).
- `n8n/home_analisis_refresh_n8n.json` y `n8n/home_noticias_refresh_n8n.json`: dos workflows que pegan a los endpoints `/revalidate` cada 4hs (3, 7, 11, 15, 19, 23 ARG). Antes de importar reemplazar `REEMPLAZAR-DOMINIO` y `REEMPLAZAR_CRON_SECRET`.
- Workflows `news_summary_n8n.json` y `tech_summary_n8n.json` ahora corren 2x/día (09:00 + 18:00 ARG y 09:30 + 18:30 ARG respectivamente) para más dinamismo en `/noticias` y `/noticias/tech`.

### Notas de deploy
- Verificar que `CRON_SECRET` esté en Vercel env vars.
- Importar los 2 workflows nuevos en n8n y reemplazar los placeholders antes de activarlos.
- Re-importar (overwrite) `news_summary_n8n.json` y `tech_summary_n8n.json` para que tomen el segundo horario.

---

## [0.1.10] — 2026-04-28

### Agregado
- Página `/noticias/tech`: resumen diario tech alimentado por n8n + Claude vía Redis (`noticias:tech`)
- Componente `NoticiasTabNav`: tab nav compartido entre `/noticias` y `/noticias/tech` con acento emerald/indigo respectivamente
- Workflow n8n `tech_summary_v2.json`: misma pipeline que news_summary_v2 pero con fuentes tech (HN, dev.to, GitHub Blog, Next.js, TechCrunch) — corre a las 9:30am diario

### Cambiado
- Página `/noticias`: ahora incluye `NoticiasTabNav active="general"` debajo del top nav

---

## [0.1.9] — 2026-04-28

### Cambiado
- Página `/noticias`: rediseño editorial completo — layout max-w-7xl, hero full-width con gradient overlay, grid 2 columnas para noticias secundarias, sidebar de conclusión, tipografía de diario
- Página `/noticias`: ThemeToggle agregado en navbar superior
- Página `/noticias`: contraste de texto mejorado en light mode (zinc-400 → zinc-500/600 en textos secundarios, zinc-300 → zinc-500 en créditos)

---

## [0.1.8] — 2026-04-28

### Agregado
- Página `/noticias`: resumen diario editorial alimentado por n8n + Claude vía Redis (`noticias:diarias`)
- Componente `NoticiaImagenFallback`: imagen con fallback por degradado según fuente (LN, Ámbito, BBC, Perfil, Clarín)
- Link "Noticias" en el header de la home
- Workflow n8n `news_summary_v2.json`: emite JSON estructurado y escribe a Upstash en vez de enviar email

---

## [0.1.7] — 2026-04-28

### Corregido
- Recomendador: el paywall ya no queda bloqueado permanentemente — al expirar el TTL de Redis (12h), se limpia localStorage y se restauran las 3 consultas correctamente

---

## [0.1.6] — 2026-03-20

### Agregado
- Footer: leyenda "Hecho con ♥ por fedmilo" con link a fedmilo.com
- Semáforo: mensajes de carga rotativos durante el análisis — texto cambia cada 6-8s para informar al usuario del proceso
- Semáforo: subtítulo "Tocá cada activo..." se oculta durante la carga y aparece solo cuando los datos están listos

---

## [0.1.5] — 2026-03-19

### Cambiado
- Light mode: cards con fondo `bg-white/80` en lugar de casi-transparente en cards de noticias y Recomendador
- Light mode: texto del paywall "Podés volver a consultar..." mejorado de `gray-300` a `gray-500`
- Íconos Semáforo: `BrainCircuit` → `Brain` (más simple); tamaño ajustado a 22px
- Reemplazado emoji 🔒 por ícono `Lock` de Lucide en el Paywall

### Documentación
- `CLAUDE.md`: actualizado modelo (Sonnet), estructura de archivos, dark mode, stale-while-revalidate, restricciones de route files, deploy checklist
- `README.md`: actualizado stack, activos (CCL → Blue), estructura de archivos, env vars

---

## [0.1.4] — 2026-03-19

### Cambiado
- Semáforo: reemplazado emoji 🧠 por ícono `BrainCircuit` de Lucide React en el bloque de contexto
- Semáforo: carga rápida con stale-while-revalidate — datos viejos se sirven instantáneo mientras el cron actualiza en segundo plano
- Semáforo: Dólar CCL reemplazado por Dólar Blue (más relevante para el usuario común)
- Semáforo: íconos tipográficos reemplazados por íconos Lucide React por activo
- Análisis de mercado: migrado de `claude-opus-4-6` a `claude-sonnet-4-6` (cold start ~6-10s vs 30-40s)
- Cache: TTL fresco 30 min + TTL stale 4 h; Vercel Cron cada 25 min mantiene caché caliente

---

## [0.1.3] — 2026-03-19

### Corregido
- Semáforo: al expandir una card, ya no estira la card adyacente en la misma fila (`items-start` en el grid)
- Semáforo: texto expandido ya no se corta — contenedor con `max-h` ampliado y scroll interno estilizado

---

## [0.1.2] — 2026-03-19

### Agregado
- Toggle dark/light mode en el header (ícono sol/luna)
  - Tema claro: fondo crema `#f5f0eb`, textos oscuros, bordes sutiles
  - Persiste en localStorage, detecta preferencia del sistema al primer acceso
  - Script inline en `<head>` previene FOUC antes de que React hidrate
- Soporte completo de `dark:` variants en todos los componentes:
  `AssetCard`, `Semaforo`, `NoticiaCard`, `NoticiasSection`, `Recomendador`, `GlosarioTooltip`, `page.tsx`
- Gradiente de fondo usa variables CSS (`--bg-start`, `--bg-end`) para cambio instantáneo sin parpadeo

Todos los cambios relevantes del proyecto se documentan aquí.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/).

---

## [0.1.1] — 2026-03-19

### Cambiado
- Sección de noticias migrada de NewsAPI a RSS feeds directos (sin límites de plan)
  - Fuentes: El Cronista, iProfesional, Ámbito, La Nación, Infobae, BBC Mundo, Perfil
  - Claude Haiku selecciona las 5 noticias más relevantes para inversores de un pool de 20
  - Semáforo también usa RSS como contexto de noticias para sus análisis
- Rediseño de cards de noticias: columna única, más espacio, jerarquía visual mejorada
  - Bloque "¿Qué significa para mí?" reemplazado por acento con borde izquierdo verde
  - Meta row con dot de color, fuente y link externo integrado
- Paywall del recomendador simplificado: removido bloque "Plan Pro"
- Hora de renovación del límite: formato corregido a `2:45 am` sin locale artifacts

---

## [0.1.0] — 2026-03-19

### Agregado
- Semáforo de activos con Claude como analista de mercado real (Opus 4.6)
  - Activos: MEP, CCL, Plazo Fijo, CEDEARs, Cripto (BTC/ETH), Oro
  - Status verde/amarillo/rojo con veredicto y justificación
  - Contexto general de mercado encima de la grilla
  - Cache Redis 30 minutos, fallback a stale cache si Claude falla
- Noticias económicas resumidas por Claude con enfoque "¿qué significa para mí?"
  - Cache Redis 1 hora, fallback a noticias mock si NewsAPI falla
- Recomendador wizard (2 pasos: monto + perfil de riesgo)
  - Perfiles: conservador / moderado / arriesgado
  - Monedas: ARS y USD
  - Resultado con distribución de cartera y barras de porcentaje
  - Descarga en PDF (print dialog con HTML generado)
  - Botón "Calcular de nuevo"
- Rate limiting: 3 recomendaciones gratuitas cada 12 horas por IP
  - Redis como fuente de verdad, localStorage como mirror cliente
  - Hora exacta de renovación calculada desde TTL real de Redis
  - Paywall con hora de renovación al agotar el límite
- Cotizaciones en tiempo real (Bluelytics API) con cache 15 minutos
  - Dólar oficial, blue, MEP y CCL
- Glosario financiero con tooltips en términos técnicos
- Panel de uso en `/admin?key={ADMIN_SECRET}`
  - Contadores: total histórico, recomendaciones por día, por hora, por perfil
  - IPs únicas por día (Set Redis)
  - Sin bots — se registra solo en recomendaciones exitosas
- UI dark mode completa
  - Fondo `#0a0a0f`, acento `#00c896`
  - Plus Jakarta Sans
  - Cards glassmorphism, dots de estado animados, skeletons de carga

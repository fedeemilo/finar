# Changelog

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

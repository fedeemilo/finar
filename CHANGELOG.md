# Changelog

Todos los cambios relevantes del proyecto se documentan aquí.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/).

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

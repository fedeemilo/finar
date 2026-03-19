# FinAR

**¿En qué me conviene invertir hoy?**

Asesor financiero para argentinos potenciado por IA. Analiza el mercado en tiempo real — cotizaciones del dólar, noticias económicas y contexto argentino — y te dice dónde poner la plata de forma simple y clara.

---

## Qué hace

- **Semáforo de activos** — Claude analiza MEP, CCL, Plazo Fijo, CEDEARs, Cripto y Oro y les asigna un estado (verde / amarillo / rojo) con contexto de por qué
- **Noticias resumidas** — Las principales noticias económicas del día explicadas en lenguaje simple
- **Recomendador personalizado** — Wizard de 2 pasos: ingresás tu monto, moneda y perfil de riesgo, y Claude genera una distribución de cartera con barras de porcentaje y PDF descargable
- **Rate limiting** — 3 recomendaciones gratuitas cada 12 horas por IP, con hora exacta de renovación

---

## Stack

- **Next.js 14** App Router + TypeScript
- **Tailwind CSS v3** con tema dark custom
- **shadcn/ui v4** con `@base-ui/react`
- **Anthropic SDK** — `claude-opus-4-6` para análisis de mercado, `claude-haiku-4-5` para recomendaciones
- **Upstash Redis** — cache de cotizaciones/noticias/análisis + rate limiting + analytics
- **NewsAPI** — titulares económicos en tiempo real

---

## Setup local

### 1. Clonar e instalar

```bash
git clone https://github.com/fedeemilo/finar
cd finar
npm install
```

### 2. Variables de entorno

Crear `.env.local` en la raíz:

```bash
ANTHROPIC_API_KEY=        # console.anthropic.com
UPSTASH_REDIS_REST_URL=   # console.upstash.com
UPSTASH_REDIS_REST_TOKEN= # console.upstash.com
NEWS_API_KEY=             # newsapi.org
ADMIN_SECRET=             # cualquier string, para /admin?key=XXX
```

### 3. Correr en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## Deploy en Vercel

1. Importar el repo desde [vercel.com/new](https://vercel.com/new)
2. Agregar las 5 variables de entorno en el dashboard de Vercel
3. Deploy automático en cada push a `main`

---

## Panel de uso

Disponible en `/admin?key={ADMIN_SECRET}`. Muestra:

- Total de recomendaciones generadas (histórico y hoy)
- IPs únicas del día
- Distribución de perfiles de riesgo (conservador / moderado / arriesgado)
- Actividad por día (últimos 7 días) y por hora (hoy)

Los datos se registran solo cuando se genera una recomendación exitosa, sin bots ni tráfico falso.

---

## Estructura del proyecto

```
app/
├── page.tsx              Página principal
├── layout.tsx            Font + providers
├── globals.css           Variables CSS dark theme
├── admin/page.tsx        Dashboard de uso (server component)
└── api/
    ├── analisis/         Claude analiza activos del mercado
    ├── recomendar/       Wizard con rate limiting por IP
    ├── cotizaciones/     Proxy Bluelytics con cache 15min
    └── noticias/         NewsAPI + resumen Claude con cache 1h

lib/
├── claude.ts             Cliente Anthropic + system prompt
├── redis.ts              Cliente Upstash + helpers de cache
├── cotizaciones.ts       Fetch cotizaciones dólar (Bluelytics)
└── constants.ts          Constantes compartidas server/client

components/
├── Semaforo.tsx          Grilla de activos con análisis Claude
├── AssetCard.tsx         Card con estado, veredicto y detalle
├── Recomendador.tsx      Wizard + resultado + paywall + PDF
└── GlosarioTooltip.tsx   Tooltips con términos financieros
```

---

## Licencia

MIT

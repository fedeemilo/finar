export interface Cotizaciones {
  oficial: { compra: number; venta: number };
  blue: { compra: number; venta: number };
  mep: { compra: number; venta: number };
  ccl: { compra: number; venta: number };
  timestamp: string;
  stale?: boolean;
}

export async function fetchCotizaciones(): Promise<Cotizaciones> {
  const res = await fetch("https://api.bluelytics.com.ar/v2/latest", {
    next: { revalidate: 0 },
  });

  if (!res.ok) throw new Error("bluelytics API error");

  const data = await res.json();

  return {
    oficial: {
      compra: data.oficial.value_buy,
      venta: data.oficial.value_sell,
    },
    blue: {
      compra: data.blue.value_buy,
      venta: data.blue.value_sell,
    },
    mep: {
      compra: data.oficial_euro?.value_buy ?? data.oficial.value_buy * 1.05,
      venta: data.oficial_euro?.value_sell ?? data.oficial.value_sell * 1.05,
    },
    ccl: {
      compra: data.blue.value_buy * 0.98,
      venta: data.blue.value_sell * 1.02,
    },
    timestamp: new Date().toISOString(),
  };
}

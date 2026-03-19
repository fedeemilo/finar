"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const GLOSARIO: Record<string, string> = {
  MEP: "Dólar MEP (Mercado Electrónico de Pagos): comprás bonos en pesos y los vendés en dólares. Es legal y sin límite de monto.",
  CCL: "Dólar CCL (Contado con Liquidación): similar al MEP pero te permite sacar los dólares al exterior. También es legal.",
  CEDEAR:
    "CEDEARs: certificados que representan acciones extranjeras (como Apple o Google) pero que comprás en pesos desde Argentina.",
  Plazo_Fijo:
    "Plazo Fijo: dejás tu plata en el banco por un tiempo fijo (mínimo 30 días) y te pagan un interés. Seguro pero no siempre le gana a la inflación.",
  USDT: "USDT (Tether): una criptomoneda que siempre vale 1 dólar. Es como tener dólares digitales.",
  BTC: "Bitcoin: la criptomoneda más conocida del mundo. Muy volátil, puede subir o bajar mucho en poco tiempo.",
  ETH: "Ethereum: la segunda criptomoneda más grande. También muy volátil.",
  GLD: "GLD: es el fondo de oro más conocido. Invertís en oro sin tener que comprar lingotes físicos.",
  Brecha_Cambiaria:
    "Brecha cambiaria: la diferencia entre el dólar oficial del gobierno y el dólar blue o MEP. Cuando es alta, hay más presión sobre el peso.",
  Inflación:
    "Inflación: la suba general de precios. Si la inflación es del 100% anual, tu plata vale la mitad al año siguiente si no la invertís.",
  Cepo:
    "Cepo cambiario: restricciones del gobierno para comprar dólares. Limita cuánto podés comprar por mes.",
};

interface GlosarioTooltipProps {
  term: string;
  children: React.ReactNode;
}

export function GlosarioTooltip({ term, children }: GlosarioTooltipProps) {
  const definition = GLOSARIO[term] || GLOSARIO[term.replace(" ", "_")];

  if (!definition) return <>{children}</>;

  return (
    <Tooltip>
      <TooltipTrigger
        className="border-b border-dashed border-emerald-400/50 cursor-help inline-flex items-center gap-0.5"
        render={<span />}
      >
        {children}
        <span className="text-emerald-400 text-xs ml-0.5">?</span>
      </TooltipTrigger>
      <TooltipContent
        className="max-w-xs bg-[#13131a] border border-white/10 text-white/90 text-sm p-3"
        side="top"
      >
        {definition}
      </TooltipContent>
    </Tooltip>
  );
}

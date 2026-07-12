import { splitPrimeraFrase } from "@/lib/tendencias";

export function TendenciaTexto({ texto }: { texto: string }) {
  const { lead, rest } = splitPrimeraFrase(texto);

  if (!rest) {
    return (
      <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed pt-0.5 font-semibold">
        {lead}
      </p>
    );
  }

  return (
    <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed pt-0.5">
      <span className="font-semibold text-zinc-900 dark:text-zinc-100">{lead}</span> {rest}
    </p>
  );
}

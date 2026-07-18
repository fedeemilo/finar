import { splitPrimeraFrase } from "@/lib/tendencias";

export function TendenciaTexto({ texto }: { texto: string }) {
  const { lead, rest } = splitPrimeraFrase(texto);

  if (!rest) {
    return (
      <p className="text-zinc-800 dark:text-zinc-200 text-sm leading-relaxed font-medium">
        {lead}
      </p>
    );
  }

  return (
    <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
      <span className="font-medium text-zinc-900 dark:text-zinc-100">{lead}</span> {rest}
    </p>
  );
}

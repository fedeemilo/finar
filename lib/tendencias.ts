/** Separa la primera oración (titular) del resto para destacar en UI. */
export function splitPrimeraFrase(texto: string): { lead: string; rest: string } {
  const trimmed = texto.trim();
  const match = trimmed.match(/^(.+?[.!?])(?:\s+)([\s\S]+)$/);
  if (!match) return { lead: trimmed, rest: "" };
  return { lead: match[1], rest: match[2] };
}

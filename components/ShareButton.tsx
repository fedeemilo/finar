"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export function ShareButton({ snapId, title }: { snapId: number; title?: string }) {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    const url = `${window.location.origin}/snap/${snapId}`;
    const shareTitle = title ?? "FinAR · Semáforo de activos";

    // Web Share API: mobile y algunos desktops modernos
    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, url });
        return;
      } catch {
        // Cancelado por el usuario → seguimos al fallback
      }
    }

    // Fallback: copiar al portapapeles
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // No hay clipboard API ni share API → no podemos hacer nada útil
    }
  };

  return (
    <button
      onClick={onClick}
      aria-label="Compartir snapshot del semáforo"
      title="Compartir este momento del semáforo"
      className="flex items-center justify-center w-7 h-7 rounded-full bg-black/[0.05] dark:bg-white/[0.05] hover:bg-emerald-500/15 dark:hover:bg-emerald-400/15 transition-colors text-gray-500 dark:text-white/40 hover:text-emerald-600 dark:hover:text-emerald-400"
    >
      {copied ? (
        <Check size={13} strokeWidth={2.5} className="text-emerald-600 dark:text-emerald-400" />
      ) : (
        <Share2 size={13} strokeWidth={2} />
      )}
    </button>
  );
}

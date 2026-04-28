"use client";

import { useState } from "react";

const SOURCE_COLORS: Record<string, string> = {
  "la nación": "from-blue-600 to-blue-800",
  "lanacion": "from-blue-600 to-blue-800",
  "ámbito": "from-orange-500 to-orange-700",
  "ambito": "from-orange-500 to-orange-700",
  "bbc": "from-red-600 to-red-800",
  "perfil": "from-violet-500 to-violet-700",
  "clarín": "from-cyan-600 to-cyan-800",
  "clarin": "from-cyan-600 to-cyan-800",
};

function getSourceGradient(fuente: string): string {
  const lower = fuente.toLowerCase();
  for (const [key, gradient] of Object.entries(SOURCE_COLORS)) {
    if (lower.includes(key)) return gradient;
  }
  return "from-zinc-500 to-zinc-700";
}

interface Props {
  imagen: string;
  titulo: string;
  fuente: string;
}

export function NoticiaImagenFallback({ imagen, titulo, fuente }: Props) {
  const [error, setError] = useState(false);

  if (imagen && !error) {
    return (
      <img
        src={imagen}
        alt={titulo}
        className="w-full h-full object-cover"
        onError={() => setError(true)}
      />
    );
  }

  return (
    <div className={`w-full h-full bg-gradient-to-br ${getSourceGradient(fuente)} flex items-end p-4`}>
      <span className="text-white/90 font-semibold text-xs tracking-widest uppercase">
        {fuente}
      </span>
    </div>
  );
}

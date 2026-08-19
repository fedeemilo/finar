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
  "cronista": "from-amber-700 to-amber-900",
  "infobae": "from-sky-700 to-blue-900",
  "tn": "from-blue-700 to-blue-900",
  "el diario": "from-rose-700 to-rose-900",
  "eldiario": "from-rose-700 to-rose-900",
  "tiempo": "from-red-700 to-red-900",
  "política online": "from-zinc-600 to-zinc-800",
  "lpo": "from-zinc-600 to-zinc-800",
  "the verge": "from-fuchsia-600 to-fuchsia-900",
  "ars": "from-orange-700 to-red-900",
  "wired": "from-zinc-800 to-black",
  "hacker news": "from-orange-600 to-orange-800",
  "ycombinator": "from-orange-600 to-orange-800",
  "dev.to": "from-slate-700 to-slate-900",
  "github": "from-zinc-700 to-zinc-900",
  "next.js": "from-zinc-800 to-black",
  "techcrunch": "from-emerald-600 to-emerald-800",
  "framework": "from-indigo-500 to-indigo-700",
  "ia": "from-violet-500 to-violet-700",
  "seguridad": "from-red-600 to-red-800",
  "infra": "from-sky-600 to-sky-800",
  "devops": "from-cyan-600 to-cyan-800",
};

function getSourceGradient(fuente?: string): string {
  if (!fuente) return "from-zinc-500 to-zinc-700";
  const lower = fuente.toLowerCase();
  for (const [key, gradient] of Object.entries(SOURCE_COLORS)) {
    if (lower.includes(key)) return gradient;
  }
  return "from-zinc-500 to-zinc-700";
}

interface Props {
  imagen: string;
  titulo: string;
  fuente?: string;
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
        {fuente || "Fuente"}
      </span>
    </div>
  );
}

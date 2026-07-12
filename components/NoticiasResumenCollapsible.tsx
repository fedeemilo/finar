"use client";

import { useState } from "react";

const COLLAPSE_THRESHOLD = 200;

export function NoticiasResumenCollapsible({
  text,
  accentClass,
}: {
  text: string;
  accentClass: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const collapsible = text.length > COLLAPSE_THRESHOLD;

  return (
    <>
      <p
        className={`text-zinc-800 dark:text-zinc-200 text-base sm:text-lg leading-relaxed ${
          collapsible && !expanded ? "line-clamp-4 sm:line-clamp-none" : ""
        }`}
      >
        {text}
      </p>
      {collapsible && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className={`sm:hidden mt-3 text-sm font-semibold ${accentClass} transition-opacity hover:opacity-80`}
        >
          {expanded ? "Ver menos" : "Leer más"}
        </button>
      )}
    </>
  );
}

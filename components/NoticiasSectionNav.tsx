"use client";

const BASE_SECTIONS = [
  { id: "notas", label: "Notas" },
  { id: "analisis", label: "Análisis" },
  { id: "patrones", label: "Patrones" },
] as const;

function NavLinks({
  sections,
  accentHover,
}: {
  sections: readonly { id: string; label: string }[];
  accentHover: string;
}) {
  return (
    <>
      {sections.map((section, i) => (
        <span key={section.id} className="flex items-center gap-1">
          {i > 0 && (
            <span className="text-zinc-300 dark:text-zinc-700 text-xs select-none px-0.5">·</span>
          )}
          <a
            href={`#${section.id}`}
            className={`px-3 py-1 rounded-full text-xs font-semibold text-zinc-500 dark:text-zinc-400 transition-colors ${accentHover}`}
          >
            {section.label}
          </a>
        </span>
      ))}
    </>
  );
}

export function NoticiasSectionNav({
  accentHover,
  showMercado = false,
}: {
  accentHover: string;
  showMercado?: boolean;
}) {
  const sections = showMercado
    ? [...BASE_SECTIONS, { id: "mercado", label: "Mercado" }]
    : [...BASE_SECTIONS];

  return (
    <nav
      aria-label="Secciones del día"
      className="sticky top-14 z-40 border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md lg:hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-center gap-1 py-2.5">
          <NavLinks sections={sections} accentHover={accentHover} />
        </div>
      </div>
    </nav>
  );
}

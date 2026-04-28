import Link from "next/link";
import { Newspaper, Code2 } from "lucide-react";

interface Props {
  active: "general" | "tech";
}

export function NoticiasTabNav({ active }: Props) {
  return (
    <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex">
        <Link
          href="/noticias"
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors duration-150 ${
            active === "general"
              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-zinc-500 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
          }`}
        >
          <Newspaper size={14} />
          General
        </Link>
        <Link
          href="/noticias/tech"
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors duration-150 ${
            active === "tech"
              ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-zinc-500 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
          }`}
        >
          <Code2 size={14} />
          Tech
        </Link>
      </div>
    </div>
  );
}

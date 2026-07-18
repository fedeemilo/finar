"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Recomendador } from "@/components/Recomendador";

export function InvertirModal() {
  return (
    <Dialog>
      <DialogTrigger className="inline-flex items-center rounded-full bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white px-3.5 py-1.5 text-xs font-semibold tracking-tight transition-colors active:scale-[0.97]">
        <span className="hidden sm:inline">¿En qué invierto?</span>
        <span className="sm:hidden">Invertir</span>
      </DialogTrigger>
      <DialogContent className="max-w-md border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-7 shadow-2xl">
        <DialogTitle className="text-xl font-semibold tracking-tight">
          Tengo plata. ¿Qué hago?
        </DialogTitle>
        <DialogDescription className="mb-6 text-zinc-500 dark:text-zinc-500">
          Monto, moneda y perfil. Te armamos una distribución simple.
        </DialogDescription>
        <Recomendador />
      </DialogContent>
    </Dialog>
  );
}

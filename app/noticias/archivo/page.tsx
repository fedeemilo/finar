import { loadAvailableDates } from "@/lib/db";
import { NoticiasArchivoIndex } from "@/components/NoticiasArchivoIndex";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "FinAR · Archivo de noticias",
  description: "Todos los resúmenes diarios de noticias generales archivados por FinAR.",
};

export default async function NoticiasArchivoIndexPage() {
  const fechas = await loadAvailableDates(60, "noticias-diarias").catch(() => [] as string[]);
  return <NoticiasArchivoIndex fechas={fechas} variant="general" />;
}

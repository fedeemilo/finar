import { loadAvailableDates } from "@/lib/db";
import { NoticiasArchivoIndex } from "@/components/NoticiasArchivoIndex";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "FinAR · Archivo tech",
  description: "Todos los resúmenes diarios de noticias tech archivados por FinAR.",
};

export default async function NoticiasTechArchivoIndexPage() {
  const fechas = await loadAvailableDates(60, "noticias-tech").catch(() => [] as string[]);
  return <NoticiasArchivoIndex fechas={fechas} variant="tech" />;
}

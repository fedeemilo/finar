import { notFound } from "next/navigation";
import { loadSnapshotByDate, loadAvailableDates } from "@/lib/db";
import { fechaLegibleArg } from "@/lib/dates";
import { NoticiasDiariasLayout, type NoticiasData } from "@/components/NoticiasDiariasLayout";

export const dynamic = "force-dynamic";

const FECHA_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export async function generateMetadata({ params }: { params: { fecha: string } }) {
  if (!FECHA_REGEX.test(params.fecha)) return {};
  const fechaLegible = fechaLegibleArg(params.fecha);
  return {
    title: `FinAR · Noticias del ${fechaLegible}`,
    description: `Noticias argentinas del ${fechaLegible}, resumidas por IA.`,
  };
}

export default async function NoticiasArchivoPage({ params }: { params: { fecha: string } }) {
  if (!FECHA_REGEX.test(params.fecha)) notFound();

  const [snap, fechas] = await Promise.all([
    loadSnapshotByDate<NoticiasData>("noticias-diarias", params.fecha),
    loadAvailableDates(7, "noticias-diarias").catch(() => [] as string[]),
  ]);

  return (
    <NoticiasDiariasLayout
      data={snap?.payload ?? null}
      variant="general"
      archivoFecha={params.fecha}
      fechasDisponibles={fechas}
    />
  );
}

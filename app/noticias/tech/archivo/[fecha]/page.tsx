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
    title: `FinAR · Tech del ${fechaLegible}`,
    description: `Noticias tech del ${fechaLegible}, resumidas por IA.`,
  };
}

export default async function NoticiasTechArchivoPage({ params }: { params: { fecha: string } }) {
  if (!FECHA_REGEX.test(params.fecha)) notFound();

  const [snap, fechas] = await Promise.all([
    loadSnapshotByDate<NoticiasData>("noticias-tech", params.fecha),
    loadAvailableDates(7, "noticias-tech").catch(() => [] as string[]),
  ]);

  return (
    <NoticiasDiariasLayout
      data={snap?.payload ?? null}
      variant="tech"
      archivoFecha={params.fecha}
      fechasDisponibles={fechas}
    />
  );
}

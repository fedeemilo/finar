import { getCached } from "@/lib/redis";
import { loadAvailableDates } from "@/lib/db";
import { NoticiasDiariasLayout, type NoticiasData } from "@/components/NoticiasDiariasLayout";

export const dynamic = "force-dynamic";

export default async function NoticiasTechPage() {
  const [data, fechas] = await Promise.all([
    getCached<NoticiasData>("noticias:tech"),
    loadAvailableDates(7, "noticias-tech").catch(() => [] as string[]),
  ]);

  return <NoticiasDiariasLayout data={data} variant="tech" fechasDisponibles={fechas} />;
}

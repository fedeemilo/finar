import { getCached } from "@/lib/redis";
import { loadAvailableDates } from "@/lib/db";
import { NoticiasDiariasLayout, type NoticiasData } from "@/components/NoticiasDiariasLayout";

export const dynamic = "force-dynamic";

export default async function NoticiasPage() {
  const [data, fechas] = await Promise.all([
    getCached<NoticiasData>("noticias:diarias"),
    loadAvailableDates(7, "noticias-diarias").catch(() => [] as string[]),
  ]);

  return <NoticiasDiariasLayout data={data} variant="general" fechasDisponibles={fechas} />;
}

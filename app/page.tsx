import { NoticiasDiariasLayout, type NoticiasData } from "@/components/NoticiasDiariasLayout";
import { getCached } from "@/lib/redis";
import { loadAvailableDates } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const variant = searchParams.tab === "tech" ? "tech" : "general";
  const redisKey = variant === "tech" ? "noticias:tech" : "noticias:diarias";
  const archiveKind = variant === "tech" ? "noticias-tech" : "noticias-diarias";

  const [data, fechas] = await Promise.all([
    getCached<NoticiasData>(redisKey),
    loadAvailableDates(7, archiveKind).catch(() => [] as string[]),
  ]);

  return (
    <NoticiasDiariasLayout
      data={data}
      variant={variant}
      fechasDisponibles={fechas}
      homeMode
    />
  );
}

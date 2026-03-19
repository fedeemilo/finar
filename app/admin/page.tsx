import { redis } from "@/lib/redis";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface AdminPageProps {
  searchParams: { key?: string };
}

async function getStats() {
  const today = new Date().toISOString().slice(0, 10);
  const currentHour = new Date().getUTCHours();

  // Últimos 7 días
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }

  // Horas del día de hoy (0-23)
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const [
    total,
    profileLow,
    profileMedium,
    profileHigh,
    ...rest
  ] = await Promise.all([
    redis.get<number>("stats:total"),
    redis.get<number>("stats:profile:low"),
    redis.get<number>("stats:profile:medium"),
    redis.get<number>("stats:profile:high"),
    ...days.map((d) => redis.get<number>(`stats:day:${d}`)),
    ...hours.map((h) => redis.get<number>(`stats:hour:${today}:${h}`)),
    redis.scard(`stats:ips:${today}`),
  ]);

  const dayCounts = rest.slice(0, 7).map((v) => (v as number) ?? 0);
  const hourCounts = rest.slice(7, 31).map((v) => (v as number) ?? 0);
  const uniqueIpsToday = (rest[31] as number) ?? 0;

  const todayCount = dayCounts[6];
  const maxDay = Math.max(...dayCounts, 1);
  const maxHour = Math.max(...hourCounts, 1);

  return {
    total: total ?? 0,
    todayCount,
    uniqueIpsToday,
    profiles: {
      low: profileLow ?? 0,
      medium: profileMedium ?? 0,
      high: profileHigh ?? 0,
    },
    days: days.map((d, i) => ({ date: d, count: dayCounts[i] })),
    hours: hours.map((h, i) => ({ hour: h, count: hourCounts[i] })),
    maxDay,
    maxHour,
    currentHour,
  };
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || searchParams.key !== secret) {
    notFound();
  }

  const stats = await getStats();

  const profileTotal = stats.profiles.low + stats.profiles.medium + stats.profiles.high;
  const pct = (n: number) =>
    profileTotal > 0 ? Math.round((n / profileTotal) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Panel de uso</h1>
          <p className="text-white/40 text-sm mt-1">FinAR · Datos en tiempo real desde Redis</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard label="Total histórico" value={stats.total.toString()} />
          <StatCard label="Hoy" value={stats.todayCount.toString()} />
          <StatCard label="IPs únicas hoy" value={stats.uniqueIpsToday.toString()} />
        </div>

        {/* Perfiles */}
        <Section title="Perfil de riesgo elegido">
          <div className="space-y-3">
            <ProfileBar
              label="Conservador"
              count={stats.profiles.low}
              pct={pct(stats.profiles.low)}
              color="#00c896"
            />
            <ProfileBar
              label="Moderado"
              count={stats.profiles.medium}
              pct={pct(stats.profiles.medium)}
              color="#f59e0b"
            />
            <ProfileBar
              label="Arriesgado"
              count={stats.profiles.high}
              pct={pct(stats.profiles.high)}
              color="#ef4444"
            />
          </div>
        </Section>

        {/* Últimos 7 días */}
        <Section title="Recomendaciones — últimos 7 días">
          <div className="flex items-end gap-2 h-32">
            {stats.days.map(({ date, count }) => (
              <div key={date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-white/40">{count}</span>
                <div
                  className="w-full rounded-t-sm bg-[#00c896]/70 transition-all"
                  style={{ height: `${(count / stats.maxDay) * 100}%`, minHeight: count > 0 ? "4px" : "0" }}
                />
                <span className="text-[10px] text-white/30">
                  {date.slice(5)} {/* MM-DD */}
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* Actividad por hora hoy */}
        <Section title={`Actividad por hora — hoy (UTC)`}>
          <div className="flex items-end gap-px h-20">
            {stats.hours.map(({ hour, count }) => (
              <div
                key={hour}
                className="flex-1 flex flex-col items-center"
                title={`${hour}h: ${count} recomendaciones`}
              >
                <div
                  className={`w-full rounded-t-sm transition-all ${
                    hour === stats.currentHour ? "bg-[#00c896]" : "bg-white/20"
                  }`}
                  style={{ height: `${(count / stats.maxHour) * 100}%`, minHeight: count > 0 ? "3px" : "0" }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-white/25 mt-1 px-px">
            <span>0h</span>
            <span>6h</span>
            <span>12h</span>
            <span>18h</span>
            <span>23h</span>
          </div>
        </Section>

        <p className="text-white/20 text-xs text-center">
          Los datos se registran solo cuando se genera una recomendación exitosa.
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.03] p-5">
      <p className="text-white/40 text-xs mb-1">{label}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.03] p-5 space-y-4">
      <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">{title}</h2>
      {children}
    </div>
  );
}

function ProfileBar({
  label,
  count,
  pct,
  color,
}: {
  label: string;
  count: number;
  pct: number;
  color: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-white/70">{label}</span>
        <span className="text-white/40">
          {count} ({pct}%)
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

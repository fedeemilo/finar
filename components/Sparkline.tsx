"use client";

const W = 100;
const H = 24;
const PADDING = 1;

export function Sparkline({ points }: { points: number[] }) {
  if (!points || points.length < 2) return null;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const stepX = (W - PADDING * 2) / (points.length - 1);
  const polyline = points
    .map((v, i) => {
      const x = PADDING + i * stepX;
      const y = H - PADDING - ((v - min) / range) * (H - PADDING * 2);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  const first = points[0];
  const last = points[points.length - 1];
  const pctChange = ((last - first) / first) * 100;

  // Umbral 0.5% para no marcar verde/rojo por ruido — flat queda gris
  const stroke =
    pctChange > 0.5 ? "#10b981" : pctChange < -0.5 ? "#ef4444" : "#a1a1aa";
  const textClass =
    pctChange > 0.5
      ? "text-emerald-600 dark:text-emerald-400"
      : pctChange < -0.5
        ? "text-red-500 dark:text-red-400"
        : "text-gray-500 dark:text-white/40";

  return (
    <div className="flex items-center gap-2">
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <polyline
          points={polyline}
          fill="none"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className={`text-[10px] font-medium ${textClass}`}>
        {pctChange > 0 ? "+" : ""}
        {pctChange.toFixed(1)}% / {points.length}d
      </span>
    </div>
  );
}

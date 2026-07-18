"use client";

import { useState, useEffect } from "react";
import { Lock, Download, Check } from "lucide-react";
import type { RecomendacionResponse } from "@/app/api/recomendar/route";
import { FREE_LIMIT } from "@/lib/constants";

type Currency = "ARS" | "USD";
type RiskProfile = "low" | "medium" | "high";

const LS_KEY = "finar_rec_uses";

function getRenewalTime(ttlSeconds: number): string {
  if (ttlSeconds <= 0) return "";
  const renewsAt = new Date(Date.now() + ttlSeconds * 1000);
  const h = renewsAt.getHours();
  const m = renewsAt.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "pm" : "am";
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

const PROFILES = [
  { id: "low" as RiskProfile, label: "Proteger lo que tengo", sublabel: "Mínimo riesgo" },
  { id: "medium" as RiskProfile, label: "Hacer crecer la plata", sublabel: "Riesgo moderado" },
  { id: "high" as RiskProfile, label: "Arriesgar para ganar más", sublabel: "Mayor potencial" },
];

const PROFILE_LABELS: Record<RiskProfile, string> = {
  low: "Conservador",
  medium: "Moderado",
  high: "Arriesgado",
};

function getLocalUses(): number {
  try {
    return parseInt(localStorage.getItem(LS_KEY) ?? "0", 10) || 0;
  } catch {
    return 0;
  }
}

function setLocalUses(n: number) {
  try {
    localStorage.setItem(LS_KEY, String(n));
  } catch {}
}

function downloadPDF(
  result: RecomendacionResponse,
  amount: string,
  currency: Currency,
  riskProfile: RiskProfile
) {
  const fecha = new Date().toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const itemsHTML = result.items
    .map(
      (item) => `
      <div class="item">
        <div class="item-header">
          <span class="item-nombre">${item.activo}</span>
          <span class="item-pct">${item.porcentaje}%</span>
        </div>
        <div class="bar-wrap"><div class="bar" style="width:${item.porcentaje}%"></div></div>
        <p class="item-desc">${item.descripcion}</p>
      </div>`
    )
    .join("");

  const advertenciaHTML = result.advertencia
    ? `<div class="advertencia">${result.advertencia}</div>`
    : "";

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Recomendación FinAR — ${fecha}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:48px;color:#111}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:36px;border-bottom:2px solid #111;padding-bottom:16px}
  .logo{font-size:28px;font-weight:900;letter-spacing:-1px}
  .meta{text-align:right;font-size:13px;color:#666;line-height:1.6}.meta strong{color:#111}
  h2{font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:#999;margin-bottom:10px}
  .resumen{font-size:16px;color:#222;line-height:1.6;margin-bottom:28px;padding:16px 20px;background:#f5f5f5;border-radius:8px;border-left:3px solid #111}
  .item{margin-bottom:22px}
  .item-header{display:flex;align-items:center;gap:8px;margin-bottom:8px}
  .item-nombre{font-size:15px;font-weight:600;flex:1}
  .item-pct{font-size:16px;font-weight:800}
  .bar-wrap{height:6px;background:#eee;border-radius:3px;overflow:hidden;margin-bottom:6px}
  .bar{height:100%;background:#111;border-radius:3px}
  .item-desc{font-size:13px;color:#777;line-height:1.5}
  .advertencia{margin-top:24px;padding:14px 18px;background:#f5f5f5;border:1px solid #ddd;border-radius:8px;font-size:13px;color:#444;line-height:1.6}
  .disclaimer{margin-top:40px;padding-top:20px;border-top:1px solid #eee;font-size:11px;color:#bbb;line-height:1.6}
</style></head><body>
  <div class="header">
    <div class="logo">FinAR</div>
    <div class="meta">
      <div>${fecha}</div>
      <div>Monto: <strong>${currency === "ARS" ? "$" : "USD "}${Number(amount).toLocaleString("es-AR")} ${currency}</strong></div>
      <div>Perfil: <strong>${PROFILE_LABELS[riskProfile]}</strong></div>
    </div>
  </div>
  <h2>Estrategia recomendada</h2>
  <div class="resumen">${result.resumen}</div>
  <h2>Distribución sugerida</h2>
  ${itemsHTML}${advertenciaHTML}
  <div class="disclaimer">FinAR no constituye asesoramiento financiero formal. Esta recomendación es generada por inteligencia artificial y tiene carácter informativo. Consultá con un asesor financiero matriculado antes de tomar decisiones de inversión.</div>
</body></html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
}

function Paywall({ ttl }: { ttl: number }) {
  const renewalTime = getRenewalTime(ttl);
  return (
    <div className="py-6 text-center">
      <Lock size={28} className="mx-auto mb-4 text-zinc-400 dark:text-zinc-600" strokeWidth={1.5} />
      <h3 className="text-zinc-900 dark:text-white font-semibold text-base mb-2">
        Usaste tus 3 consultas gratuitas
      </h3>
      <p className="text-zinc-500 dark:text-zinc-500 text-sm leading-relaxed max-w-xs mx-auto">
        {renewalTime ? (
          <>
            Se renuevan a las{" "}
            <span className="text-zinc-800 dark:text-zinc-300 font-medium">{renewalTime}</span>.
          </>
        ) : (
          <>El plan gratuito incluye 3 consultas cada 12 horas.</>
        )}
      </p>
    </div>
  );
}

function StepDots({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex gap-1.5">
      {[1, 2].map((s) => (
        <div
          key={s}
          className={`h-0.5 w-8 rounded-full transition-colors ${
            s <= step ? "bg-emerald-500" : "bg-zinc-200 dark:bg-zinc-800"
          }`}
        />
      ))}
    </div>
  );
}

export function Recomendador() {
  const [uses, setUses] = useState(() => getLocalUses());
  const [ttl, setTtl] = useState(-1);
  const [step, setStep] = useState<1 | 2>(1);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("ARS");
  const [riskProfile, setRiskProfile] = useState<RiskProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecomendacionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/recomendar")
      .then((r) => r.json())
      .then((data: { used: number; limit: number; ttl: number }) => {
        const serverUses = data.used ?? 0;
        const local = getLocalUses();
        const real = data.ttl > 0 ? Math.max(local, serverUses) : serverUses;
        setUses(real);
        setLocalUses(real);
        if (data.ttl > 0) setTtl(data.ttl);
      })
      .catch(() => {});
  }, []);

  const handleAmountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    setStep(2);
  };

  const handleGetRecomendacion = async () => {
    if (!riskProfile) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/recomendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), currency, riskProfile }),
      });

      if (res.status === 429) {
        const newUses = FREE_LIMIT;
        setUses(newUses);
        setLocalUses(newUses);
        return;
      }

      if (!res.ok) throw new Error("Error");

      const data = await res.json();
      const newUses = uses + 1;
      setUses(newUses);
      setLocalUses(newUses);
      setResult(data);
    } catch {
      setError("No se pudo obtener la recomendación. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setAmount("");
    setCurrency("ARS");
    setRiskProfile(null);
    setResult(null);
    setError(null);
  };

  const remaining = Math.max(0, FREE_LIMIT - uses);

  if (uses >= FREE_LIMIT && !result) return <Paywall ttl={ttl} />;

  if (result) {
    return (
      <div>
        <p className="text-zinc-800 dark:text-zinc-200 text-sm leading-relaxed mb-5">
          {result.resumen}
        </p>
        {result.advertencia && (
          <div className="mb-5 px-3 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
              {result.advertencia}
            </p>
          </div>
        )}

        <div className="space-y-4 mb-6">
          {result.items.map((item, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-zinc-800 dark:text-zinc-200 text-sm font-medium">
                  {item.activo}
                </span>
                <span className="text-zinc-900 dark:text-white font-semibold text-sm tabular-nums">
                  {item.porcentaje}%
                </span>
              </div>
              <div className="h-1 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-700 ease-out"
                  style={{ width: `${item.porcentaje}%` }}
                />
              </div>
              <p className="text-zinc-500 dark:text-zinc-500 text-xs mt-1.5 leading-relaxed">
                {item.descripcion}
              </p>
            </div>
          ))}
        </div>

        {remaining > 0 && (
          <p className="text-center text-zinc-400 dark:text-zinc-600 text-xs mb-4">
            {remaining === 1 ? "Te queda 1 consulta" : `Te quedan ${remaining} consultas`}
            {ttl > 0 && <> · se renueva a las {getRenewalTime(ttl)}</>}
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleReset}
            disabled={remaining === 0}
            className="flex-1 py-3 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Calcular de nuevo
          </button>
          <button
            type="button"
            onClick={() => downloadPDF(result, amount, currency, riskProfile!)}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white text-sm font-medium transition-colors"
          >
            <Download size={14} strokeWidth={2} />
            PDF
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <StepDots step={step} />
        <span className="text-zinc-400 dark:text-zinc-600 text-xs tabular-nums">
          {remaining === 1 ? "1 consulta" : `${remaining} consultas`}
          {ttl > 0 && (
            <span className="text-zinc-300 dark:text-zinc-700">
              {" "}
              · {getRenewalTime(ttl)}
            </span>
          )}
        </span>
      </div>

      {step === 1 && (
        <form onSubmit={handleAmountSubmit}>
          <h3 className="text-zinc-900 dark:text-white font-semibold text-base mb-1">
            ¿Cuánto tenés para invertir?
          </h3>
          <p className="text-zinc-500 dark:text-zinc-500 text-sm mb-5">
            Elegí moneda e ingresá el monto
          </p>

          <div className="grid grid-cols-2 gap-px mb-4 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-200 dark:bg-zinc-800">
            {(
              [
                { id: "ARS" as Currency, label: "Pesos", code: "ARS" },
                { id: "USD" as Currency, label: "Dólares", code: "USD" },
              ] as const
            ).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCurrency(c.id)}
                className={`py-2.5 text-sm font-medium transition-colors ${
                  currency === c.id
                    ? "bg-emerald-600 dark:bg-emerald-500 text-white"
                    : "bg-white dark:bg-zinc-950 text-zinc-500 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                }`}
              >
                <span className="block leading-tight">{c.label}</span>
                <span
                  className={`block text-[10px] font-normal tracking-wider mt-0.5 ${
                    currency === c.id
                      ? "text-white/70"
                      : "text-zinc-400 dark:text-zinc-600"
                  }`}
                >
                  {c.code}
                </span>
              </button>
            ))}
          </div>

          <div className="relative mb-5">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-600 text-sm font-medium tabular-nums">
              {currency === "ARS" ? "$" : "USD"}
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              min="1"
              className="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg pl-12 pr-4 py-3.5 text-zinc-900 dark:text-white text-xl font-semibold tabular-nums placeholder-zinc-300 dark:placeholder-zinc-700 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={!amount || Number(amount) <= 0}
            className="w-full py-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Continuar
          </button>
        </form>
      )}

      {step === 2 && (
        <div>
          <h3 className="text-zinc-900 dark:text-white font-semibold text-base mb-1">
            ¿Cuál es tu perfil?
          </h3>
          <p className="text-zinc-500 dark:text-zinc-500 text-sm mb-5 tabular-nums">
            {currency === "ARS" ? "$" : "USD"} {Number(amount).toLocaleString("es-AR")}
          </p>

          <div className="space-y-2 mb-5">
            {PROFILES.map((profile) => {
              const selected = riskProfile === profile.id;
              return (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => setRiskProfile(profile.id)}
                  className={`w-full text-left px-4 py-3.5 rounded-lg border transition-colors ${
                    selected
                      ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-500/10"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex-shrink-0 w-4 h-4 rounded-full border flex items-center justify-center ${
                        selected
                          ? "border-emerald-500 bg-emerald-500"
                          : "border-zinc-300 dark:border-zinc-600"
                      }`}
                    >
                      {selected && (
                        <Check
                          size={10}
                          strokeWidth={3}
                          className="text-white"
                        />
                      )}
                    </span>
                    <div>
                      <p className="text-zinc-900 dark:text-white text-sm font-medium">
                        {profile.label}
                      </p>
                      <p className="text-zinc-500 dark:text-zinc-500 text-xs mt-0.5">
                        {profile.sublabel}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {error && (
            <p className="text-zinc-700 dark:text-zinc-300 text-sm mb-3">{error}</p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="py-3.5 px-4 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-sm font-medium transition-colors"
            >
              Volver
            </button>
            <button
              type="button"
              onClick={handleGetRecomendacion}
              disabled={!riskProfile || loading}
              className="flex-1 py-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analizando…
                </span>
              ) : (
                "Ver recomendación"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

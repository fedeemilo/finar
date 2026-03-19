"use client";

import { useState, useEffect } from "react";
import type { RecomendacionResponse } from "@/app/api/recomendar/route";
import { FREE_LIMIT } from "@/lib/constants";

type Currency = "ARS" | "USD";
type RiskProfile = "low" | "medium" | "high";

const LS_KEY = "finar_rec_uses";

function getRenewalTime(ttlSeconds: number): string {
  if (ttlSeconds <= 0) return "";
  const renewsAt = new Date(Date.now() + ttlSeconds * 1000);
  return renewsAt.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

const PROFILES = [
  { id: "low" as RiskProfile, emoji: "🛡️", label: "Quiero proteger lo que tengo", sublabel: "Mínimo riesgo" },
  { id: "medium" as RiskProfile, emoji: "📈", label: "Quiero hacer crecer mi plata", sublabel: "Riesgo moderado" },
  { id: "high" as RiskProfile, emoji: "🚀", label: "Puedo arriesgar para ganar más", sublabel: "Mayor riesgo, mayor potencial" },
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
  const fecha = new Date().toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });

  const itemsHTML = result.items
    .map((item) => `
      <div class="item">
        <div class="item-header">
          <span class="item-emoji">${item.emoji}</span>
          <span class="item-nombre">${item.activo}</span>
          <span class="item-pct">${item.porcentaje}%</span>
        </div>
        <div class="bar-wrap"><div class="bar" style="width:${item.porcentaje}%"></div></div>
        <p class="item-desc">${item.descripcion}</p>
      </div>`)
    .join("");

  const advertenciaHTML = result.advertencia
    ? `<div class="advertencia">⚠️ ${result.advertencia}</div>`
    : "";

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Recomendación FinAR — ${fecha}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:48px;color:#111}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:36px;border-bottom:2px solid #00c896;padding-bottom:16px}
  .logo{font-size:28px;font-weight:900;letter-spacing:-1px}.logo span{color:#00c896}
  .meta{text-align:right;font-size:13px;color:#666;line-height:1.6}.meta strong{color:#111}
  h2{font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:#999;margin-bottom:10px}
  .resumen{font-size:16px;color:#222;line-height:1.6;margin-bottom:28px;padding:16px 20px;background:#f8f8f8;border-radius:10px;border-left:3px solid #00c896}
  .item{margin-bottom:22px}
  .item-header{display:flex;align-items:center;gap:8px;margin-bottom:8px}
  .item-emoji{font-size:20px}.item-nombre{font-size:15px;font-weight:600;flex:1}
  .item-pct{font-size:16px;font-weight:800;color:#00c896}
  .bar-wrap{height:8px;background:#eee;border-radius:4px;overflow:hidden;margin-bottom:6px}
  .bar{height:100%;background:linear-gradient(90deg,#00c896,#00e6aa);border-radius:4px}
  .item-desc{font-size:13px;color:#777;line-height:1.5}
  .advertencia{margin-top:24px;padding:14px 18px;background:#fffbeb;border:1px solid #fcd34d;border-radius:10px;font-size:13px;color:#92400e;line-height:1.6}
  .disclaimer{margin-top:40px;padding-top:20px;border-top:1px solid #eee;font-size:11px;color:#bbb;line-height:1.6}
</style></head><body>
  <div class="header">
    <div class="logo">Fin<span>AR</span></div>
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

// ── Paywall ─────────────────────────────────────────────────────────────────
function Paywall({ ttl }: { ttl: number }) {
  const renewalTime = getRenewalTime(ttl);
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-sm p-8 text-center">
      <div className="text-4xl mb-4">🔒</div>
      <h3 className="text-white font-bold text-lg mb-2">
        Usaste tus 3 recomendaciones gratuitas
      </h3>
      <p className="text-white/50 text-sm leading-relaxed mb-6 max-w-xs mx-auto">
        {renewalTime ? (
          <>Tus consultas se renuevan a las <span className="text-white/70 font-medium">{renewalTime}hs</span>.</>
        ) : (
          <>El plan gratuito incluye 3 consultas cada 12 horas.</>
        )}
      </p>

      <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-5 text-left mb-6">
        <p className="text-emerald-400 font-semibold text-sm mb-3">
          ✨ Próximamente — Plan Pro
        </p>
        <ul className="space-y-2 text-white/60 text-sm">
          <li className="flex items-center gap-2">
            <span className="text-emerald-400">→</span> Recomendaciones ilimitadas
          </li>
          <li className="flex items-center gap-2">
            <span className="text-emerald-400">→</span> Análisis con modelo avanzado
          </li>
          <li className="flex items-center gap-2">
            <span className="text-emerald-400">→</span> Historial de recomendaciones
          </li>
        </ul>
      </div>

      <p className="text-white/30 text-xs">
        ¿Querés acceso anticipado?{" "}
        <a
          href="mailto:hola@finar.ar"
          className="text-emerald-400 hover:underline"
        >
          Escribinos
        </a>
      </p>
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────
export function Recomendador() {
  const [uses, setUses] = useState(0);
  const [ttl, setTtl] = useState(-1);
  const [synced, setSynced] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("ARS");
  const [riskProfile, setRiskProfile] = useState<RiskProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecomendacionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Al montar: leer localStorage y sincronizar con el servidor
  useEffect(() => {
    const local = getLocalUses();
    setUses(local);

    fetch("/api/recomendar")
      .then((r) => r.json())
      .then((data: { used: number; limit: number; ttl: number }) => {
        // El servidor es la fuente de verdad — tomar el mayor entre ambos
        const serverUses = data.used ?? 0;
        const real = Math.max(local, serverUses);
        setUses(real);
        setLocalUses(real);
        if (data.ttl > 0) setTtl(data.ttl);
      })
      .catch(() => {})
      .finally(() => setSynced(true));
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

  // Skeleton mientras sincroniza
  if (!synced) {
    return (
      <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 animate-pulse">
        <div className="h-4 w-1/3 bg-white/10 rounded-full mb-6" />
        <div className="space-y-3">
          <div className="h-10 bg-white/10 rounded-xl" />
          <div className="h-10 bg-white/10 rounded-xl" />
          <div className="h-12 bg-white/10 rounded-xl" />
        </div>
      </div>
    );
  }

  // Paywall
  if (uses >= FREE_LIMIT && !result) return <Paywall ttl={ttl} />;

  // Vista de resultado
  if (result) {
    return (
      <div className="rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-sm p-6">
        <div className="mb-5">
          <p className="text-white/90 font-medium leading-relaxed">{result.resumen}</p>
          {result.advertencia && (
            <div className="mt-3 p-3 rounded-xl bg-amber-400/10 border border-amber-400/20">
              <p className="text-amber-300 text-sm">⚠️ {result.advertencia}</p>
            </div>
          )}
        </div>

        <div className="space-y-4 mb-6">
          {result.items.map((item, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{item.emoji}</span>
                  <span className="text-white/80 text-sm font-medium">{item.activo}</span>
                </div>
                <span className="text-emerald-400 font-semibold text-sm">{item.porcentaje}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${item.porcentaje}%`, background: "linear-gradient(90deg, #00c896, #00e6aa)" }}
                />
              </div>
              <p className="text-white/40 text-xs mt-1.5">{item.descripcion}</p>
            </div>
          ))}
        </div>

        {/* Uses left badge */}
        {remaining > 0 && (
          <p className="text-center text-white/30 text-xs mb-4">
            {remaining === 1 ? (
              <>Te queda <span className="text-white/50 font-medium">1 consulta</span></>
            ) : (
              <>Te quedan <span className="text-white/50 font-medium">{remaining} consultas</span></>
            )}
            {ttl > 0 && (
              <span className="text-white/20"> · se renueva a las {getRenewalTime(ttl)}</span>
            )}
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleReset}
            disabled={remaining === 0}
            className="flex-1 py-3 rounded-xl border border-white/10 text-white/70 text-sm font-medium hover:bg-white/5 hover:border-white/20 transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Calcular de nuevo
          </button>
          <button
            onClick={() => downloadPDF(result, amount, currency, riskProfile!)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-sm font-medium hover:bg-emerald-400/20 transition-all active:scale-[0.97]"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M7.5 1v9m0 0L4.5 7m3 3L10.5 7M2 13h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Descargar PDF
          </button>
        </div>
      </div>
    );
  }

  // Wizard
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-sm p-6">
      {/* Uses indicator */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-2">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-1 w-10 rounded-full transition-all duration-300 ${s <= step ? "bg-emerald-400" : "bg-white/10"}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: FREE_LIMIT }).map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${i < uses ? "bg-white/15" : "bg-emerald-400/70"}`}
            />
          ))}
          <span className="text-white/30 text-xs ml-1">
            {remaining === 1 ? "Te queda 1 consulta" : `Te quedan ${remaining}`}
            {ttl > 0 && (
              <span className="text-white/20">
                {" · "}renueva a las {getRenewalTime(ttl)}
              </span>
            )}
          </span>
        </div>
      </div>

      {step === 1 && (
        <form onSubmit={handleAmountSubmit}>
          <h3 className="text-white/90 font-semibold text-lg mb-1">¿Cuánto tenés para invertir?</h3>
          <p className="text-white/40 text-sm mb-5">Ingresá el monto y la moneda</p>

          <div className="flex gap-2 mb-4">
            {(["ARS", "USD"] as Currency[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCurrency(c)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 ${currency === c ? "bg-emerald-400 text-black" : "bg-white/5 text-white/50 hover:bg-white/10"}`}
              >
                {c === "ARS" ? "🇦🇷 Pesos" : "🇺🇸 Dólares"}
              </button>
            ))}
          </div>

          <div className="relative mb-5">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-lg font-medium">
              {currency === "ARS" ? "$" : "USD"}
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              min="1"
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-14 pr-4 py-4 text-white text-xl font-semibold placeholder-white/20 focus:outline-none focus:border-emerald-400/50 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={!amount || Number(amount) <= 0}
            className="w-full py-4 rounded-xl bg-emerald-400 text-black font-bold text-base hover:bg-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.97]"
          >
            Continuar →
          </button>
        </form>
      )}

      {step === 2 && (
        <div>
          <h3 className="text-white/90 font-semibold text-lg mb-1">¿Cuál es tu perfil?</h3>
          <p className="text-white/40 text-sm mb-5">
            {currency === "ARS" ? "$" : "USD"} {Number(amount).toLocaleString("es-AR")} {currency}
          </p>

          <div className="space-y-3 mb-5">
            {PROFILES.map((profile) => (
              <button
                key={profile.id}
                onClick={() => setRiskProfile(profile.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all active:scale-[0.98] ${riskProfile === profile.id ? "border-emerald-400/50 bg-emerald-400/10" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{profile.emoji}</span>
                  <div>
                    <p className="text-white/90 text-sm font-medium">{profile.label}</p>
                    <p className="text-white/40 text-xs">{profile.sublabel}</p>
                  </div>
                  {riskProfile === profile.id && <span className="ml-auto text-emerald-400">✓</span>}
                </div>
              </button>
            ))}
          </div>

          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="py-4 px-5 rounded-xl border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 transition-all text-sm"
            >
              ← Volver
            </button>
            <button
              onClick={handleGetRecomendacion}
              disabled={!riskProfile || loading}
              className="flex-1 py-4 rounded-xl bg-emerald-400 text-black font-bold text-base hover:bg-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.97]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Analizando...
                </span>
              ) : (
                "Ver mi recomendación ✨"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";

const HEADER_OFFSET = 72;
const VIEW_PAD = 24;
const SCROLL_MS = 820;
const CLOSE_SCROLL_MS = 700;
const FADE_MS = 300;

type ResumenCtx = {
  openId: string | null;
  open: (id: string) => void;
  close: (id: string) => void;
};

const ResumenOpenContext = createContext<ResumenCtx | null>(null);

export function ResumenExclusiveProvider({ children }: { children: ReactNode }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = useCallback((id: string) => setOpenId(id), []);
  const close = useCallback((id: string) => {
    setOpenId((current) => (current === id ? null : current));
  }, []);

  return (
    <ResumenOpenContext.Provider value={{ openId, open, close }}>
      {children}
    </ResumenOpenContext.Provider>
  );
}

function canHover() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches
  );
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

let scrollRaf = 0;
let scrollOrigin: number | null = null;
let restoreTimer = 0;

function cancelAnimatedScroll() {
  if (scrollRaf) window.cancelAnimationFrame(scrollRaf);
  scrollRaf = 0;
}

function rememberScrollOrigin() {
  if (restoreTimer) {
    window.clearTimeout(restoreTimer);
    restoreTimer = 0;
  }
  if (scrollOrigin == null) scrollOrigin = window.scrollY;
}

function restoreScrollOrigin() {
  if (scrollOrigin == null) return;
  animateScrollTo(scrollOrigin, prefersReducedMotion() ? 0 : CLOSE_SCROLL_MS);
  if (restoreTimer) window.clearTimeout(restoreTimer);
  restoreTimer = window.setTimeout(
    () => {
      scrollOrigin = null;
      restoreTimer = 0;
    },
    (prefersReducedMotion() ? 0 : CLOSE_SCROLL_MS) + 30
  );
}

function animateScrollTo(targetY: number, duration: number) {
  cancelAnimatedScroll();
  const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const endY = Math.min(maxY, Math.max(0, targetY));
  const startY = window.scrollY;
  const dist = endY - startY;
  if (Math.abs(dist) < 2) return;

  if (prefersReducedMotion() || duration <= 0) {
    window.scrollTo({ top: endY });
    return;
  }

  const start = performance.now();
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    window.scrollTo({ top: startY + dist * easeInOutCubic(t) });
    if (t < 1) {
      scrollRaf = window.requestAnimationFrame(tick);
    } else {
      scrollRaf = 0;
    }
  };
  scrollRaf = window.requestAnimationFrame(tick);
}

function scrollBlockIntoView(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight;
  const topLimit = HEADER_OFFSET + VIEW_PAD;
  const bottomLimit = vh - VIEW_PAD;
  let targetY = window.scrollY;

  if (rect.height >= bottomLimit - topLimit || rect.top < topLimit) {
    targetY = window.scrollY + rect.top - topLimit;
  } else if (rect.bottom > bottomLimit) {
    targetY = window.scrollY + rect.bottom - bottomLimit;
  } else {
    return;
  }

  animateScrollTo(targetY, SCROLL_MS);
}

export function NoticiaResumen({
  texto,
  tone,
  clamp,
}: {
  texto: string;
  tone: "hero" | "card";
  clamp: string;
}) {
  const id = useId();
  const ctx = useContext(ResumenOpenContext);
  const open = ctx?.openId === id;
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);
  const ignoreLeave = useRef(false);
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const panelId = useId();
  const isHero = tone === "hero";

  const cancelClose = () => {
    if (closeTimer.current != null) window.clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };

  const closeSelf = () => ctx?.close(id);

  const scheduleClose = () => {
    if (ignoreLeave.current) return;
    cancelClose();
    closeTimer.current = window.setTimeout(() => closeSelf(), 120);
  };

  const reveal = () => {
    cancelClose();
    ignoreLeave.current = true;
    ctx?.open(id);
  };

  useEffect(() => () => {
    cancelClose();
    cancelAnimatedScroll();
  }, []);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const frame = window.requestAnimationFrame(() => setShown(true));
      return () => window.cancelAnimationFrame(frame);
    }

    setShown(false);
    const switching = ctx?.openId != null && ctx.openId !== id;
    if (!switching) restoreScrollOrigin();
    const delay = switching || prefersReducedMotion() ? 0 : FADE_MS;
    const t = window.setTimeout(() => setMounted(false), delay);
    return () => window.clearTimeout(t);
  }, [open, ctx?.openId, id]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSelf();
    };
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) closeSelf();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDoc);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDoc);
    };
  }, [open, id]);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;

    let moveHandler: ((e: MouseEvent) => void) | null = null;
    let settleTimer: number | null = null;
    const frame = window.requestAnimationFrame(() => {
      rememberScrollOrigin();
      scrollBlockIntoView(panel);
      settleTimer = window.setTimeout(() => {
        ignoreLeave.current = false;
        moveHandler = (e: MouseEvent) => {
          if (!wrapRef.current?.contains(e.target as Node)) closeSelf();
          if (moveHandler) window.removeEventListener("mousemove", moveHandler);
          moveHandler = null;
        };
        window.addEventListener("mousemove", moveHandler, { passive: true });
      }, prefersReducedMotion() ? 40 : SCROLL_MS + 40);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      if (settleTimer != null) window.clearTimeout(settleTimer);
      if (moveHandler) window.removeEventListener("mousemove", moveHandler);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className={`relative ${open || mounted ? "z-40" : ""}`}>
      <p
        className={`leading-relaxed ${clamp} ${
          isHero
            ? "text-white/80 text-sm sm:text-base"
            : "text-zinc-600 dark:text-zinc-400 text-sm"
        }`}
      >
        {texto}
      </p>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        className={`mt-2 inline-block text-[11px] font-medium tracking-wide cursor-pointer ${
          isHero
            ? "text-white/50 hover:text-white/80"
            : "text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        }`}
        onMouseEnter={() => {
          if (canHover()) reveal();
        }}
        onMouseLeave={() => {
          if (canHover()) scheduleClose();
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (canHover()) return;
          if (open) closeSelf();
          else reveal();
        }}
      >
        {open ? "Cerrar resumen" : "Ver resumen"}
      </button>

      {mounted && (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-label="Resumen generado por IA"
          onMouseEnter={() => {
            ignoreLeave.current = false;
            cancelClose();
          }}
          onMouseLeave={() => {
            if (canHover()) scheduleClose();
          }}
          className={`absolute top-full left-0 z-30 mt-2 p-4 transition-[opacity,transform] duration-300 ease-out ${
            shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 pointer-events-none"
          } ${
            isHero
              ? "w-full max-w-xl border border-white/15 bg-zinc-950 shadow-[0_16px_48px_rgba(0,0,0,0.8)]"
              : "w-[min(100%,22rem)] border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 shadow-lg"
          }`}
        >
          <p
            className={`text-[10px] font-semibold tracking-[0.14em] uppercase mb-2 ${
              isHero ? "text-zinc-400" : "text-zinc-500 dark:text-zinc-500"
            }`}
          >
            Resumen IA
          </p>
          <p
            className={`text-sm leading-relaxed ${
              isHero ? "text-zinc-100" : "text-zinc-700 dark:text-zinc-200"
            }`}
          >
            {texto}
          </p>
        </div>
      )}
    </div>
  );
}

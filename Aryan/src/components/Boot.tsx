"use client";

import { useEffect, useState } from "react";
import { LiquidMetal } from "./LiquidMetal";
import { cn } from "@/lib/utils";

const TARGET = 21;
const COUNT_MS = 2800;

export function Boot({ ready }: { ready: boolean }) {
  const [hidden, setHidden] = useState(false);
  const [n, setN] = useState(0);

  // Count up to 21.
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / COUNT_MS);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * TARGET));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Leave once the page is ready AND the count has landed on 21.
  useEffect(() => {
    if (!(ready && n >= TARGET)) return;
    const t = setTimeout(() => setHidden(true), 520);
    return () => clearTimeout(t);
  }, [ready, n]);

  useEffect(() => {
    if (hidden) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [hidden]);

  if (hidden) return null;

  const done = ready && n >= TARGET;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[80] flex flex-col items-center justify-center gap-5 bg-background transition-opacity duration-700",
        done ? "pointer-events-none opacity-0" : "opacity-100",
      )}
    >
      <LiquidMetal
        text={String(n)}
        iterations={70}
        maskMax={{ w: 480, h: 360 }}
        params={{ speed: 0.5, refraction: 0.008, edge: 0.5, patternScale: 1.7 }}
        className="h-[34vh] max-h-[340px]"
      />
      <div className="font-mono text-[10px] uppercase tracking-[0.45em] text-muted">
        turning twenty-one
      </div>
    </div>
  );
}

export default Boot;

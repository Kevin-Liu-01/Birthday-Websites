"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { photos } from "@/lib/photos";
import GlitchImage from "./GlitchImage";
import { cn } from "@/lib/utils";

const ITEMS = photos.map((p, i) => ({
  thumb: p.src.replace("/photos/", "/orbit/"),
  full: p.src,
  aspect: p.w / p.h,
  i,
}));

function useViewport() {
  const [s, setS] = useState({ w: 1280, h: 800 });
  useEffect(() => {
    const u = () => setS({ w: window.innerWidth, h: window.innerHeight });
    u();
    window.addEventListener("resize", u);
    return () => window.removeEventListener("resize", u);
  }, []);
  return s;
}

function Row({
  items,
  direction,
  onOpen,
}: {
  items: typeof ITEMS;
  direction: "left" | "right";
  onOpen: (i: number) => void;
}) {
  return (
    <div className="pause-on-hover relative flex overflow-hidden">
      <div
        className={cn(
          "reel-track flex shrink-0 gap-3 pr-3",
          direction === "left" ? "animate-reel-left" : "animate-reel-right",
        )}
      >
        {[...items, ...items].map((item, k) => (
          <button
            key={`${item.i}-${k}`}
            type="button"
            onClick={() => onOpen(item.i)}
            aria-label={`Open frame ${item.i + 1}`}
            className="group relative h-[27vh] shrink-0 overflow-hidden border border-white/10"
            style={{ aspectRatio: `${item.aspect}` }}
          >
            <Image
              src={item.thumb}
              fill
              sizes="30vh"
              alt=""
              className="object-cover brightness-90 contrast-[1.1] grayscale transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0"
            />
            <span className="pointer-events-none absolute inset-0 bg-black/20 transition-colors duration-500 group-hover:bg-black/0" />
          </button>
        ))}
      </div>
    </div>
  );
}

export function ReelView({ glitch }: { glitch: boolean }) {
  const [opened, setOpened] = useState<number | null>(null);
  const vp = useViewport();
  const n = ITEMS.length;

  const third = Math.ceil(n / 3);
  const rows = [ITEMS.slice(0, third), ITEMS.slice(third, third * 2), ITEMS.slice(third * 2)];

  const go = useCallback(
    (d: number) => setOpened((o) => (o === null ? null : (o + d + n) % n)),
    [n],
  );

  useEffect(() => {
    if (opened === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpened(null);
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [opened, go]);

  const item = opened === null ? null : ITEMS[opened];
  const maxW = vp.w * 0.92;
  const maxH = vp.h * 0.78;
  const boxH = item ? Math.min(maxH, maxW / item.aspect) : 0;
  const boxW = item ? boxH * item.aspect : 0;

  return (
    <div className="flex h-full w-full flex-col justify-center gap-3 overflow-hidden">
      {rows.map((items, idx) => (
        <Row
          key={idx}
          items={items}
          direction={idx % 2 === 0 ? "left" : "right"}
          onOpen={setOpened}
        />
      ))}

      {item && (
        <div
          className="fixed inset-0 z-[10] flex items-center justify-center bg-black/95 backdrop-blur-sm"
          onClick={() => setOpened(null)}
        >
          <div className="absolute inset-x-0 top-5 text-center font-mono text-[11px] uppercase tracking-[0.3em] text-muted">
            <span className="text-foreground">{String(opened! + 1).padStart(2, "0")}</span>
            {" / "}
            {String(n).padStart(2, "0")}
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
            aria-label="Previous"
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 px-3 py-6 font-display text-4xl text-muted transition-colors hover:text-foreground md:left-8 md:text-6xl"
          >
            ‹
          </button>
          <div
            className="relative overflow-hidden shadow-[0_0_120px_rgba(0,0,0,0.9)]"
            style={{ width: boxW, height: boxH }}
            onClick={(e) => e.stopPropagation()}
          >
            {glitch ? (
              <GlitchImage url={item.thumb} />
            ) : (
              <Image src={item.full} fill sizes="92vw" alt={`Aryan — frame ${opened! + 1}`} className="object-cover" priority />
            )}
            <div className="scanlines pointer-events-none absolute inset-0" />
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            aria-label="Next"
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 px-3 py-6 font-display text-4xl text-muted transition-colors hover:text-foreground md:right-8 md:text-6xl"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}

export default ReelView;

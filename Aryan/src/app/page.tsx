"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import ShaderBackground from "@/components/ShaderBackground";
import { LiquidMetal } from "@/components/LiquidMetal";
import { ArchiveExperience } from "@/components/ArchiveExperience";
import { Marquee } from "@/components/Marquee";
import { Reveal } from "@/components/Reveal";
import { Boot } from "@/components/Boot";
import { MusicPlayer } from "@/components/MusicPlayer";

export default function Home() {
  const [liquidReady, setLiquidReady] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);

  // Safety net: never trap the visitor behind the loader if the GPU stalls.
  useEffect(() => {
    const t = setTimeout(() => setLiquidReady(true), 7000);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <Boot ready={liquidReady} />
      <MusicPlayer />

      <AnimatePresence>
        {archiveOpen && (
          <ArchiveExperience key="archive" onClose={() => setArchiveOpen(false)} />
        )}
      </AnimatePresence>

      {/* Living liquid-glass backdrop (fixed, full-bleed, furthest back) */}
      <div className="pointer-events-none fixed inset-0 -z-20">
        <ShaderBackground />
      </div>

      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-5 py-4 font-mono text-[10px] uppercase tracking-[0.4em] text-white mix-blend-difference md:px-8">
        <span>&#10015; aryan</span>
        <span className="hidden md:inline">opium // mmxxvi</span>
        <span>happy birthday</span>
      </header>

      <main className="relative">
        {/* Black wash: clear over the hero so the liquid shows, fading to
            solid black as you scroll down into the rest of the page. */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0, transparent 55vh, #070707 105vh, #070707 100%)",
          }}
        />

        {/* Hero */}
        <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4 pt-16">
          {/* Aryan feathered into the liquid on the right (double-exposure, red). */}
          <div className="pointer-events-none absolute inset-y-0 right-0 z-0 w-full md:w-[62%] lg:w-[56%]">
            <div className="relative h-full w-full [-webkit-mask-image:radial-gradient(ellipse_74%_82%_at_68%_44%,#000_24%,transparent_76%)] [mask-image:radial-gradient(ellipse_74%_82%_at_68%_44%,#000_24%,transparent_76%)]">
              <Image
                src="/aryan.jpg"
                alt="Aryan"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 58vw"
                className="object-cover object-[44%_20%] opacity-[0.95] brightness-[0.92] contrast-110 grayscale"
              />
              <div className="absolute inset-0 bg-accent opacity-[0.22] mix-blend-color" />
              <div className="scanlines absolute inset-0 opacity-30" />
            </div>
          </div>

          {/* Foreground */}
          <div className="relative z-10 flex flex-col items-center">
            <p className="mb-6 animate-flicker font-mono text-[11px] uppercase tracking-[0.6em] text-white/85 [text-shadow:0_1px_22px_rgba(0,0,0,0.95)] md:text-sm">
              happy&nbsp;&nbsp;birthday
            </p>

            <LiquidMetal
              text="ARYAN"
              className="w-[82vw] max-w-[880px] drop-shadow-[0_10px_60px_rgba(0,0,0,0.6)]"
              onReady={() => setLiquidReady(true)}
            />

            <p className="mt-6 font-gothic text-2xl text-foreground [text-shadow:0_2px_26px_rgba(0,0,0,0.95)] md:text-4xl">
              born in the dark &#10015; blessed in chrome
            </p>
          </div>

          <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/70 [text-shadow:0_1px_16px_rgba(0,0,0,0.9)]">
              scroll
            </span>
            <span className="h-10 w-px animate-float bg-gradient-to-b from-white/70 to-transparent" />
          </div>
        </section>

        {/* Marquee band */}
        <section className="relative border-y border-white/10 bg-background/50 py-3 text-3xl backdrop-blur-sm md:py-4 md:text-5xl">
          <Marquee text="happy birthday aryan" />
        </section>

        {/* Dedication */}
        <section className="relative mx-auto max-w-3xl px-6 py-28 text-center md:py-44">
          <Reveal>
            <p className="mb-8 font-mono text-[11px] uppercase tracking-[0.4em] text-accent">
              // a dedication
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="font-display text-5xl uppercase leading-[0.95] tracking-tight md:text-7xl">
              another year
              <br />
              in the <span className="text-stroke">opium</span>
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="mx-auto mt-10 max-w-xl font-mono text-sm leading-relaxed text-muted md:text-base">
              to the realest in the room — another lap around the sun, draped in
              black, dripping in chrome. the fits stay tuff, the energy stays
              unmatched. long live the legend. happy birthday, brother. &#10015;
            </p>
          </Reveal>
        </section>

        {/* Archive portal — click to enter the 3D experience */}
        <section
          id="archive"
          className="relative flex min-h-[80svh] flex-col items-center justify-center gap-7 px-6 text-center"
        >
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-accent">
              // the archive
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="font-display text-6xl uppercase leading-[0.9] tracking-tight md:text-8xl">
              the archive
            </h2>
          </Reveal>
          <Reveal delay={150}>
            <p className="max-w-md font-mono text-[11px] uppercase leading-relaxed tracking-[0.3em] text-muted">
              032 frames orbiting a chrome cross. lock in &middot; go reel &middot; glitch it out.
            </p>
          </Reveal>
          <Reveal delay={220}>
            <button
              type="button"
              onClick={() => setArchiveOpen(true)}
              className="group relative mt-2 overflow-hidden border border-white/20 px-10 py-4 font-mono text-xs uppercase tracking-[0.4em] text-foreground transition-colors hover:border-accent"
            >
              <span className="relative z-10 transition-colors group-hover:text-white">
                enter &#10015;
              </span>
              <span className="absolute inset-0 origin-bottom scale-y-0 bg-accent transition-transform duration-300 group-hover:scale-y-100" />
            </button>
          </Reveal>
        </section>

        {/* Outro */}
        <section className="relative flex min-h-[80svh] flex-col items-center justify-center gap-8 px-6 text-center">
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-muted">
              // many happy returns
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="chrome-fallback font-display text-[26vw] leading-[0.8] tracking-tight md:text-[15vw]">
              HBD
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="font-gothic text-2xl text-foreground/70 md:text-3xl">
              see you on the other side, aryan &#10015;
            </p>
          </Reveal>
        </section>

        {/* Footer */}
        <footer className="relative flex items-center justify-between border-t border-white/10 px-6 py-10 font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
          <span>&#10015; aryan</span>
          <span className="animate-pulse-accent text-accent">est. forever</span>
          <span>made in the dark</span>
        </footer>
      </main>
    </>
  );
}

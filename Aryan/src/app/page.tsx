"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import ShaderBackground from "@/components/ShaderBackground";
import { LiquidMetal } from "@/components/LiquidMetal";
import { ArchiveExperience } from "@/components/ArchiveExperience";
import { Marquee } from "@/components/Marquee";
import { Reveal } from "@/components/Reveal";
import { Boot } from "@/components/Boot";
import { MusicPlayer } from "@/components/MusicPlayer";
import SmokeFog from "@/components/SmokeFog";

// Feather-fan wings flanking Aryan in the portal. Row lengths bulge in the
// middle and taper to a point at each tip, so a block of diagonal glyphs reads
// as a layered wing. Built programmatically to keep the whitespace exact.
const WING_ROWS = [1, 3, 5, 8, 11, 14, 17, 19, 21, 22, 22, 21, 19, 17, 14, 11, 8, 5, 3, 1];
const wingArt = (glyph: string, flushRight: boolean) => {
  const width = Math.max(...WING_ROWS);
  return WING_ROWS.map((n) => {
    const row = glyph.repeat(n);
    return flushRight ? row.padStart(width) : row;
  }).join("\n");
};
const LEFT_WING = wingArt("\u2571", true); // ╱ feathers sweeping out to the left
const RIGHT_WING = wingArt("\u2572", false); // ╲ feathers sweeping out to the right

export default function Home() {
  const [liquidReady, setLiquidReady] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [heroIn, setHeroIn] = useState(false);

  // Safety net: never trap the visitor behind the loader if the GPU stalls.
  useEffect(() => {
    const t = setTimeout(() => setLiquidReady(true), 7000);
    return () => clearTimeout(t);
  }, []);

  const revealHero = useCallback(() => setHeroIn(true), []);

  return (
    <>
      <Boot ready={liquidReady} onDone={revealHero} />
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

      {/* Top ticker (carousel) */}
      <div className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-background/50 py-2 text-xl backdrop-blur-sm md:text-2xl">
        <Marquee text="happy birthday aryan" />
      </div>

      <main className="relative">
        {/* Black wash: clear over the hero so the liquid shows, fading to
            solid black as you scroll down into the rest of the page. */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0, transparent 42vh, #070707 85vh, #070707 100%)",
          }}
        />

        {/* Hero */}
        <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4 pt-16">
          {/* Foreground: ARYAN is the vertically-centered anchor; HAPPY 21
              floats just above it. The name sits BEHIND the cutout (z-20) so
              his body occludes it (depth). */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative flex items-center justify-center">
              <LiquidMetal
                text="ARYAN"
                className="w-[80vw] max-w-[900px] drop-shadow-[0_10px_60px_rgba(0,0,0,0.6)]"
                onReady={() => setLiquidReady(true)}
              />
              <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 translate-y-[70%]">
                <LiquidMetal
                  text="HAPPY 21"
                  colors={{ c1: [1, 1, 1], c2: [0.08, 0.08, 0.09] }}
                  mono
                  iterations={130}
                  className="w-[150px] drop-shadow-[0_3px_16px_rgba(0,0,0,0.7)] md:w-[240px]"
                />
              </div>
            </div>
            <p
              aria-hidden
              className="glyph mt-7 text-sm tracking-[0.5em] text-accent/80 [text-shadow:0_1px_16px_rgba(0,0,0,0.9)] md:text-base"
            >
              ⛓ 𓌹 ✦ ♰ ✦ 𓌺 ⛓
            </p>
          </div>

          {/* Aryan cutout (black & white), layered above the name so his body
              occludes it -> the letters read as passing behind him (depth). A
              dark filled-silhouette backing sits directly behind him so the
              bright liquid can't bleed through the gaps between his curls. */}
          <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-[64%] md:w-[60%] lg:w-[56%]">
            <Image
              src="/aryan-hair-backing.png"
              alt=""
              aria-hidden
              fill
              sizes="(max-width: 768px) 100vw, 58vw"
              className="object-cover object-[44%_20%]"
            />
            {/* Aryan "develops" over his own shadow: a downward scan wipe
                resolves the crisp photo (blurred -> sharp, zoom settles) while
                a chrome/red light bar sweeps the leading edge, like the figure
                being printed into existence. Fires when the loader clears. */}
            <motion.div
              className="absolute inset-0 overflow-hidden"
              initial={{
                clipPath: "inset(0 0 100% 0)",
                filter: "blur(16px)",
                scale: 1.06,
                opacity: 0.5,
              }}
              animate={
                heroIn
                  ? {
                      clipPath: "inset(0 0 0% 0)",
                      filter: "blur(0px)",
                      scale: 1,
                      opacity: 1,
                    }
                  : undefined
              }
              transition={{ duration: 1.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image
                src="/aryan-cutout6.png"
                alt="Aryan"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 58vw"
                className="object-cover object-[44%_20%] brightness-[0.96] contrast-110 grayscale drop-shadow-[0_18px_50px_rgba(0,0,0,0.6)]"
              />
            </motion.div>
            <motion.div
              aria-hidden
              className="absolute inset-x-0 z-[1] h-[16%] mix-blend-screen bg-[linear-gradient(to_bottom,transparent,rgba(214,38,46,0.25)_35%,rgba(255,255,255,0.7)_50%,rgba(214,38,46,0.25)_65%,transparent)]"
              initial={{ top: "-18%", opacity: 0 }}
              animate={heroIn ? { top: ["-18%", "104%"], opacity: [0, 1, 1, 0] } : undefined}
              transition={{ duration: 1.7, ease: [0.16, 1, 0.3, 1], times: [0, 0.12, 0.86, 1] }}
            />
          </div>

          {/* Tagline sits ABOVE the cutout (z-30) -> reads in front of him. */}
          <p className="absolute inset-x-0 bottom-[8vh] z-30 px-4 text-center font-gothic text-2xl text-foreground [text-shadow:0_2px_26px_rgba(0,0,0,0.95)] md:text-4xl">
            twenty-one laps &#10015; drip in chrome
          </p>
        </section>

        {/* Portal graphic: dedication + Aryan + archive in one frame */}
        <section
          id="archive"
          className="relative flex min-h-[100svh] items-center overflow-hidden px-4 py-24 md:px-8 md:py-32"
        >
          {/* Real smoke rolling across the bottom half of the whole component,
              full-bleed. Sits behind the content (z-0); his alpha-faded legs
              reveal it, and the side copy reads on top. Top edge feathered. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-1/2 [-webkit-mask-image:linear-gradient(to_bottom,transparent,#000_34%)] [mask-image:linear-gradient(to_bottom,transparent,#000_34%)]">
            <SmokeFog />
          </div>

          <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_minmax(260px,340px)_1fr] lg:gap-6 xl:gap-10">
            {/* Left wing — dedication. Top-aligned with the right wing so the
                two fan out symmetrically from Aryan like wings. */}
            <div className="relative order-2 text-center lg:order-1 lg:self-start lg:pt-[9vh] lg:text-left">
              <pre
                aria-hidden
                className="pointer-events-none absolute right-0 top-1/2 hidden -z-10 -translate-y-1/2 translate-x-[46%] select-none font-mono text-[17px] leading-[0.6] text-accent/20 [text-shadow:0_0_18px_rgba(214,38,46,0.35)] lg:block xl:text-[22px]"
              >
                {LEFT_WING}
              </pre>
              <Reveal>
                <p
                  aria-hidden
                  className="glyph mb-6 text-base tracking-[0.5em] text-accent [text-shadow:0_1px_14px_#070707]"
                >
                  𓌹 ✦
                </p>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="font-display text-4xl uppercase leading-[0.95] tracking-tight md:text-5xl xl:text-6xl">
                  another year
                  <br />
                  in the <span className="text-stroke">opium</span>
                </h2>
              </Reveal>
              <Reveal delay={160}>
                <div className="glyph mt-8 font-mono text-sm leading-relaxed text-muted [text-shadow:0_1px_14px_#070707] md:text-base lg:whitespace-nowrap">
                  <span className="block">to the realest in the room</span>
                  <span className="block lg:ml-[14px]">another lap round the sun,</span>
                  <span className="block lg:ml-[28px]">draped in black, dripped in chrome</span>
                  <span className="block lg:ml-[42px]">fits stay tuff, energy unmatched</span>
                  <span className="block lg:ml-[56px]">long live the legend ✦ 𓌹</span>
                </div>
              </Reveal>
            </div>

            {/* Center — Aryan looking down, legs lost in fog, enter below */}
            <div className="order-1 flex flex-col items-center lg:order-2 lg:self-center">
              <Reveal>
                <p
                  aria-hidden
                  className="glyph mb-5 text-base tracking-[0.45em] text-accent/85 [text-shadow:0_1px_16px_#070707] md:text-lg"
                >
                  ⛓ 𓌹 ✦ ♰ ✦ 𓌺 ⛓
                </p>
              </Reveal>
              <Reveal delay={40}>
                <div className="relative w-[min(72vw,340px)]">
                  <Image
                    src="/aryan-lookdown-cutout.png"
                    alt="Aryan"
                    width={657}
                    height={1024}
                    className="h-auto w-full object-contain object-top brightness-[0.97] contrast-105 grayscale"
                    priority={false}
                  />
                </div>
              </Reveal>
              <Reveal delay={200}>
                <button
                  type="button"
                  onClick={() => setArchiveOpen(true)}
                  className="group relative mt-6 overflow-hidden border border-white/20 px-10 py-4 font-mono text-xs uppercase tracking-[0.4em] text-foreground transition-colors hover:border-accent"
                >
                  <span className="relative z-10 transition-colors group-hover:text-white">
                    enter &#10015;
                  </span>
                  <span className="absolute inset-0 origin-bottom scale-y-0 bg-accent transition-transform duration-300 group-hover:scale-y-100" />
                </button>
              </Reveal>
            </div>

            {/* Right wing — archive. Mirrors the left wing's top alignment. */}
            <div className="relative order-3 text-center lg:self-start lg:pt-[9vh] lg:text-right">
              <pre
                aria-hidden
                className="pointer-events-none absolute left-0 top-1/2 hidden -z-10 -translate-y-1/2 -translate-x-[46%] select-none font-mono text-[17px] leading-[0.6] text-accent/20 [text-shadow:0_0_18px_rgba(214,38,46,0.35)] lg:block xl:text-[22px]"
              >
                {RIGHT_WING}
              </pre>
              <Reveal>
                <p
                  aria-hidden
                  className="glyph mb-6 text-base tracking-[0.5em] text-accent [text-shadow:0_1px_14px_#070707]"
                >
                  ✦ 𓌺
                </p>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="font-display text-4xl uppercase leading-[0.9] tracking-tight md:text-5xl xl:text-6xl">
                  the
                  <br />
                  archive
                </h2>
              </Reveal>
              <Reveal delay={160}>
                <div className="glyph mt-8 font-mono text-sm leading-relaxed text-muted [text-shadow:0_1px_14px_#070707] md:text-base lg:whitespace-nowrap">
                  <span className="block">032 frames orbiting a</span>
                  <span className="block lg:mr-[14px]">chrome cross in the dark</span>
                  <span className="block lg:mr-[28px]">lock in · go reel</span>
                  <span className="block lg:mr-[42px]">glitch it out</span>
                  <span className="block lg:mr-[56px]">see you inside ✦ 𓌺</span>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

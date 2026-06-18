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
import { cn } from "@/lib/utils";

// The hero reveal light is clipped to Aryan's shadow silhouette (the same
// backing PNG drawn behind him) so the red scan and bloom trace his shape
// instead of spanning a flat rectangle. mask-size/position mirror the photos'
// object-cover / object-[44%_20%] so the mask lines up pixel-for-pixel.
const SILHOUETTE_MASK =
  "[mask-image:url(/aryan-hair-backing.png)] [mask-size:cover] [mask-position:44%_20%] [mask-repeat:no-repeat] [-webkit-mask-image:url(/aryan-hair-backing.png)] [-webkit-mask-size:cover] [-webkit-mask-position:44%_20%] [-webkit-mask-repeat:no-repeat]";

// Curved feather wings flanking Aryan. Rather than a stacked blade, each wing is
// rasterised from a cubic-bezier "spine": it roots low near Aryan, dips, then
// sweeps up and out to a pointed tip at the top-outer corner — the arc Kevin
// sketched. Feathers fill a band that bulges at mid-span and tapers to a point
// at root and tip. The left wing is a horizontal mirror so the pair is symmetric.
const WING_W = 40;
const WING_H = 16;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const RIGHT_GRID = (() => {
  const grid = Array.from({ length: WING_H }, () => Array(WING_W).fill(" "));
  for (let x = 0; x < WING_W; x++) {
    const nx = x / (WING_W - 1);
    // Leading (top) edge: dips near the root, then sweeps up to a tip top-outer.
    const top = 9.5 - 9.7 * nx ** 1.5 + 1.3 * Math.sin(Math.PI * clamp(nx * 1.7, 0, 1));
    // Feathers hang below; longest in the outer-middle, tapering to a point at
    // both the root and the tip so the wing reads as a swept crescent.
    const drop = 8.2 * Math.sin(Math.PI * clamp((nx - 0.02) / 0.98, 0, 1)) ** 0.75;
    const t = Math.round(top);
    const b = Math.round(top + drop);
    for (let y = t; y <= b; y++) if (y >= 0 && y < WING_H) grid[y][x] = "\u2572"; // ╲
  }
  return grid;
})();
// The left wing is the sketched arc lifted out of the grid (╲ -> ╱). The right
// wing is then the EXACT reflection of the left: reverse each row and flip the
// slash. Both keep the full WING_W width (no trailing trim) so the two <pre>
// blocks are identical in size and their mirrored translate offsets line up.
const flipSlash = (ch: string) =>
  ch === "\u2571" ? "\u2572" : ch === "\u2572" ? "\u2571" : ch;
const reflectRow = (line: string) => [...line].reverse().map(flipSlash).join("");
const LEFT_WING = RIGHT_GRID.map((r) =>
  [...r].reverse().map((ch) => (ch === "\u2572" ? "\u2571" : ch)).join(""),
).join("\n");
const RIGHT_WING = LEFT_WING.split("\n").map(reflectRow).join("\n");

// ASCII cap perched on Aryan's head in the portal lookdown frame.
const ARYAN_HAT = [
  "     ___________",
  "    /           \\",
  "   |    _____    |",
  "   |   /     \\   |",
  "    \\ |_____|  /",
  "     \\_________/",
  "     '---------'",
].join("\n");

export default function Home() {
  const [liquidReady, setLiquidReady] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [heroIn, setHeroIn] = useState(false);
  const [wingsFlashing, setWingsFlashing] = useState(false);

  const flashWings = useCallback(() => {
    setWingsFlashing(false);
    requestAnimationFrame(() => setWingsFlashing(true));
  }, []);

  useEffect(() => {
    if (!wingsFlashing) return;
    const t = setTimeout(() => setWingsFlashing(false), 900);
    return () => clearTimeout(t);
  }, [wingsFlashing]);

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

      {/* Living liquid-glass backdrop, bounded to the hero. It's cut off past the
          first viewport so the metal isn't rendered behind the black lower
          sections — it stops where it stops showing. The solid html background
          (#070707) covers everything below. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-20 h-[100svh] overflow-hidden">
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
        <section className="relative flex min-h-[100svh] flex-col items-start justify-center overflow-hidden pl-6 pr-4 pt-16 md:pl-[6vw] lg:pl-[7vw]">
          {/* Foreground: ARYAN is the vertically-centered anchor, left-aligned
              so Aryan's portrait on the right gets clear space; HAPPY 21 floats
              just above its left edge. The name sits BEHIND the cutout (z-20) so
              his body occludes its right end (depth). */}
          <div className="relative z-10 flex flex-col items-start">
            <div className="relative flex items-center justify-start">
              <LiquidMetal
                text="ARYAN"
                className="w-[66vw] max-w-[760px] drop-shadow-[0_10px_60px_rgba(0,0,0,0.6)]"
                onReady={() => setLiquidReady(true)}
              />
              <div className="pointer-events-none absolute bottom-full left-0 translate-y-[70%]">
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
            {/* Aryan develops over his own shadow: the photo wipes in (blurred
                -> sharp, zoom settles) while a red scan-light and bloom ride his
                silhouette. The light layers are masked to the backing shape so
                they trace his shadow's crop, not a flat band. Fires when the
                loader clears. */}
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
              transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
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
            {/* Red bloom in the exact shape of his shadow — glows up as he
                resolves, then fades, leaving the photo black & white. */}
            <motion.div
              aria-hidden
              className={cn("absolute inset-0 z-[1] bg-accent mix-blend-screen blur-2xl", SILHOUETTE_MASK)}
              initial={{ opacity: 0 }}
              animate={heroIn ? { opacity: [0, 0.75, 0.3, 0] } : undefined}
              transition={{ duration: 1.8, ease: "easeInOut", times: [0, 0.42, 0.7, 1] }}
            />
            {/* Red scan-light, clipped to his silhouette so the leading edge
                rides down his form (head -> shoulders -> chest). */}
            <div className={cn("absolute inset-0 z-[2] overflow-hidden", SILHOUETTE_MASK)}>
              <motion.div
                aria-hidden
                className="absolute inset-x-0 h-[28%] mix-blend-screen blur-[3px] bg-[linear-gradient(to_bottom,transparent,rgba(225,6,0,0.5)_40%,rgba(255,72,48,0.95)_50%,rgba(225,6,0,0.5)_60%,transparent)]"
                initial={{ top: "-28%", opacity: 0 }}
                animate={heroIn ? { top: ["-28%", "104%"], opacity: [0, 1, 1, 0] } : undefined}
                transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], times: [0, 0.1, 0.85, 1] }}
              />
            </div>
          </div>

          {/* Tagline sits ABOVE the cutout (z-30) -> reads in front of him. */}
          <p className="absolute inset-x-0 bottom-[8vh] z-30 px-4 text-center font-gothic text-2xl text-foreground [text-shadow:0_2px_26px_rgba(0,0,0,0.95)] md:text-4xl">
            twenty one &#10015; just getting started
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
                className={cn(
                  "pointer-events-none absolute right-0 top-1/2 hidden -z-10 -translate-y-1/2 translate-x-[46%] select-none font-mono text-[16px] leading-[0.72] text-accent/25 [text-shadow:0_0_18px_rgba(214,38,46,0.4)] lg:block xl:text-[20px]",
                  wingsFlashing && "animate-wing-flash",
                )}
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
                  anointed
                  <br />
                  in the <span className="text-stroke">pocha</span>
                </h2>
              </Reveal>
              <Reveal delay={120}>
                <span className="trapezoid-shell-left mt-6 inline-block lg:mr-auto">
                  <button
                    type="button"
                    onClick={flashWings}
                    aria-label="Flash the wings and crest"
                    className="group relative block px-8 py-3 font-mono text-[10px] uppercase tracking-[0.35em] text-foreground transition-colors trapezoid-inner-left"
                  >
                    <span className="relative z-10 transition-colors group-hover:text-white">
                      spread &#10022; wings
                    </span>
                    <span className="absolute inset-0 origin-bottom scale-y-0 bg-accent transition-transform duration-300 group-hover:scale-y-100" />
                  </button>
                </span>
              </Reveal>
              <Reveal delay={160}>
                <div className="glyph mt-8 font-mono text-sm leading-relaxed text-muted [text-shadow:0_1px_14px_#070707] md:text-base lg:whitespace-nowrap">
                  <span className="block invisible select-none" aria-hidden>
                    .
                  </span>
                  <span className="block invisible select-none lg:ml-[14px]" aria-hidden>
                    .
                  </span>
                  <span className="block invisible select-none lg:ml-[28px]" aria-hidden>
                    .
                  </span>
                  <span className="block invisible select-none lg:ml-[42px]" aria-hidden>
                    .
                  </span>
                  <span className="block lg:ml-[56px]">𓌹 ✦ this guy is a tank</span>
                </div>
              </Reveal>
        </div>

            {/* Center — Aryan looking down, legs lost in fog, enter below */}
            <div className="order-1 flex flex-col items-center lg:order-2 lg:self-center">
              <Reveal>
                <p
                  aria-hidden
                  className={cn(
                    "glyph mb-5 text-base tracking-[0.45em] text-accent/85 [text-shadow:0_1px_16px_#070707] md:text-lg",
                    wingsFlashing && "animate-crest-flash",
                  )}
                >
                  ⛓ 𓌹 ✦ ♰ ✦ 𓌺 ⛓
                </p>
              </Reveal>
              <Reveal delay={40}>
                <div className="relative w-[min(72vw,340px)]">
                  <pre
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute left-1/2 top-[2%] z-10 -translate-x-1/2 select-none whitespace-pre font-mono text-[7px] leading-[1.08] text-accent/70 [text-shadow:0_0_14px_rgba(225,6,0,0.45)] sm:text-[8px] md:text-[9px]",
                      wingsFlashing && "animate-hat-flash",
                    )}
                  >
                    {ARYAN_HAT}
                  </pre>
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
                className={cn(
                  "pointer-events-none absolute left-0 top-1/2 hidden -z-10 -translate-y-1/2 -translate-x-[46%] select-none font-mono text-[16px] leading-[0.72] text-accent/25 [text-shadow:0_0_18px_rgba(214,38,46,0.4)] lg:block xl:text-[20px]",
                  wingsFlashing && "animate-wing-flash",
                )}
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
                  view the
                  <br />
                  <span className="text-stroke">archives</span>
                </h2>
              </Reveal>
              <Reveal delay={120}>
                <span className="trapezoid-shell-right mt-6 inline-block lg:ml-auto">
                  <button
                    type="button"
                    onClick={() => setArchiveOpen(true)}
                    aria-label="Open the photo archives"
                    className="group relative block px-8 py-3 font-mono text-[10px] uppercase tracking-[0.35em] text-foreground transition-colors trapezoid-inner-right"
                  >
                    <span className="relative z-10 transition-colors group-hover:text-white">
                      photos &#10015;
                    </span>
                    <span className="absolute inset-0 origin-bottom scale-y-0 bg-accent transition-transform duration-300 group-hover:scale-y-100" />
                  </button>
                </span>
              </Reveal>
              <Reveal delay={160}>
                <div className="glyph mt-8 font-mono text-sm leading-relaxed text-muted [text-shadow:0_1px_14px_#070707] md:text-base lg:whitespace-nowrap">
                  <span className="block invisible select-none" aria-hidden>
                    .
                  </span>
                  <span className="block invisible select-none lg:mr-[14px]" aria-hidden>
                    .
                  </span>
                  <span className="block invisible select-none lg:mr-[28px]" aria-hidden>
                    .
                  </span>
                  <span className="block invisible select-none lg:mr-[42px]" aria-hidden>
                    .
                  </span>
                  <span className="block lg:mr-[56px]">ts goes hard ✦ 𓌺</span>
                </div>
              </Reveal>
            </div>
        </div>
        </section>
      </main>
    </>
  );
}

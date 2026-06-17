"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Loops a background track. Attempts autoplay on load and falls back to the
// first user gesture if the browser blocks autoplay-with-sound. Drop a file you
// own at public/audio/aryan.mp3 (or pass a different src).
export function MusicPlayer({ src = "/audio/aryan.mp3" }: { src?: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const start = async () => {
      const a = audioRef.current;
      if (!a || !a.paused) return;
      try {
        a.volume = 0.55;
        await a.play();
      } catch {
        // Blocked by autoplay policy — a gesture (below) starts it instead.
      }
    };
    // Attempt to play immediately on load; if the browser blocks
    // autoplay-with-sound, the first pointer/key gesture kicks it off.
    start();
    window.addEventListener("pointerdown", start);
    window.addEventListener("keydown", start);
    return () => {
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
    };
  }, []);

  const toggle = async () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      try {
        a.volume = 0.55;
        await a.play();
      } catch {
        /* no-op */
      }
    } else {
      a.pause();
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={src}
        loop
        preload="auto"
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Mute music" : "Play music"}
        className="group fixed bottom-5 right-5 z-[75] flex items-center gap-2.5 border border-white/15 bg-black/50 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.3em] text-white/80 backdrop-blur-sm transition-colors hover:border-accent/60 hover:text-white"
      >
        <span className="flex h-3 items-end gap-[2px]">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={cn(
                "w-[2px] bg-accent",
                playing ? "animate-eq" : "h-[3px] opacity-40",
              )}
              style={playing ? { animationDelay: `${i * 0.12}s`, height: "100%" } : undefined}
            />
          ))}
        </span>
        {playing ? "backr00ms" : "sound off"}
      </button>
    </>
  );
}

export default MusicPlayer;

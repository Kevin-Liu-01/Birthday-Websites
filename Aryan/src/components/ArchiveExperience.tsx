"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import CrossOrbit from "./CrossOrbit";
import { ReelView } from "./ReelView";
import { cn } from "@/lib/utils";

// Full-screen takeover launched from the landing page. The 3D orbit is the main
// view; you can flip it to a reel and toggle the glitch treatment.
export function ArchiveExperience({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<"orbit" | "reel">("orbit");
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[66] bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="h-full w-full">
        {mode === "orbit" ? <CrossOrbit glitch={glitch} /> : <ReelView glitch={glitch} />}
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-4 z-[20] flex items-center justify-between px-5 font-mono text-[10px] uppercase tracking-[0.3em] md:px-8">
        <div className="pointer-events-auto flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMode("orbit")}
            className={cn("transition-colors hover:text-foreground", mode === "orbit" ? "text-foreground" : "text-muted")}
          >
            orbit
          </button>
          <span className="text-white/25">/</span>
          <button
            type="button"
            onClick={() => setMode("reel")}
            className={cn("transition-colors hover:text-foreground", mode === "reel" ? "text-foreground" : "text-muted")}
          >
            reel
          </button>
        </div>
        <div className="pointer-events-auto flex items-center gap-5">
          <button
            type="button"
            onClick={() => setGlitch((g) => !g)}
            className={cn("transition-colors hover:text-foreground", glitch ? "text-accent" : "text-muted")}
          >
            [ glitch {glitch ? "on" : "off"} ]
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-foreground transition-colors hover:text-accent"
          >
            exit ✕
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default ArchiveExperience;

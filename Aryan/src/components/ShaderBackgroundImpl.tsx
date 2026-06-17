"use client";

import { Shader, SolidColor, Glass, Swirl, FlowField } from "shaders/react";

// Living liquid-glass darkness: a monochrome swirl pushed through a flow field
// and refracted by full-frame glass. Based on the user-provided Glass preset,
// retuned to black/white and slowed to an ambient drift.
export default function ShaderBackgroundImpl({ onReady }: { onReady?: () => void }) {
  return (
    <Shader className="h-full w-full" colorSpace="srgb" onReady={onReady}>
      <SolidColor color="#0a0a0a" />
      <Swirl
        blend={46}
        colorA="#9a9a9a"
        colorB="#0e0e0e"
        colorSpace="oklab"
        detail={2.6}
        speed={0.16}
      />
      <FlowField detail={1} evolutionSpeed={1.5} speed={1.7} strength={0.8} />
    </Shader>
  );
}

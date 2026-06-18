"use client";

import { Shader, SolidColor, Fog } from "shaders/react";

// Steady monochrome fog filling the base of the portal section. Unlike the
// Smoke emitter (which rises from a point and reads as a moving line), Fog is a
// full-field volumetric cloud that already exists on entry — it just drifts.
// The SolidColor matches the page background so only the gray fog reads, and
// the parent's top mask feathers it so it pools in the bottom half with no edge.
export default function SmokeFogImpl() {
  return (
    <Shader className="h-full w-full" colorSpace="srgb">
      <SolidColor color="#070707" />
      <Fog
        colorA="#cdced3"
        colorB="#4a4a50"
        colorSpace="oklab"
        seed={7}
        speed={0.5}
        turbulence={0.7}
        detail={13}
        blending={0.45}
        mouseInfluence={0.2}
        mouseRadius={0.12}
      />
    </Shader>
  );
}

"use client";

import { Shader, ImageTexture, Glitch, Sharpness, VHS, Posterize } from "shaders/react";

// The user-provided glitch/VHS chain over one photo. Heavy, so only mounted for
// the single image being viewed.
export default function GlitchImageImpl({ url }: { url: string }) {
  return (
    <Shader className="h-full w-full" colorSpace="srgb">
      <ImageTexture url={url} objectFit="cover" />
      <Glitch
        blockDensity={11}
        colorBarIntensity={0.03}
        intensity={0.36}
        mirrorAmount={0.66}
        rgbShift={17}
        scanlineIntensity={0.08}
        speed={0.9}
      />
      <Sharpness sharpness={1} visible={true} />
      <VHS scanlineNoise={0.15} smear={-0.18} wobble={0.09} />
      <Posterize blendMode="difference" intensity={4} />
    </Shader>
  );
}

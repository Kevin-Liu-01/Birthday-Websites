"use client";

import dynamic from "next/dynamic";

// pixi.js touches browser globals at import time, so this only loads client-side.
const Impl = dynamic(() => import("./ShaderBackgroundImpl"), { ssr: false });

export default function ShaderBackground({ onReady }: { onReady?: () => void }) {
  return <Impl onReady={onReady} />;
}

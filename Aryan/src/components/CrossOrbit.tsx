"use client";

import dynamic from "next/dynamic";

// three.js / R3F is client-only.
const Impl = dynamic(() => import("./CrossOrbitImpl"), { ssr: false });

export default function CrossOrbit({ glitch = false }: { glitch?: boolean }) {
  return <Impl glitch={glitch} />;
}

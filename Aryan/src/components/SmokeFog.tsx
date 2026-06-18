"use client";

import dynamic from "next/dynamic";

// WebGL smoke touches browser globals at import time, so load it client-side only.
const Impl = dynamic(() => import("./SmokeFogImpl"), { ssr: false });

export default function SmokeFog() {
  return <Impl />;
}

"use client";

import dynamic from "next/dynamic";

const Impl = dynamic(() => import("./GlitchImageImpl"), { ssr: false });

export default function GlitchImage({ url }: { url: string }) {
  return <Impl url={url} />;
}

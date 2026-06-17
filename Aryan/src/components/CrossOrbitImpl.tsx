"use client";

import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import {
  Billboard,
  Environment,
  Image as DreiImage,
  Lightformer,
  OrbitControls,
} from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { photos } from "@/lib/photos";
import GlitchImage from "./GlitchImage";

const ORBIT = photos.map((p) => ({
  url: p.src.replace("/photos/", "/orbit/"),
  aspect: p.w / p.h,
}));

const RADIUS = 4.4;

function fibSphere(n: number, r: number): [number, number, number][] {
  const pts: [number, number, number][] = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / Math.max(1, n - 1)) * 2;
    const rad = Math.sqrt(Math.max(0, 1 - y * y));
    const th = phi * i;
    pts.push([Math.cos(th) * rad * r, y * r, Math.sin(th) * rad * r]);
  }
  return pts;
}

function MetalCross() {
  const ref = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => {
    const vw = 0.34;
    const hh = 0.34;
    const top = 2.0;
    const bottom = -2.7;
    const hw = 1.25;
    const armY = 1.0;
    const a = armY + hh;
    const b = armY - hh;
    const s = new THREE.Shape();
    s.moveTo(-vw, top);
    s.lineTo(vw, top);
    s.lineTo(vw, a);
    s.lineTo(hw, a);
    s.lineTo(hw, b);
    s.lineTo(vw, b);
    s.lineTo(vw, bottom);
    s.lineTo(-vw, bottom);
    s.lineTo(-vw, b);
    s.lineTo(-hw, b);
    s.lineTo(-hw, a);
    s.lineTo(-vw, a);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, {
      depth: 0.55,
      bevelEnabled: true,
      bevelThickness: 0.09,
      bevelSize: 0.07,
      bevelSegments: 4,
      steps: 1,
    });
    g.center();
    return g;
  }, []);

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.16;
  });

  return (
    <mesh ref={ref} geometry={geo} scale={1.18}>
      <meshStandardMaterial color="#dcdcdc" metalness={1} roughness={0.13} envMapIntensity={2.2} />
    </mesh>
  );
}

function Photo({
  url,
  aspect,
  position,
  dim,
  onClick,
}: {
  url: string;
  aspect: number;
  position: [number, number, number];
  dim: boolean;
  onClick: (e: ThreeEvent<MouseEvent>) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const h = 1.05;
  const w = h * aspect;
  const k = hovered && !dim ? 1.12 : 1;
  return (
    <Billboard position={position}>
      <DreiImage
        url={url}
        transparent
        scale={[w * k, h * k]}
        grayscale={dim ? 1 : hovered ? 0 : 0.55}
        opacity={dim ? 0.1 : 1}
        radius={0.03}
        onClick={onClick}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
      />
    </Billboard>
  );
}

function OrbitCloud({
  focused,
  onFocus,
}: {
  focused: number | null;
  onFocus: (i: number) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const positions = useMemo(() => fibSphere(ORBIT.length, RADIUS), []);
  useFrame((_, dt) => {
    if (group.current && focused === null) group.current.rotation.y += dt * 0.085;
  });
  return (
    <group ref={group} rotation={[0.18, 0, 0]}>
      {ORBIT.map((o, idx) => (
        <Photo
          key={o.url}
          url={o.url}
          aspect={o.aspect}
          position={positions[idx]}
          dim={focused !== null}
          onClick={(e) => {
            e.stopPropagation();
            onFocus(idx);
          }}
        />
      ))}
    </group>
  );
}

function Focused({ index, onClose }: { index: number | null; onClose: () => void }) {
  const grp = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!grp.current) return;
    const s = grp.current.scale.x + (1 - grp.current.scale.x) * 0.18;
    grp.current.scale.set(s, s, s);
  });
  if (index === null) return null;
  const o = ORBIT[index];
  const h = 3.3;
  const w = h * o.aspect;
  return (
    <group ref={grp} scale={0.86}>
      <Billboard position={[0, 0, 4]}>
        <DreiImage
          url={o.url}
          transparent
          scale={[w, h]}
          radius={0.04}
          onClick={(e: ThreeEvent<MouseEvent>) => {
            e.stopPropagation();
            onClose();
          }}
        />
      </Billboard>
    </group>
  );
}

export default function CrossOrbitImpl({ glitch = false }: { glitch?: boolean }) {
  const [focused, setFocused] = useState<number | null>(null);
  const [vp, setVp] = useState({ w: 1280, h: 800 });
  const n = ORBIT.length;

  useEffect(() => {
    const u = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    u();
    window.addEventListener("resize", u);
    return () => window.removeEventListener("resize", u);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (focused === null) return;
      if (e.key === "Escape") setFocused(null);
      else if (e.key === "ArrowRight") setFocused((f) => (f === null ? null : (f + 1) % n));
      else if (e.key === "ArrowLeft") setFocused((f) => (f === null ? null : (f - 1 + n) % n));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focused, n]);

  return (
    <div className="relative h-full w-full">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 9.5], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        onPointerMissed={() => setFocused(null)}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[6, 8, 5]} intensity={1.2} />
        <Suspense fallback={null}>
          <Environment resolution={256}>
            <Lightformer form="rect" intensity={5} position={[0, 5, -8]} scale={[16, 9, 1]} color="#ffffff" />
            <Lightformer form="rect" intensity={4} position={[-7, 1, 4]} scale={[4, 12, 1]} color="#ffffff" />
            <Lightformer form="rect" intensity={4} position={[7, 1, 4]} scale={[4, 12, 1]} color="#ffffff" />
            <Lightformer form="rect" intensity={2.2} position={[0, -6, 4]} scale={[14, 4, 1]} color="#9aa0aa" />
            <Lightformer form="rect" intensity={1.2} position={[3.5, 0, 7]} scale={[2.4, 3, 1]} color="#e10600" />
          </Environment>
          <MetalCross />
          <OrbitCloud focused={focused} onFocus={setFocused} />
          <Focused index={glitch ? null : focused} onClose={() => setFocused(null)} />
        </Suspense>
        <OrbitControls
          enablePan={false}
          enableZoom
          enableDamping
          dampingFactor={0.08}
          minDistance={6.5}
          maxDistance={13}
          enabled={focused === null}
          makeDefault
        />
      </Canvas>

      {focused !== null ? (
        <>
          {glitch && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              onClick={() => setFocused(null)}
            >
              <div
                className="relative overflow-hidden shadow-[0_0_120px_rgba(0,0,0,0.9)]"
                style={(() => {
                  const a = ORBIT[focused].aspect;
                  const h = Math.min(vp.h * 0.72, (vp.w * 0.86) / a);
                  return { width: h * a, height: h };
                })()}
                onClick={(e) => e.stopPropagation()}
              >
                <GlitchImage url={ORBIT[focused].url} />
                <div className="scanlines pointer-events-none absolute inset-0" />
              </div>
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-0 top-5 text-center font-mono text-[11px] uppercase tracking-[0.3em] text-muted">
            <span className="text-foreground">{String(focused + 1).padStart(2, "0")}</span>
            {" / "}
            {String(n).padStart(2, "0")}
          </div>
          <button
            type="button"
            onClick={() => setFocused((f) => (f === null ? null : (f - 1 + n) % n))}
            aria-label="Previous"
            className="absolute left-3 top-1/2 -translate-y-1/2 px-3 py-6 font-display text-4xl text-muted transition-colors hover:text-foreground md:left-8 md:text-6xl"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => setFocused((f) => (f === null ? null : (f + 1) % n))}
            aria-label="Next"
            className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-6 font-display text-4xl text-muted transition-colors hover:text-foreground md:right-8 md:text-6xl"
          >
            ›
          </button>
        </>
      ) : (
        <div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
          drag to orbit &middot; click to lock in
        </div>
      )}
    </div>
  );
}

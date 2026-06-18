"use client";

import { useEffect, useRef, useState } from "react";
import { liquidFragSource, liquidVertSource } from "@/lib/liquid/frag";
import { buildBevelMask } from "@/lib/liquid/parseLogoImage";
import { renderNameCanvas } from "@/lib/liquid/renderName";

export type LiquidParams = {
  patternScale: number;
  refraction: number;
  edge: number;
  patternBlur: number;
  liquid: number;
  speed: number;
};

const DEFAULTS: LiquidParams = {
  patternScale: 2,
  refraction: 0.001,
  edge: 0.4,
  patternBlur: 0.005,
  liquid: 0.05,
  speed: 0.32,
};

export type LiquidColors = { c1: [number, number, number]; c2: [number, number, number] };

// Default tint is the opium red (ARYAN + the boot counter). Pass a silver pair
// for clean chrome.
const DEFAULT_COLORS: LiquidColors = { c1: [1.0, 0.32, 0.2], c2: [0.4, 0.0, 0.0] };

function compile(gl: WebGL2RenderingContext, src: string, type: number) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("liquid shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function LiquidMetal({
  text,
  className,
  params,
  onReady,
  iterations = 200,
  maskMax,
  colors,
  mono = false,
}: {
  text: string;
  className?: string;
  params?: Partial<LiquidParams>;
  onReady?: () => void;
  iterations?: number;
  maskMax?: { w: number; h: number };
  colors?: LiquidColors;
  mono?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [failed, setFailed] = useState(false);

  const merged: LiquidParams = { ...DEFAULTS, ...params };
  const paramsRef = useRef(merged);
  paramsRef.current = merged;

  const colorsRef = useRef<LiquidColors>(colors ?? DEFAULT_COLORS);
  colorsRef.current = colors ?? DEFAULT_COLORS;
  const monoRef = useRef(mono);
  monoRef.current = mono;

  // Depend on primitive sizes, not the object identity, to avoid re-running.
  const mw = maskMax?.w;
  const mh = maskMax?.h;

  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const uniformsRef = useRef<Record<string, WebGLUniformLocation | null>>({});
  const textureRef = useRef<WebGLTexture | null>(null);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  const signalledRef = useRef(false);
  const [aspect, setAspect] = useState(maskMax ? maskMax.w / maskMax.h : 3.2);

  // Rebuild the bevel mask whenever the text changes.
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const nameCanvas = await renderNameCanvas(
          text,
          mw && mh ? { maxWidth: mw, maxHeight: mh } : undefined,
        );
        if (cancelled) return;
        const mask = buildBevelMask(nameCanvas, iterations);
        if (!cancelled) {
          setImageData(mask);
          setAspect(mask.width / mask.height);
        }
      } catch (e) {
        console.error("liquid mask build failed:", e);
        if (!cancelled) {
          setFailed(true);
          onReadyRef.current?.();
        }
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [text, iterations, mw, mh]);

  // Initialize WebGL once, then run the render loop.
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const gl = canvas.getContext("webgl2", { antialias: true, alpha: true });
    if (!gl) {
      setFailed(true);
      onReadyRef.current?.();
      return;
    }

    const vert = compile(gl, liquidVertSource, gl.VERTEX_SHADER);
    const frag = compile(gl, liquidFragSource, gl.FRAGMENT_SHADER);
    const program = gl.createProgram();
    if (!program || !vert || !frag) {
      setFailed(true);
      onReadyRef.current?.();
      return;
    }
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("liquid program link error:", gl.getProgramInfoLog(program));
      setFailed(true);
      onReadyRef.current?.();
      return;
    }
    gl.useProgram(program);

    const uniforms: Record<string, WebGLUniformLocation | null> = {};
    const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < count; i++) {
      const info = gl.getActiveUniform(program, i);
      if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);
    }
    glRef.current = gl;
    uniformsRef.current = uniforms;

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // Start with a 1x1 white texture (edge=1 everywhere -> fully transparent),
    // so nothing flashes before the first mask is uploaded.
    const texture = gl.createTexture();
    textureRef.current = texture;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // Trilinear minification: the bevel mask is built large and often drawn
    // small. Without mipmaps that heavy downscale aliases into moire/contour
    // rings on curved glyphs. Mipmaps average each level cleanly.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.uniform1i(uniforms.u_image_texture, 0);
    gl.uniform1f(uniforms.u_img_ratio, 1);

    const p = paramsRef.current;
    gl.uniform1f(uniforms.u_edge, p.edge);
    gl.uniform1f(uniforms.u_patternBlur, p.patternBlur);
    gl.uniform1f(uniforms.u_patternScale, p.patternScale);
    gl.uniform1f(uniforms.u_refraction, p.refraction);
    gl.uniform1f(uniforms.u_liquid, p.liquid);
    const col = colorsRef.current;
    gl.uniform3fv(uniforms.u_color1, col.c1);
    gl.uniform3fv(uniforms.u_color2, col.c2);
    gl.uniform1f(uniforms.u_mono, monoRef.current ? 1 : 0);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const w = Math.max(1, wrap.clientWidth);
      const h = Math.max(1, wrap.clientHeight);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(uniforms.u_ratio, w / h);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    let raf = 0;
    let total = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = now - last;
      last = now;
      const cur = paramsRef.current;
      total += dt * cur.speed;
      gl.uniform1f(uniforms.u_edge, cur.edge);
      gl.uniform1f(uniforms.u_patternBlur, cur.patternBlur);
      gl.uniform1f(uniforms.u_patternScale, cur.patternScale);
      gl.uniform1f(uniforms.u_refraction, cur.refraction);
      gl.uniform1f(uniforms.u_liquid, cur.liquid);
      gl.uniform1f(uniforms.u_time, total);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
      glRef.current = null;
    };
  }, []);

  // Upload the mask to the texture whenever it changes.
  useEffect(() => {
    const gl = glRef.current;
    const tex = textureRef.current;
    if (!gl || !tex || !imageData) return;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      imageData.width,
      imageData.height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      imageData.data,
    );
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.uniform1f(uniformsRef.current.u_img_ratio, imageData.width / imageData.height);
    if (!signalledRef.current) {
      signalledRef.current = true;
      onReadyRef.current?.();
    }
  }, [imageData]);

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{ aspectRatio: String(aspect) }}
      aria-label={text}
      role="img"
    >
      {failed ? (
        <div className="chrome-fallback flex h-full w-full items-center justify-center font-display leading-none tracking-tight">
          <span className="text-[18vw] md:text-[14vw]">{text}</span>
        </div>
      ) : (
        <canvas
          ref={canvasRef}
          className="h-full w-full"
          style={{ opacity: imageData ? 1 : 0, transition: "opacity 500ms ease" }}
        />
      )}
    </div>
  );
}

export default LiquidMetal;

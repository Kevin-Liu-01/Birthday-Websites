// Draws text into a transparent canvas as solid black glyphs, sized to fit a
// target box with breathing room. The result feeds buildBevelMask -> the
// liquid-metal shader, so the chrome is confined to the letterforms.

type Options = {
  maxWidth?: number;
  maxHeight?: number;
  letterSpacing?: number; // in em
  fontVar?: string; // CSS variable that next/font assigned (e.g. --font-anton)
};

// next/font registers the face under a hashed family name and exposes it via a
// CSS variable. The canvas needs that real family — the literal "Anton" string
// won't match, so it would silently fall back to a system font.
function resolveFamily(fontVar: string): string {
  if (typeof document !== "undefined") {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(fontVar)
      .trim();
    if (value) return value;
  }
  return '"Anton", system-ui, sans-serif';
}

async function ensureFont(family: string) {
  try {
    const primary = family.split(",")[0].trim();
    await document.fonts.load(`400 200px ${primary}`);
    await document.fonts.ready;
  } catch {
    // Canvas falls back to a system face if the web font is unavailable.
  }
}

export async function renderNameCanvas(
  text: string,
  opts: Options = {},
): Promise<HTMLCanvasElement> {
  const family = resolveFamily(opts.fontVar ?? "--font-anton");
  const maxWidth = opts.maxWidth ?? 1240;
  const maxHeight = opts.maxHeight ?? 480;
  const ls = opts.letterSpacing ?? 0.01;

  await ensureFont(family);

  const measureCanvas = document.createElement("canvas");
  const measure = measureCanvas.getContext("2d")!;

  const applyFont = (ctx: CanvasRenderingContext2D, size: number) => {
    ctx.font = `400 ${size}px ${family}`;
    try {
      (ctx as unknown as { letterSpacing: string }).letterSpacing = `${ls * size}px`;
    } catch {
      // letterSpacing unsupported in this engine; skip it.
    }
  };

  const base = 400;
  applyFont(measure, base);
  const m0 = measure.measureText(text);
  const baseW = Math.max(1, m0.width);
  const baseH = (m0.actualBoundingBoxAscent || base * 0.72) + (m0.actualBoundingBoxDescent || 0);

  const padBase = base * 0.28;
  const scale = Math.min(
    (maxWidth - padBase * 2) / baseW,
    (maxHeight - padBase * 2) / baseH,
  );
  const fontSize = base * scale;

  applyFont(measure, fontSize);
  const m1 = measure.measureText(text);
  const ascent = m1.actualBoundingBoxAscent || fontSize * 0.72;
  const descent = m1.actualBoundingBoxDescent || 0;
  const textW = Math.ceil(m1.width);
  const textH = Math.ceil(ascent + descent);
  const pad = Math.round(fontSize * 0.26);

  const canvas = document.createElement("canvas");
  canvas.width = textW + pad * 2;
  canvas.height = textH + pad * 2;

  const ctx = canvas.getContext("2d")!;
  applyFont(ctx, fontSize);
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#000000";
  ctx.fillText(text, canvas.width / 2, pad + ascent);

  return canvas;
}

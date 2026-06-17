// Turns a shape canvas (opaque, non-white pixels = shape) into a grayscale
// bevel mask: shape interior is dark, fading to white at the boundary and
// outside. Adapted from paper-design/liquid-logo's parse-logo-image (MIT).
// A Poisson solve (Delta u = -C, u = 0 on the boundary) produces the rounded
// interior gradient that reads as a metal bevel under the liquid shader.

export function buildBevelMask(
  source: HTMLCanvasElement,
  iterations = 200,
): ImageData {
  const width = source.width;
  const height = source.height;
  const sctx = source.getContext("2d", { willReadFrequently: true });
  if (!sctx) throw new Error("Could not get 2d context for mask source");

  const { data } = sctx.getImageData(0, 0, width, height);

  // 1) Inside/outside mask. Pure-white or fully-transparent pixels are
  // background; everything else belongs to the shape.
  const shapeMask = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const p = i * 4;
    const r = data[p];
    const g = data[p + 1];
    const b = data[p + 2];
    const a = data[p + 3];
    shapeMask[i] = (r === 255 && g === 255 && b === 255 && a === 255) || a === 0 ? 0 : 1;
  }

  const inside = (x: number, y: number) =>
    x >= 0 && x < width && y >= 0 && y < height && shapeMask[y * width + x] === 1;

  // 2) Boundary pixels: shape pixels that touch a non-shape neighbor.
  const boundaryMask = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (!shapeMask[idx]) continue;
      let isBoundary = false;
      for (let ny = y - 1; ny <= y + 1 && !isBoundary; ny++) {
        for (let nx = x - 1; nx <= x + 1 && !isBoundary; nx++) {
          if (!inside(nx, ny)) isBoundary = true;
        }
      }
      if (isBoundary) boundaryMask[idx] = 1;
    }
  }

  // 3) Jacobi iterations on the Poisson equation, u = 0 at the boundary.
  let u = new Float32Array(width * height);
  let newU = new Float32Array(width * height);
  const C = 0.01;

  const getU = (x: number, y: number, arr: Float32Array) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return 0;
    if (!shapeMask[y * width + x]) return 0;
    return arr[y * width + x];
  };

  for (let iter = 0; iter < iterations; iter++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (!shapeMask[idx] || boundaryMask[idx]) {
          newU[idx] = 0;
          continue;
        }
        const sumN =
          getU(x + 1, y, u) + getU(x - 1, y, u) + getU(x, y + 1, u) + getU(x, y - 1, u);
        newU[idx] = (C + sumN) / 4;
      }
    }
    const tmp = u;
    u = newU;
    newU = tmp;
  }

  // 4) Normalize and apply a contrast remap into a grayscale image.
  let maxVal = 0;
  for (let i = 0; i < width * height; i++) if (u[i] > maxVal) maxVal = u[i];
  if (maxVal === 0) maxVal = 1;

  const alpha = 2.0;
  const out = new ImageData(width, height);
  for (let i = 0; i < width * height; i++) {
    const p = i * 4;
    if (!shapeMask[i]) {
      out.data[p] = out.data[p + 1] = out.data[p + 2] = 255;
      out.data[p + 3] = 255;
    } else {
      const remapped = Math.pow(u[i] / maxVal, alpha);
      const gray = 255 * (1 - remapped);
      out.data[p] = out.data[p + 1] = out.data[p + 2] = gray;
      out.data[p + 3] = 255;
    }
  }
  return out;
}

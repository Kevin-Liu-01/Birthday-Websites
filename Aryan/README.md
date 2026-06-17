# ARYAN &#10015; a birthday shrine

A dark, avant-garde ("opium") 21st-birthday site for Aryan.

## The flow

- **Loader** — a counter ticking to **21**, each digit rendered in the display
  font through the liquid-metal chrome shader.
- **Landing** — a liquid-glass shader background, the name `ARYAN` as flowing
  chrome (ported from [paper-design/liquid-logo](https://github.com/paper-design/liquid-logo):
  WebGL2 + a Poisson bevel mask built from the text at runtime), a feathered
  double-exposure photo, a dedication, and a looping background track.
- **The archive** — click **ENTER** to drop into a full-screen 3D experience:
  32 photos orbiting a giant chrome cross (`three` + `@react-three/fiber`).
  - **orbit / reel** — flip between the 3D orbit and an auto-scrolling reel.
  - **lock in** — click a photo to focus it (3D in orbit, lightbox in reel).
  - **glitch** — run the focused photo through a `Glitch` + `VHS` + `Posterize`
    shader chain (the [`shaders`](https://shaders.com) library).

## Run

```bash
pnpm install
pnpm dev      # http://localhost:3000
```

```bash
pnpm build && pnpm start   # production
```

## Music

The site loops a track from `public/audio/aryan.mp3`, started on the first
interaction (browsers block autoplay-with-sound until a gesture). **That file is
not committed** — drop in a track you own at `public/audio/aryan.mp3` and it
plays automatically; until then the toggle just reads "sound off".

## Customize

| What | Where |
| --- | --- |
| The name in chrome | `text="ARYAN"` in `src/app/page.tsx` |
| Dedication / copy | `src/app/page.tsx` |
| Accent color (blood red) | `--accent` in `src/app/globals.css` |
| Liquid-metal look | `DEFAULTS` in `src/components/LiquidMetal.tsx` |
| Background shader | `src/components/ShaderBackgroundImpl.tsx` |
| 3D orbit / cross | `src/components/CrossOrbitImpl.tsx` |
| Glitch look | `src/components/GlitchImageImpl.tsx` |

### Swapping photos

Drop web-ready images into `public/photos/`, generate small `public/orbit/`
thumbnails for the 3D textures, and update `src/lib/photos.json`
(`{ "src": "/photos/<file>", "w": <px>, "h": <px> }` per photo). Originals were
resized with macOS `sips`:

```bash
sips -s format jpeg -Z 2000 -s formatOptions 80 input.HEIC --out public/photos/photo-XX.jpg
```

## Stack

Next.js 16 (App Router, Turbopack) &middot; React 19 &middot; Tailwind v4 &middot;
`three` / `@react-three/fiber` / `@react-three/drei` &middot; `shaders` + `pixi.js`
&middot; `motion` &middot; fonts: Anton, Pirata One, Geist Mono.

The liquid-metal shader is adapted from paper-design/liquid-logo (MIT).

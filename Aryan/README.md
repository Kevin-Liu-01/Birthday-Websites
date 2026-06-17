# ARYAN &#10015; a birthday shrine

A dark, avant-garde ("opium") birthday site for Aryan, built as a photo gallery.

- **Liquid-metal hero** — the name `ARYAN` rendered as flowing chrome, using a
  port of [paper-design/liquid-logo](https://github.com/paper-design/liquid-logo)
  (WebGL2 + a Poisson bevel mask generated from the text at runtime).
- **Living glass background** — a monochrome `Swirl` + `FlowField` refracted
  through `Glass`, from the [`shaders`](https://shaders.com) library.
- **The archive** — a black-and-white masonry gallery. Click any frame for a
  full-color lightbox; toggle **glitch** (or press `g`) to run the photo through
  a `Glitch` + `VHS` + `Posterize` shader chain.

## Run

```bash
pnpm install
pnpm dev      # http://localhost:3000
```

```bash
pnpm build && pnpm start   # production
```

## Customize

| What | Where |
| --- | --- |
| The name in chrome | `text="ARYAN"` in `src/app/page.tsx` |
| Dedication / copy | `src/app/page.tsx` |
| Accent color (blood red) | `--accent` in `src/app/globals.css` |
| Liquid-metal look | `DEFAULTS` in `src/components/LiquidMetal.tsx` |
| Background shader | `src/components/ShaderBackgroundImpl.tsx` |
| Glitch look | `src/components/GlitchImageImpl.tsx` |

### Swapping photos

Drop web-ready images into `public/photos/` and update `src/lib/photos.json`
(`{ "src": "/photos/<file>", "w": <px>, "h": <px> }` per photo — dimensions are
used to avoid layout shift). HEIC/large originals were resized to 2000px JPEGs
with macOS `sips`:

```bash
sips -s format jpeg -Z 2000 -s formatOptions 80 input.HEIC --out public/photos/photo-XX.jpg
```

## Stack

Next.js 16 (App Router, Turbopack) &middot; React 19 &middot; Tailwind v4 &middot;
`shaders` + `pixi.js` &middot; fonts: Anton, Pirata One, Geist Mono.

The liquid-metal shader is adapted from paper-design/liquid-logo (MIT).

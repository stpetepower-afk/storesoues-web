# Hallelujah ONE™ — Visual Identity

**Direction: "Elevated Clarity."** Warm, earthy, human-centered, aspirational —
the studio-quality look of architectural visualization and premium editorial
design. Clean, precise, immersive. Built to stay consistent from
**Seed → Scale → National Expansion.**

This is the foundational branding package: the colors, fonts, and visual
direction that every downstream surface — the Digital Twin walkthrough, the
Command Center dashboard, and partner handoff materials — should build on.

## What's here

| File | Purpose |
| --- | --- |
| `src/styles/tokens.css` | **Single source of truth** — color ramps, semantic colors, type scale, spacing, radii, shadows, gradients, motion. Light + dark. |
| `src/styles/base.css` | Reset + default typography and layout helpers (`.container`, `.eyebrow`, `.lead`). |
| `src/styles/components.css` | Reusable UI: buttons, cards, badges, and the chat widget skin. |
| `brand/index.html` | **Living brand guidelines** — a viewable showcase of the whole system, with the real chat widget running on-brand. |

Open `brand/index.html` in a browser (see below) to see it all in context.

## The palette

Reference the **semantic tokens**, not the raw ramps, so a future palette
change flows everywhere at once.

| Role | Token | Value |
| --- | --- | --- |
| Primary — deep green | `--brand-primary` | `#1b4332` |
| Accent — warm gold | `--brand-accent` | `#e0b84c` |
| Secondary — rich blue | `--brand-secondary` | `#2a6f97` |
| Ground — warm paper | `--bg` | `#fdfbf7` |
| Ink — text | `--text` | `#1a1712` |

Neutrals are deliberately **warm-tinted (sand), never true gray.** Three
signature gradients — `--gradient-warm`, `--gradient-earth`, `--gradient-dawn` —
carry heroes and data viz.

## Typography

- **Display:** Montserrat → Inter → SF Pro Display (`--font-display`)
- **Text:** Inter → SF Pro Text / system sans (`--font-sans`)
- Type scale is a 1.200 minor third on a 16px base (`--text-xs` … `--text-5xl`).

Fonts degrade gracefully to the platform's best sans, so the system needs no
external network requests to look right.

## Using it

Load the three stylesheets in order (tokens first):

```html
<link rel="stylesheet" href="/src/styles/tokens.css" />
<link rel="stylesheet" href="/src/styles/base.css" />
<link rel="stylesheet" href="/src/styles/components.css" />
```

Then compose with tokens and component classes:

```html
<span class="eyebrow">Mac House</span>
<h2>The campus experience</h2>
<button class="btn btn-primary">Take the tour</button>

<article class="card card--interactive" style="max-width: 22rem;">
  <h3 class="card__title">Wellness Oasis</h3>
  <p class="card__body">Infrared therapy, sauna, meditation spaces.</p>
</article>
```

## Dark mode

Every semantic token has a dark variant. It follows the OS preference via
`prefers-color-scheme`, and a `data-theme="light|dark"` attribute on `<html>`
overrides it in both directions (the guidelines page has a working toggle).

## Preview locally

No build step or dependencies — these are static files. From the repo root:

```bash
python3 -m http.server 8000
# then open http://localhost:8000/brand/
```

Serving from the repo root keeps the `../src/...` paths in the guidelines page
resolving correctly.

## Principles — not cookie-cutter

**Create:** studio-quality renderings · human-centered layouts · a custom,
memorable identity · clean, elegant data · cinematic storytelling.

**Avoid:** generic stock photos · uncanny AI art · forgettable templates ·
cluttered dashboards · rushed, amateur video.

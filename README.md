# Hallelujah ONE™ — Web

A human empowerment operating system for St. Petersburg, FL. This repository holds
the public web experience — the **front door**, the **Digital Twin**, and the
**Command Center** — plus the reusable chat widget engine.

## Layers

| Layer | Page | Purpose |
| --- | --- | --- |
| Experience | `index.html`, `digital-twin.html` | Front door + interactive ecosystem map |
| Intelligence | `command-center.html` | Metrics, data-source status, AI Chief of Staff |
| Execution | (roadmap) | MacBook → iPad → Mac Mini → future AI node |

## Structure

```
index.html            Front door (brand, meta, OpenGraph, loader)
digital-twin.html     Digital Twin Experience v0.1 — interactive ecosystem map
command-center.html   Command Center — demo/live modes + AI Chief of Staff
assets/
  css/main.css        Brand design system
  js/site.js          Loader + scroll reveal
  js/digital-twin.js  Ecosystem map data + interaction
  js/command-center.js Dashboard + AI Chief of Staff (demo responder)
  img/favicon.svg     Brand mark / favicon
  img/og-image.(svg|png) Social sharing card (1200×630)
src/lib/chatWidget.js Reusable non-streaming chat engine
scripts/render-og.mjs Regenerates the OG PNG from the SVG
```

## Demo vs Live

Operating metrics shown across the site are **illustrative demo values**, labeled
as such for partner presentations. The Command Center includes a **Live
Operations** mode that reads from connected data sources once they are wired up
(housing DB, partner CRM, funding tracker, mobility feed, enterprise revenue).

## Develop

Any static server works, e.g.:

```bash
npx serve .        # or: python3 -m http.server
```

Regenerate the social image after editing `assets/img/og-image.svg`:

```bash
node scripts/render-og.mjs
```

## Deploy

Configured for Netlify (`netlify.toml`, publish root). No build step required.

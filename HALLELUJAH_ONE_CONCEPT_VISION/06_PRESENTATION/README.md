# 06 · Presentation

The deck you present from.

| File | Description |
|------|-------------|
| `Hallelujah ONE Vision Deck.pdf` | **Built.** The full 11-slide vision deck (16:9), in the Tokyo-modern visual system — fonts embedded, self-contained, present-ready. |
| `vision-deck.html` | The **source** for the PDF. Edit this, then re-render to update the deck. |

### Regenerating the PDF

The deck is authored as print-optimized HTML (`vision-deck.html`, 1280×720 slides) and
rendered to PDF with headless Chromium:

```
chrome --headless=new --no-pdf-header-footer \
  --print-to-pdf="Hallelujah ONE Vision Deck.pdf" vision-deck.html
```

The two fonts (Space Grotesk, Space Mono) load from Google Fonts when the HTML is opened
in a normal browser; for offline PDF rendering, install them locally first so they embed.
Japanese accents use any installed CJK gothic. As renders land in `01`–`04`, they appear
automatically in the architecture / community / interior slides (image paths are wired up).

### Suggested deck flow

1. **Cover** — hero rendering + "Hallelujah ONE™ · 3548 5th Ave S"
2. **The vision** — one line: four-unit sustainable workforce housing + mobility, food, technology, empowerment.
3. **What the viewer should feel** — dignity, belonging, sustainability, safety, opportunity, community.
4. **Architecture** — front / side / aerial.
5. **Community experience** — garden / courtyard / gathering.
6. **Interiors** — living / kitchen / bedroom.
7. **Mobility + economic mobility** — EV, transportation, digital learning. *"Not just housing. A pathway forward."*
8. **The philosophy** — Observe → Imagine → Build → Measure → Improve.
9. **Closing** — brand mark + disclaimer.

A ready-to-present, self-contained web version of this same story lives at
[`../vision-experience.html`](../vision-experience.html) — open it on the presentation iPad,
or export it to PDF for this file.

> *Conceptual visualization of proposed development. Final design, engineering, and construction documents will be developed through professional architectural and engineering processes during project advancement.*

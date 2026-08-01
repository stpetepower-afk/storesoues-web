---
name: funder-brief
description: Turn Command Center dashboard data into a crisp one-page funder or government briefing. Use when the user needs a leave-behind, an executive summary, or talking points for a meeting with a funder, HUD, CareerSource, city officials, or a foundation.
---

# Funder Brief — Hallelujah ONE

You produce a **one-page briefing** that a program officer or government partner
can absorb in 90 seconds.

## Steps

1. Read `data/org.json`, `data/metrics.json`, `data/funding.json`, and
   `data/deadlines.json`.
2. Confirm which funder/audience the brief is for so you can align the framing
   to their goals.
3. Flag any `"status": "SAMPLE"` figures before they reach an external reader.

## The one-page format

- **Header:** Hallelujah ONE · St. Petersburg, FL · the audience's name.
- **The ask, in one sentence:** what pathway/decision you're requesting
  guidance or support on (not "give us money" — "help us align to FY2026").
- **The model, in one line:** housing stability → workforce mobility →
  economic independence.
- **Proof (3–4 KPIs):** residents housed, job placements, 90-day retention,
  funding secured — pulled from `metrics.json`.
- **Alignment:** one line on how this maps to *their* performance goals.
- **Next step:** the specific action and date.

## Tone

Confident, measured, honest. This is a community operating system with a
measurement layer (the Command Center), not a pitch. Numbers must be real or
clearly labeled as targets/samples. Keep it to a single page.

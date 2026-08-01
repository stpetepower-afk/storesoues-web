# Loop Health Dashboard — Loop Engineering

The Command Center includes a **Loop Intelligence** panel (see
`public/index.html` → `#loops`, data in `data/loops.json`).

## What it shows

- Headline loop metrics (active loops, loops improving, automations, decisions
  assisted, knowledge growth, verified records).
- Top improving loops with progress bars.
- A single AI Chief-of-Staff loop insight.

## Data honesty

`data/loops.json` is marked `"status": "FRAMEWORK"`. **The numbers are
placeholders** demonstrating the panel — they are not measured yet. The panel
renders a `Framework` badge so no viewer mistakes them for real telemetry.

## To make it real

1. Instrument one loop (e.g. Resident Journey) to emit events (FEEDBACK_SYSTEM).
2. Compute its real "improving %" from measured cycles.
3. Replace that entry in `data/loops.json` with the computed value and drop the
   placeholder flag for that loop.
4. Repeat per loop. The panel becomes real one loop at a time.

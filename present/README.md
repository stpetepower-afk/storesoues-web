# Hallelujah ONE™ — iPad Presentation Mode

A fullscreen, touch-driven slide deck for the boardroom. Seven slides that pull
their numbers from the **same** `dashboard/data.js` the live Command Center
uses, so the pitch never drifts from the dashboard.

## Slides

1. Title — "One verifiable operating system"
2. The Triad — Digital Twin · Command Center · Apple Ecosystem
3. Impact & Operations — live stat tiles (residents, certifications, trips, H3O™)
4. Community Impact Layer — HUD/CoC-facing beside internal outcomes
5. Capital War Room — pipeline total, top targets, nearest deadlines
6. Deadline Countdown — computed live from deadline dates
7. The Invitation — the closing ask

## Navigation

| Action | Gesture / key |
|--------|---------------|
| Next / previous | Swipe left/right · tap the screen edges · `←` `→` · `Space` |
| Jump to slide | Tap a progress dot |
| First / last | `Home` / `End` |
| Fullscreen | `F` or the ⛶ button |

Built for a landscape iPad (add to Home Screen for a chromeless, app-like
launch) but responsive to any screen. Static — no build step. Load from the
repo root so `../src/styles/...` and `../dashboard/data.js` resolve:

```bash
python3 -m http.server 8000   # from repo root
# open http://localhost:8000/present/
```

## Editing

There's nothing to edit here — update `dashboard/data.js` and the deck follows.

# Hallelujah ONE™ — Command Center Dashboard (v1.0)

The ecosystem's live operating dashboard, built on the **Elevated Clarity**
design system. Five modules, one shareable link, no backend required.

## Modules

| # | Module | What it shows |
|---|--------|---------------|
| 1 | Executive Briefing | AI Chief of Staff daily feed + urgent alert |
| 2 | Capital War Room | Scored funding targets — filterable table with status badges, amounts, deadlines, next actions |
| 3 | Partner CRM | Relationships grouped by sector (Government, Healthcare, Corporate, Technology, Community) |
| 4 | Impact & Operations | Mac House, Workforce, Mobility, H3O™ — stat cards with progress bars |
| 5 | Deadline Countdown | High-visibility clocks, **computed live** from deadline dates (urgent < 30 days) |

## Files

| File | Role |
|------|------|
| `index.html` | Shell + stylesheet links |
| `data.js` | **JSON-backed state** — the only place to edit numbers, targets, partners |
| `dashboard.js` | Vanilla-JS renderer (no build step; all data escaped via DOM APIs) |

Styling comes from the shared design system: `src/styles/tokens.css`,
`base.css`, `components.css`, and `dashboard.css`.

## Why static (vs. the React/Node/SQLite in the spec)

This repo deploys as **static files to Netlify/Vercel** with no build pipeline,
and Netlify static hosting can't run a Node/SQLite backend. A self-contained,
data-driven page is the fastest path to a working, on-brand, shareable
dashboard — and it drops straight onto the existing deploy. The `data.js`
module preserves the spec's JSON schema, so a future backend can serve the same
shape (swap the `import` for a `fetch`) without touching the UI.

## Preview locally

```bash
python3 -m http.server 8000   # from repo root
# open http://localhost:8000/dashboard/
```

Serve from the repo root so the `../src/styles/...` paths resolve. Dark mode
follows the OS preference automatically.

## Editing data

Open `data.js` and edit the object — change a metric, add a `war_room_targets`
entry, or move a partner's `status` along the pipeline. Countdown numbers derive
from each deadline's ISO `deadline` date, so they stay honest on their own.

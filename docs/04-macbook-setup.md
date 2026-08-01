# 04 — MacBook Setup Checklist

*Builder station operations.* How to run and deploy this project from a MacBook.

> **Note on the stack.** This repo (`storesoues-web`) ships as **static files** —
> no build step, no `npm install`, no Node server required. The steps below are
> the real, working flow. The future React/Node/SQLite backend described in the
> architecture map is additive; when it lands, `npm` steps get added here.

## Run locally

| # | Action | Command |
|---|--------|---------|
| 1 | Clone the repository | `git clone https://github.com/stpetepower-afk/storesoues-web.git` |
| 2 | Enter the project | `cd storesoues-web` |
| 3 | Serve it (static, from the repo root) | `python3 -m http.server 8000` |
| 4 | Open the front door | `http://localhost:8000/` |

Serving from the **repo root** matters — the pages reference `../src/styles/…`
and `../dashboard/data.js`, which only resolve from the root.

### Pages

- `/` — handoff landing page
- `/dashboard/` — Command Center
- `/present/` — iPad presentation mode
- `/brand/` — visual identity guidelines
- `/handoff/script.html` — Monday partner demonstration script

## Deploy to Netlify (live sharing)

| # | Action | Command |
|---|--------|---------|
| 1 | Install the CLI (once) | `npm i -g netlify-cli` |
| 2 | Link the site | `netlify init` (or `netlify link`) |
| 3 | Deploy a preview | `netlify deploy` |
| 4 | Deploy to production | `netlify deploy --prod` |

There's **no build command** — the publish directory is the repo root (`.`).
Pushing the branch also produces an automatic Netlify deploy preview.

## Edit the data

All dashboard and deck numbers live in `dashboard/data.js`. Change a value there,
refresh, and every surface (dashboard, deck, pitch script) updates — no code edits.

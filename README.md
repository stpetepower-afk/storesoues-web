# Hallelujah ONE — Command Center

An economic mobility operating system dashboard for St. Petersburg, FL.
Housing stability · workforce mobility · economic independence.

## Run it

```bash
npm run dev
```

Then open **http://localhost:5173**. No install step is required — the dev
server uses only Node's built-in modules (Node 18+).

## What's here

```
.
├── package.json          # npm run dev / start
├── server.js             # zero-dependency static + /api/chat server
├── public/
│   ├── index.html        # the Command Center UI
│   ├── styles.css        # modern dark dashboard theme
│   └── dashboard.js      # loads data, renders charts, mounts the chat widget
├── data/                 # the local data foundation (edit these!)
│   ├── org.json          # organization + mission
│   ├── metrics.json      # KPI tiles
│   ├── residents.json    # mobility pathway stages
│   ├── funding.json      # funding pipeline
│   ├── partners.json     # partner CRM
│   ├── deadlines.json    # grant countdown engine reads these
│   └── h3o.json          # H3O production series
└── src/lib/chatWidget.js # the reusable chat widget (mounted as AI Chief of Staff)
```

## The data is SAMPLE data

Every file in `data/` is marked `"status": "SAMPLE"`. The numbers are
placeholders so the dashboard renders and demos cleanly. **Replace them with
verified figures before sharing with funders or government partners.** Just
edit the JSON and refresh the page — no code changes needed.

## AI Chief of Staff (the chat panel)

- **Offline mode (default):** works immediately with a canned briefing, no key.
- **Live mode:** set an Anthropic API key and restart:
  ```bash
  export ANTHROPIC_API_KEY=sk-ant-...
  # optional: export CHAT_MODEL=claude-sonnet-5
  npm run dev
  ```
  The server proxies the chat panel to the Anthropic Messages API. Your key
  stays server-side and is never sent to the browser.

## Roadmap (from the architecture handbook)

- **Sprint 1 — Foundation (done):** runnable dev server, data foundation, dashboard.
- **Sprint 2 — Intelligence:** live grant countdown alerts, richer CRM, impact metrics.
- **Sprint 3 — Demonstration:** iPad presentation mode, partner deck.
- **Sprint 4 — Cloud:** AWS backend (RDS, Lambda, S3), secure database.
- **Sprint 5 — Node Zero:** Mac Mini local AI, autonomous operations.

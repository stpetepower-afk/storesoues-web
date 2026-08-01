# 06 — Mac Mini Future Node Config

*Always-on local AI core.* How the Mac Mini becomes the autonomous node that
serves the Command Center on the local network and, later, runs a private AI
model. This is the **future** node config; today's site needs none of it to run.

## Hardware

- Mac Mini M4 (16GB RAM, 512GB SSD)
- Connected to the 3548 5th Avenue South network

## Serve the dashboard on the local network (today)

The current static site can run as an always-on kiosk/display with nothing but
Python:

```bash
git clone https://github.com/stpetepower-afk/storesoues-web.git
cd storesoues-web
python3 -m http.server 8000 --bind 0.0.0.0
# reachable at http://<mac-mini-ip>:8000/dashboard/
```

To keep it always-on, wrap that command in a `launchd` agent (a
`~/Library/LaunchAgents/*.plist` with `RunAtLoad` + `KeepAlive`) so it restarts
on boot and if it ever exits.

## Future software stack (when the backend lands)

- Node.js / Python environment
- SQLite database (the `data.js` schema, persisted)
- Local API server (Node + Express) serving the same JSON shape
- AI model runner (Ollama / LocalAI) for a **privacy-first** local Chief of Staff
- Dashboard server

When that arrives, the dashboard's data source swaps from the bundled
`import { data }` to a `fetch()` against the local API — the UI is unchanged.

## Future capabilities

- Local AI model execution (privacy-first — data never leaves the node)
- Offline operation
- Automatic data synchronization
- Voice-activated interface

> **Positioning:** describe this as "modern privacy-first technology practices"
> to funders — real-time outcome visibility while data stays local and compliant.

# Hallelujah ONE — Web

The web presence for **Hallelujah ONE**, a Hallelujah Ministries initiative building
community wealth in St. Petersburg's Historic Gas Plant District.

The site is a self-contained static landing page with a chat assistant. There is no build
step — the HTML, CSS, and client JS are served as-is, and the assistant is backed by a
small serverless function.

## Structure

```
index.html                 Landing page (hero, vision, model, roadmap, CTA, chat launcher)
supercharger.html          Interactive Supercharger ROI calculator (3548 5th Ave S)
src/
  styles/site.css          Brand styling + chat widget + calculator styles
  lib/chatWidget.js        Reusable, accessible chat widget engine (client)
  lib/chatCore.js          Shared server logic for the assistant
  lib/superchargerModel.js Pure ROI calculation (payback, NPV, margins)
api/chat.js                Vercel serverless endpoint  (POST /api/chat)
netlify/functions/chat.js  Netlify Function (same endpoint via redirect)
netlify.toml               Netlify build + /api/chat redirect
docs/
  CORNERSTONE.md           Single source of truth (vision, model, roadmap, blueprint)
  presentations/           Stakeholder deck(s)
```

## The chat assistant

The widget (`src/lib/chatWidget.js`) POSTs to `/api/chat`:

```
POST /api/chat
{ "system": "…", "messages": [ { "role": "user", "content": "…" } ] }
->
{ "text": "…" }
```

Both serverless handlers call `generateReply()` in `src/lib/chatCore.js`, which:

- uses the **Claude Messages API** when `ANTHROPIC_API_KEY` is set, or
- returns a **scripted fallback** otherwise, so previews work with no secrets.

### Enabling real Claude responses

Set these environment variables in your host (Vercel and/or Netlify project settings):

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `ANTHROPIC_API_KEY` | yes (for live replies) | — | Anthropic API key. Without it, the scripted fallback is used. |
| `ANTHROPIC_MODEL` | no | `claude-sonnet-5` | Override the model id. |

No key is committed to the repo; the function reads it from the environment at runtime.

## Local development

Any static file server works for the page. To exercise the assistant end-to-end you also
need the `/api/chat` route, which the platform CLIs provide:

```bash
# Vercel
npx vercel dev

# Netlify
npx netlify dev
```

Then open the printed local URL. With no `ANTHROPIC_API_KEY` set, the assistant replies
with the scripted fallback.

## Deployment

The repo is wired to auto-deploy on push:

- **Vercel** — detects `api/` as serverless functions automatically; no config needed.
- **Netlify** — uses `netlify.toml` (publish root + `/api/chat` → function redirect).

## Brand

Palette: aubergine `#47243D` · gold `#C6972F` · cream `#F5EFE6`. Serif display, sans body.
See `docs/CORNERSTONE.md` for the full vision and roadmap.

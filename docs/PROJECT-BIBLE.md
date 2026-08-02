# Hallelujah ONE — Project Bible

*Single source of truth for the Hallelujah ONE initiative. This document consolidates
the vision, model, roadmap, and open work into one place so the ministry team,
developers, and partners all work from the same page.*

> **How to read this doc:** Sections marked **Confirmed** reflect decisions already made
> or assets that already exist. Sections marked **Target** or **Draft** are working
> assumptions that need real numbers or a decision before they go to partners. Don't
> present a Target figure as fact without confirming it first.

---

## 1. Vision

**We do not build buildings. We build belonging.**

Hallelujah ONE unites ministry, capital strategy, and technical precision into a single
engine for community wealth in St. Petersburg's Historic Gas Plant District. Every asset
we steward — housing, infrastructure, financial guidance — is designed to return
ownership, dignity, and durable partnership to the families with the deepest roots in
the neighborhood.

Three operating principles:

| Principle | What it means in practice |
|-----------|---------------------------|
| **Dignity** | A high-end, warm regional aesthetic in every space and every digital touchpoint. |
| **Capital** | Layered, mission-aligned funding — nonprofit, community lending, and patient investment. |
| **Impact** | Outcomes measured in families and equity, not square footage. |

---

## 2. Operating System — The Living Compass™

Every initiative moves through the same five-step loop. Use it to keep work from drifting.

1. **Observe** — Gather ground truth (community need, market data, partner signals).
2. **Imagine** — Design the intervention and the experience.
3. **Build** — Ship the smallest real version.
4. **Measure** — Track the outcome against the family-level goal.
5. **Improve** — Feed learning back in and repeat.

Supporting discipline — **No-Drift Loop:** Intelligence → Action → Feedback → Optimization.
If a task can't be traced to a step in the Compass, it's drift — cut it or reframe it.

---

## 3. The Model — Four Connected Engines

The engines reinforce each other. Infrastructure revenue and community lending fund
housing; counseling converts housing into ownership; the nonprofit makes the whole model
fundable.

| # | Engine | Description | Status |
|---|--------|-------------|--------|
| A | **Housing & Ownership** | Acquire and steward multi-family assets, starting with a 4-plex, that build equity for resident families. | Target |
| B | **Charging Infrastructure** | EV / Tesla Supercharger capacity as a revenue anchor and a forward-looking signal for the district. | Draft — feasibility needed |
| C | **Financial Empowerment** | NACA-certified homeownership counseling that turns renters into owners. | Target — certification pending |
| D | **Institutional Backbone** | A 501(c)(3) nonprofit (IRS Form 1023) plus lending partnerships (FCLF) that make everything fundable. | In progress |

---

## 4. Capital Strategy

Sequenced to de-risk each phase. **The backbone comes first** because it unlocks the
cheaper, mission-aligned capital that funds everything after.

- **Phase 1 — Foundation:** Establish the 501(c)(3), open counseling certification,
  secure lending relationships (FCLF).
- **Phase 2 — First Assets:** Acquire the initial 4-plex; site the first charging
  infrastructure as proof of model.
- **Phase 3 — Scale:** Reinvest returns into additional units and district partnerships
  to compound community equity.

> **Open item:** No dollar targets are recorded yet. Add confirmed figures per phase
> before this goes into any investor package.

---

## 5. Roadmap & Execution Board

Drawn from the tactical checklist. Owners are placeholders — assign real names.

| Priority | Artifact / Action | Horizon | Owner | Status |
|----------|-------------------|---------|-------|--------|
| 1 | Monday stakeholder presentation | Done | — | ✅ Delivered (`Hallelujah-ONE-Monday-Briefing.pptx`) |
| 2 | File IRS Form 1023 (501c3) | This week | TBD | ⏳ Pending |
| 3 | Begin NACA counseling certification | This week | TBD | ⏳ Pending |
| 4 | Open FCLF Florida lending contact | This week | TBD | ⏳ Pending |
| 5 | Tesla Supercharger feasibility & siting | This quarter | TBD | ⏳ Pending |
| 6 | First 4-plex acquisition | 12–18 months | TBD | ⏳ Pending |
| 7 | Gas Plant District alignment | Ongoing | TBD | 🟢 Positioned & active |

---

## 6. Technical Blueprint — The Web Presence

### What exists today
- `src/lib/chatWidget.js` — a reusable, accessible, non-streaming chat-widget engine
  intended to power Hallelujah Ministries assistants. It renders messages safely
  (no HTML injection), caps history, handles timeouts, and exposes a small API.
  It expects a `POST /api/chat` endpoint returning `{ text }`.

### What's needed for an MVP site
1. **Landing page (`index.html`)** — mounts the chat widget, presents the vision,
   the four engines, and a clear call to partner. Warm, high-end aesthetic matching
   the deck palette (deep aubergine `#47243D`, warm gold `#C6972F`, cream `#F5EFE6`).
2. **Widget host markup** — the container elements the widget queries for
   (`[data-chat-body]`, `[data-chat-input]`, `[data-chat-send]`) plus styles for
   `.msg`, `.typing-dot`, etc.
3. **`/api/chat` backend** — a small server function that forwards messages to a
   Claude model and returns `{ text }`. (Not yet built.)
4. **Deploy target** — static host for the page; serverless function for the endpoint.

### Suggested first developer tasks
- [x] Add `index.html` with the widget container and brand styling.
- [x] Extract shared CSS into `src/styles/site.css`.
- [x] Stub `/api/chat` so the widget works end-to-end (scripted fallback with no key).
- [x] Wire the real Claude endpoint behind an env-var API key (`ANTHROPIC_API_KEY`,
      optional `ANTHROPIC_MODEL`; falls back to the scripted responder when unset).
- [x] Add a minimal README (`README.md`). *(No build script needed — the site is static.)*
- [x] Add a Netlify function + redirect (`netlify/functions/chat.js` + `netlify.toml`) so
      the assistant also responds on the Netlify preview, not just Vercel. Both platforms
      now share one implementation in `src/lib/chatCore.js`.

The landing page (`index.html` + `src/styles/site.css`) presents the vision, the four
engines, the roadmap, and a partnership CTA, and mounts the chat assistant as a floating
launcher. It was verified in a headless browser: page loads clean, widget mounts, greeting
renders, and a sent message round-trips through `/api/chat`.

---

## 7. Stakeholder Narrative (one paragraph)

*In the Historic Gas Plant District — land that was once a thriving Black community and
is now the site of a generational redevelopment — Hallelujah ONE is building the
institutions that keep ownership and wealth in local hands. We combine a faith-rooted
mission with rigorous capital strategy: a nonprofit backbone, community lending, EV
infrastructure revenue, and homeownership counseling that turns renters into owners.
We're inviting capital partners, civic allies, and advisors to build it with us.*

---

## 8. Things To Verify Before External Use

- [ ] Gas Plant District acreage figure (deck cites ~86 acres — confirm current source).
- [ ] Per-phase capital targets (currently none recorded).
- [ ] Real owner names for every roadmap row.
- [ ] Any impact numbers before they appear in a partner deck.

---

*Maintained on branch `claude/hallelujah-one-framework-yoxldg`. Update this file as the
single source of truth — decisions live here, not in scattered chats.*

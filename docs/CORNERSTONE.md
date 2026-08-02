# Hallelujah ONE — The Cornerstone

*The foundational document and single source of truth for the Hallelujah ONE initiative.
This document consolidates
the vision, model, roadmap, and open work into one place so the ministry team,
developers, and partners all work from the same page.*

> **How to read this doc:** Sections marked **Confirmed** reflect decisions already made
> or assets that already exist. Sections marked **Target** or **Draft** are working
> assumptions that need real numbers or a decision before they go to partners. Don't
> present a Target figure as fact without confirming it first.
>
> **Companion:** The canonical operating doctrine (Master Superpower Prompt v3.1) lives
> verbatim in [`MASTER-PROMPT.md`](./MASTER-PROMPT.md). This Cornerstone is the working
> expansion of it.

---

## 0. The Doctrine

> "Hallelujah Ministries is a permanent institution empowering individuals and families
> through education, career development, technology, and community support — creating
> generational sovereignty, not temporary assistance."

**Brand promise:** "Helping people discover their strengths, develop skills, and navigate
the future with confidence — for generations."

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

## 3. The Model — Six Pillars

The authoritative program model is six branded pillars. Each turns a starting condition
into lasting capability.

| Pillar | Focus |
|--------|-------|
| **Career Launch™** | Skills → Employment |
| **Housing Stability™** | Shelter → Foundation |
| **Financial Empowerment™** | Knowledge → Ownership |
| **AI Skills Academy™** | Learn → Lead |
| **Community Impact Network™** | Connection → Growth |
| **Entrepreneur & Ownership Pathways™** | Create → Own |

> **Site-alignment note:** The live landing page currently presents an earlier
> four-engine framing (Housing, Charging Infrastructure, Financial Empowerment,
> Institutional Backbone). Updating the page to these Six Pillars is a tracked
> alignment task (see §9).

### Institutional anchors

| Element | Detail |
|---------|--------|
| Legal | 508(c)(1)(A) Ministry + Wyoming Trust |
| Physical | 3548 5th Ave S., St. Petersburg, FL |
| Context | Historic Gas Plant District ($8.1B transformation) |

### Fleet

| Phase | Vehicle | Timeline |
|-------|---------|----------|
| 0 | Tesla 3 / Y / S / X | Now |
| 1 | Zoox Robotaxi | 6–12 mo |
| 2 | Tesla Cybercab | 12–24 mo |
| 3 | Cybertruck | Phased |

### Infrastructure

- **Superchargers** (4 stalls): ~$180K capex · target revenue ~$272K/year
  (model it live in the [Supercharger ROI calculator](../supercharger.html)).
- **Solar:** Tesla Solar Roof + Powerwalls + SPAN Panel.
- **Water:** Altitude Water Machines.
- **Food:** Green Roof + Micro-Gardening.

### NACA 4-plex strategy

| Element | Detail |
|---------|--------|
| Terms | 0% down, 0 closing costs, no PMI, below-market fixed rate |
| Path | NACA Affiliate → key leader purchase → Ministry lease |
| Loan limit | Up to ~$1.47M for a 4-unit (Pinellas) |

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

> **Open item:** Per-phase dollar targets are still not locked. The infrastructure and
> NACA figures above are the ministry's stated numbers — confirm them against quotes
> before any investor package.

### Funding matrix

| Source | Potential | Status |
|--------|-----------|--------|
| Federal ITC (Direct Pay) | 30% of solar / storage | Active |
| USDA REAP | Up to $500k | Paused — monitor |
| EPA EJ Grants | $500k | Active |
| St. Pete Urban Ag | $150k | Active |
| Duke Energy Credits | One-time + off-peak | Active |
| FCLF | Florida CDFI financing | Active |

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
- `index.html` + `src/styles/site.css` — the live landing page.
- `src/lib/chatWidget.js` — a reusable, accessible, non-streaming chat-widget engine
  intended to power Hallelujah Ministries assistants. It renders messages safely
  (no HTML injection), caps history, handles timeouts, and exposes a small API.
  It expects a `POST /api/chat` endpoint returning `{ text }`.
- `api/chat.js` + `netlify/functions/chat.js` — the assistant endpoint (real Claude
  when `ANTHROPIC_API_KEY` is set, scripted fallback otherwise).
- `supercharger.html` + `src/lib/superchargerModel.js` — an interactive ROI calculator
  for the 3548 5th Ave S charging site: editable assumptions with live payback, NPV,
  net operating income, and margin. **Figures are illustrative — replace the default
  assumptions with quoted numbers before using the output externally.**

### What's needed for an MVP site
1. **Landing page (`index.html`)** — mounts the chat widget, presents the vision,
   the model, and a clear call to partner. **Design-system note:** the page and deck
   currently use working values (aubergine `#47243D`, gold `#C6972F`, cream `#F5EFE6`,
   Georgia/system fonts). The official *Sanctuary Premium* system is aubergine `#2D1B3D`,
   gold `#D4A72C`, cream `#FAF7F0`, **Fraunces** headings + **Inter** body — aligning to
   it is a tracked task (see §9).
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

## 8. Monday Narrative & Trust Filter

**7-shot narrative** (see [`MASTER-PROMPT.md`](./MASTER-PROMPT.md) for the full beat sheet):
The Arrival → The Approach → The Heart → The Innovation → The Garden → The People → The Vision.

**Close:** *"We are not asking you to fund a building. We are asking you to invest in a
model — one that proves faith, technology, and community are the same force."*

**Trust filter** — build only when every answer is yes; otherwise redesign: increases human
capability? · protects dignity? · creates independence? · measurable impact? · proudly
explainable? · strengthens the institution for the next generation?

---

## 9. Things To Verify / Align Before External Use

**Verify (don't present as fact until confirmed):**
- [ ] Gas Plant District figures (deck cites ~86 acres; doctrine cites $8.1B transformation) — confirm sources.
- [ ] Supercharger economics (~$180K capex, ~$272K/yr revenue) against real quotes + a utilization study.
- [ ] NACA loan limit (~$1.47M, Pinellas 4-unit) and current program terms.
- [ ] Funding-matrix amounts and statuses (esp. USDA REAP "paused").
- [ ] Real owner names for every roadmap row.

**Align (tracked build tasks):**
- [ ] Update the site + deck to the official *Sanctuary Premium* palette and Fraunces/Inter fonts.
- [ ] Reframe the landing page's model section from four engines to the **Six Pillars**.
- [ ] Add solar + NACA 4-plex tabs to the Supercharger ROI calculator.

---

*Maintained on branch `claude/hallelujah-one-framework-yoxldg`. Update this file as the
single source of truth — decisions live here, not in scattered chats.*

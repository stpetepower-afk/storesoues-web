/**
 * Hallelujah ONE™ — Command Center Dashboard · renderer (v1.0)
 *
 * Renders all five modules from data.js. Vanilla JS, no build step, so it runs
 * as static files on Netlify and locally alike. All data-derived strings go
 * through the DOM (textContent / createElement), never innerHTML, so nothing in
 * the data can inject markup.
 */

import { data } from "./data.js";

/* ---- tiny DOM helpers ------------------------------------------------ */
function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null) continue;
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else if (k.startsWith("aria") || k === "role") node.setAttribute(k, v);
    else if (k === "dataset") Object.assign(node.dataset, v);
    else node.setAttribute(k, v);
  }
  for (const c of [].concat(children)) {
    if (c == null) continue;
    node.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return node;
}
const fmtMoney = (n) => "$" + n.toLocaleString("en-US");
const pct = (n, d) => Math.round((n / d) * 100);

function daysUntil(isoDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(isoDate + "T00:00:00");
  return Math.round((target - today) / 86400000);
}

function statusClass(status) {
  const s = status.toLowerCase();
  if (s.includes("award") || s.includes("active")) return "status--active";
  if (s.includes("submit")) return "status--submitted";
  if (s.includes("progress")) return "status--progress";
  if (s.includes("draft")) return "status--drafting";
  if (s.includes("identif") || s.includes("opportunity")) return "status--identified";
  return "status--outreach";
}
const badge = (status) => el("span", { class: `status ${statusClass(status)}`, text: status });

function bar(value, max, variant = "") {
  const p = Math.max(0, Math.min(100, pct(value, max)));
  return el("div", { class: "bar", role: "progressbar", "aria-valuenow": String(p), "aria-valuemin": "0", "aria-valuemax": "100" }, [
    el("div", { class: `bar__fill ${variant}`, style: `width:${p}%` }),
  ]);
}

/* ---- Module 1: Executive briefing ----------------------------------- */
function renderBriefing() {
  const list = el("ul", { class: "briefing__list" },
    data.briefing.map((b) =>
      el("li", { class: "briefing__item" }, [el("span", { "aria-hidden": "true", text: b.icon }), b.text])
    )
  );
  return el("section", { class: "module", "aria-labelledby": "m1" }, [
    el("div", { class: "briefing" }, [
      el("div", { class: "briefing__title", id: "m1" }, [el("span", { "aria-hidden": "true", text: "🧠" }), "AI Chief of Staff — Daily Briefing"]),
      el("p", { class: "briefing__quote", text: `Good morning ${data.meta.principal}. Here is today's briefing.` }),
      list,
      el("div", { class: "briefing__alert" }, [el("span", { "aria-hidden": "true", text: "⚡" }), data.briefing_alert.text]),
    ]),
  ]);
}

/* ---- Module 5: Countdown (rendered near the top for visibility) ------ */
function renderCountdowns() {
  const cards = data.deadlines.map((d) => {
    const left = daysUntil(d.deadline);
    const urgent = left <= 30;
    const elapsed = Math.max(0, Math.min(100, pct(d.window - left, d.window)));
    return el("div", { class: `countdown ${urgent ? "countdown--urgent" : ""}` }, [
      el("div", { class: "countdown__name", text: d.name }),
      el("div", { class: "countdown__days" }, [
        el("span", { class: "countdown__num", text: String(Math.max(0, left)) }),
        el("span", { class: "countdown__unit", text: "days remaining" }),
      ]),
      el("div", { class: "bar" }, [el("div", { class: `bar__fill ${urgent ? "" : "bar__fill--green"}`, style: `width:${elapsed}%` })]),
      el("div", { class: "countdown__action", text: `Next: ${d.action}` }),
    ]);
  });
  return module("05", "Deadline Countdown", null, el("div", { class: "countdowns" }, cards));
}

/* ---- Module 2: Capital War Room ------------------------------------- */
function renderWarRoom() {
  const total = data.war_room_targets.reduce((s, t) => s + t.amount, 0);
  const filters = el("div", { class: "filters", role: "group", "aria-label": "Filter by status" });
  const tbody = el("tbody");

  function draw(active) {
    tbody.replaceChildren();
    data.war_room_targets
      .filter((t) => active === "All" || t.status === active)
      .forEach((t) => {
        const left = daysUntil(t.deadline);
        tbody.append(el("tr", {}, [
          el("td", { class: "table__funder" }, [t.funder, el("div", { class: "table__action", text: t.opportunity })]),
          el("td", { class: "table__amount", text: fmtMoney(t.amount) }),
          el("td", {}, [badge(t.status)]),
          el("td", { class: left <= 14 && left >= 0 ? "deadline-soon" : "" , text: `${t.deadline}${left >= 0 ? ` · ${left}d` : ""}` }),
          el("td", { class: "table__action", text: t.next_action }),
        ]));
      });
  }

  const statuses = ["All", ...new Set(data.war_room_targets.map((t) => t.status))];
  statuses.forEach((s, i) => {
    const chip = el("button", { class: "chip", type: "button", "aria-pressed": String(i === 0), text: s });
    chip.addEventListener("click", () => {
      filters.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", "false"));
      chip.setAttribute("aria-pressed", "true");
      draw(s);
    });
    filters.append(chip);
  });
  draw("All");

  const table = el("div", { class: "table-wrap" }, [
    el("table", { class: "table" }, [
      el("thead", {}, [el("tr", {}, ["Funder / Opportunity", "Target", "Status", "Deadline", "Next Action"].map((h) => el("th", { text: h })))]),
      tbody,
    ]),
  ]);
  return module("02", "Capital War Room", `${data.war_room_targets.length} targets · ${fmtMoney(total)} pipeline`, [filters, table]);
}

/* ---- Module 3: Partner CRM ------------------------------------------ */
const SECTOR_ICON = { Government: "🏛️", Healthcare: "🏥", Corporate: "🏢", Technology: "💻", Community: "🤝", Workforce: "📚" };
function renderPartners() {
  const bySector = {};
  data.partners.forEach((p) => (bySector[p.sector] ||= []).push(p));
  const sectors = Object.entries(bySector).map(([sector, list]) =>
    el("div", { class: "sector" }, [
      el("div", { class: "sector__head" }, [
        el("span", { "aria-hidden": "true", text: SECTOR_ICON[sector] || "•" }),
        sector,
        el("span", { class: "sector__count", text: `${list.length}` }),
      ]),
      el("div", { class: "partner-grid" }, list.map((p) =>
        el("div", { class: "partner" }, [
          el("div", { class: "partner__name", text: p.name }),
          el("div", { class: "partner__contact", text: p.contact }),
          badge(p.status),
        ])
      )),
    ])
  );
  return module("03", "Partner CRM & Outreach", `${data.partners.length} relationships`, el("div", { class: "module", style: "gap:var(--space-5)" }, sectors));
}

/* ---- Module 4: Impact & operations ---------------------------------- */
function renderImpact() {
  const m = data.impact_metrics;
  const stat = (label, icon, value, sub, barNode) =>
    el("div", { class: "stat" }, [
      el("div", { class: "stat__label" }, [el("span", { "aria-hidden": "true", text: icon }), label]),
      el("div", { class: "stat__value" }, value),
      barNode || null,
      sub ? el("div", { class: "stat__sub", text: sub }) : null,
    ]);

  const cards = [
    stat("Mac House — Active Residents", "🏠", [String(m.mac_house.active_residents), el("small", { text: ` / ${m.mac_house.capacity} beds` })],
      `${m.mac_house.stability_rate}% housing stability`, bar(m.mac_house.stability_rate, 100, "bar__fill--green")),
    stat("Workforce — Certifications", "📚", [String(m.workforce.certifications), el("small", { text: ` / ${m.workforce.cert_target}` })],
      `${m.workforce.active_paths} active training paths`, bar(m.workforce.certifications, m.workforce.cert_target, "bar__fill--blue")),
    stat("Mobility — Total Trips", "🚐", String(m.mobility.total_trips),
      `Fleet ${m.mobility.fleet_status} · ${m.mobility.fleet_uptime}% uptime`, bar(m.mobility.fleet_uptime, 100, "bar__fill--green")),
    stat("H3O™ — Monthly Revenue", "🌱", fmtMoney(m.h3o.revenue),
      `${m.h3o.units} / ${m.h3o.unit_target} units produced`, bar(m.h3o.units, m.h3o.unit_target)),
  ];
  return module("04", "Impact & Operations Metrics", "Live", el("div", { class: "stat-grid" }, cards));
}

/* ---- module shell ---------------------------------------------------- */
let moduleSeq = 0;
function module(num, title, meta, body) {
  const id = `mod-${++moduleSeq}`;
  return el("section", { class: "module", "aria-labelledby": id }, [
    el("div", { class: "module__head" }, [
      el("span", { class: "module__eyebrow", text: `Module ${num}` }),
      el("h2", { id, text: title }),
      meta ? el("span", { class: "module__meta", text: meta }) : null,
    ]),
    ...[].concat(body),
  ]);
}

/* ---- top bar clock --------------------------------------------------- */
function startClock(node) {
  const tick = () => {
    node.textContent = new Date().toLocaleString("en-US", {
      weekday: "short", month: "short", day: "numeric",
      hour: "numeric", minute: "2-digit",
    });
  };
  tick();
  setInterval(tick, 30000);
}

/* ---- mount ----------------------------------------------------------- */
export function mountDashboard(root) {
  const main = root.querySelector("[data-dash-main]");
  main.append(
    renderBriefing(),
    renderCountdowns(),
    renderImpact(),
    renderWarRoom(),
    renderPartners(),
  );
  const clock = root.querySelector("[data-dash-clock]");
  if (clock) startClock(clock);
}

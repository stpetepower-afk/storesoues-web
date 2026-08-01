/**
 * Hallelujah ONE™ — iPad Presentation Mode · renderer
 *
 * Builds a fullscreen, touch-driven slide deck from the same data the live
 * dashboard uses (dashboard/data.js), so the boardroom deck never drifts from
 * the numbers. Navigation: swipe, arrow keys / space, tap zones, on-screen
 * controls, and progress dots. Vanilla JS; all data escaped via the DOM.
 */

import { data } from "../dashboard/data.js";

/* ---- tiny DOM helper ------------------------------------------------- */
function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null) continue;
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else node.setAttribute(k, v);
  }
  for (const c of [].concat(children)) {
    if (c == null) continue;
    node.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return node;
}
const money = (n) => "$" + n.toLocaleString("en-US");
function daysUntil(iso) {
  const t = new Date(); t.setHours(0, 0, 0, 0);
  return Math.round((new Date(iso + "T00:00:00") - t) / 86400000);
}

/* ---- slide builders -------------------------------------------------- */
function slideTitle() {
  return [
    el("p", { class: "slide__eyebrow", text: "Hallelujah ONE™ · Command Center" }),
    el("h1", { text: "One verifiable operating system." }),
    el("p", { class: "slide__lead", text: "Housing, mobility, workforce, and technology — connected into a single, measurable operating model for St. Petersburg." }),
  ];
}

function slideTriad() {
  const items = [
    ["01", "Digital Twin", "The immersive, scalable future of St. Petersburg."],
    ["02", "Command Center", "Live operational control across every pillar."],
    ["03", "Apple Ecosystem", "MacBook to build, iPad for the boardroom, Mac Mini in reserve."],
  ];
  return [
    el("p", { class: "slide__eyebrow", text: "The Triad" }),
    el("h2", { text: "Engineered infrastructure, not a concept." }),
    el("div", { class: "deck-triad" }, items.map(([n, t, d]) =>
      el("div", { class: "deck-triad__item" }, [
        el("div", { class: "deck-triad__num", text: n }),
        el("div", { class: "deck-triad__title", text: t }),
        el("div", { class: "deck-triad__desc", text: d }),
      ])
    )),
  ];
}

function statTile(value, sub, label) {
  return el("div", { class: "deck-stat" }, [
    el("div", { class: "deck-stat__value" }, [value, sub ? el("small", { text: " " + sub }) : null]),
    el("div", { class: "deck-stat__label", text: label }),
  ]);
}

function slideImpact() {
  const m = data.impact_metrics;
  return [
    el("p", { class: "slide__eyebrow", text: "Impact & Operations · Live" }),
    el("h2", { text: "Proof, in real time." }),
    el("div", { class: "deck-stats" }, [
      statTile(String(m.mac_house.active_residents), "residents", `Housed · ${m.mac_house.stability_rate}% stability`),
      statTile(String(m.workforce.certifications), `/ ${m.workforce.cert_target}`, "Certifications earned"),
      statTile(String(m.mobility.total_trips), "trips", `Fleet ${m.mobility.fleet_status}`),
      statTile(money(m.h3o.revenue), null, `H3O™ · ${m.h3o.units} units`),
    ]),
  ];
}

function slideHousing() {
  const hs = data.housing_stability;
  const col = (title, badge, metrics) =>
    el("div", {}, [
      el("div", { class: "deck-col__head" }, [title, el("span", { class: `badge ${badge}` , text: title.includes("HUD") ? "Reporting-ready" : "Deeper outcomes" })]),
      ...metrics.slice(0, 5).map((x) =>
        el("div", { class: "deck-metric" }, [
          el("span", { class: "deck-metric__label", text: x.label }),
          el("span", { class: "deck-metric__value", text: x.value }),
        ])
      ),
    ]);
  return [
    el("p", { class: "slide__eyebrow", text: "Community Impact Layer" }),
    el("h2", { text: "One system. Both audiences." }),
    el("div", { class: "deck-cols" }, [
      col("HUD / CoC-facing", "badge--blue", hs.hud_facing),
      col("Internal impact", "badge--accent", hs.internal),
    ]),
  ];
}

function slideCapital() {
  const total = data.war_room_targets.reduce((s, t) => s + t.amount, 0);
  const top = [...data.war_room_targets].sort((a, b) => b.amount - a.amount).slice(0, 5);
  return [
    el("p", { class: "slide__eyebrow", text: "Capital War Room" }),
    el("h2", { text: `${money(total)} in the pipeline.` }),
    el("div", { class: "deck-cols" }, [
      el("div", {}, [
        el("div", { class: "deck-col__head", text: `${data.war_room_targets.length} scored targets` }),
        ...top.map((t) =>
          el("div", { class: "deck-metric" }, [
            el("span", { class: "deck-metric__label", text: `${t.funder} — ${t.opportunity}` }),
            el("span", { class: "deck-metric__value", text: money(t.amount) }),
          ])
        ),
      ]),
      el("div", {}, [
        el("div", { class: "deck-col__head", text: "Nearest deadlines" }),
        ...[...data.war_room_targets]
          .map((t) => ({ ...t, left: daysUntil(t.deadline) }))
          .filter((t) => t.left >= 0)
          .sort((a, b) => a.left - b.left)
          .slice(0, 5)
          .map((t) =>
            el("div", { class: "deck-metric" }, [
              el("span", { class: "deck-metric__label", text: `${t.funder} — ${t.opportunity}` }),
              el("span", { class: "deck-metric__value", text: `${t.left}d` }),
            ])
          ),
      ]),
    ]),
  ];
}

function slideDeadlines() {
  return [
    el("p", { class: "slide__eyebrow", text: "Deadline Countdown" }),
    el("h2", { text: "The clock is running." }),
    el("div", { class: "deck-countdowns" }, data.deadlines.map((d) => {
      const left = Math.max(0, daysUntil(d.deadline));
      const urgent = left <= 30;
      return el("div", { class: `deck-cd ${urgent ? "deck-cd--urgent" : ""}` }, [
        el("div", { class: "deck-cd__name", text: d.name }),
        el("div", { class: "deck-cd__num", text: String(left) }),
        el("div", { class: "deck-cd__unit", text: "days remaining" }),
        el("div", { class: "deck-cd__action", text: `Next: ${d.action}` }),
      ]);
    })),
  ];
}

function slideAsk() {
  return {
    extraClass: "slide--quote",
    nodes: [
      el("p", { class: "slide__eyebrow", text: "The Invitation" }),
      el("blockquote", { class: "deck-quote" }, [
        "We aren’t just pitching an idea — we’ve engineered the infrastructure. Be a strategic activation partner.",
        el("cite", { text: "Hallelujah ONE™ · Seed → Scale → National Expansion" }),
      ]),
    ],
  };
}

/* ---- deck engine ----------------------------------------------------- */
const builders = [slideTitle, slideTriad, slideImpact, slideHousing, slideCapital, slideDeadlines, slideAsk];

export function mountDeck(root) {
  const stage = root.querySelector("[data-deck-stage]");
  const dotsWrap = root.querySelector("[data-deck-dots]");
  const counter = root.querySelector("[data-deck-counter]");
  const prevBtn = root.querySelector("[data-deck-prev]");
  const nextBtn = root.querySelector("[data-deck-next]");
  const fsBtn = root.querySelector("[data-deck-fs]");
  const hint = root.querySelector("[data-deck-hint]");

  const slides = builders.map((b) => {
    const out = b();
    const built = Array.isArray(out) ? { nodes: out, extraClass: "" } : out;
    const s = el("section", { class: `slide ${built.extraClass}`.trim() });
    s.append(...built.nodes);
    stage.append(s);
    return s;
  });

  const dots = slides.map((_, i) => {
    const d = el("button", { class: "deck__dot", type: "button", "aria-label": `Go to slide ${i + 1}` });
    d.addEventListener("click", () => go(i));
    dotsWrap.append(d);
    return d;
  });

  let idx = 0;
  const total = slides.length;

  function render() {
    slides.forEach((s, i) => {
      s.classList.toggle("is-active", i === idx);
      s.classList.toggle("is-past", i < idx);
    });
    dots.forEach((d, i) => d.classList.toggle("is-active", i === idx));
    counter.textContent = `${idx + 1} / ${total}`;
    prevBtn.disabled = idx === 0;
    nextBtn.disabled = idx === total - 1;
  }
  function go(n) {
    idx = Math.max(0, Math.min(total - 1, n));
    render();
    if (hint) hint.classList.add("is-hidden");
  }
  const next = () => go(idx + 1);
  const prev = () => go(idx - 1);

  prevBtn.addEventListener("click", prev);
  nextBtn.addEventListener("click", next);
  root.querySelector("[data-deck-tapprev]").addEventListener("click", prev);
  root.querySelector("[data-deck-tapnext]").addEventListener("click", next);

  // Keyboard
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") { e.preventDefault(); next(); }
    else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); prev(); }
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(total - 1);
    else if (e.key.toLowerCase() === "f") toggleFs();
  });

  // Touch swipe
  let startX = null, startY = null;
  stage.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX; startY = e.touches[0].clientY;
  }, { passive: true });
  stage.addEventListener("touchend", (e) => {
    if (startX == null) return;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) (dx < 0 ? next() : prev());
    startX = startY = null;
  }, { passive: true });

  // Fullscreen
  function toggleFs() {
    const d = document;
    if (!d.fullscreenElement) (root.requestFullscreen && root.requestFullscreen());
    else (d.exitFullscreen && d.exitFullscreen());
  }
  if (fsBtn) fsBtn.addEventListener("click", toggleFs);

  render();
}

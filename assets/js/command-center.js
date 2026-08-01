/* =============================================================
   HALLELUJAH ONE™ — Command Center v2.0
   Lunar Intelligence · Cyber-Kinetic Edition
   ============================================================= */
import { createChatWidget } from "/src/lib/chatWidget.js";

/* ---------------- Lunar phase engine (real, from today) ---------------- */
var SYNODIC = 29.530588853;
var PHASES = [
  { name: "New Moon", emoji: "🌑", energy: "BEGINNING", best: "Starting projects, planting seeds" },
  { name: "Waxing Crescent", emoji: "🌒", energy: "BUILD UP", best: "Development, preparation" },
  { name: "First Quarter", emoji: "🌓", energy: "ACTION", best: "Making decisions, taking risks" },
  { name: "Waxing Gibbous", emoji: "🌔", energy: "EXPANSION", best: "Growth, partnership cultivation" },
  { name: "Full Moon", emoji: "🌕", energy: "COMPLETION", best: "Closing deals, celebrating" },
  { name: "Waning Gibbous", emoji: "🌖", energy: "DISTRIBUTION", best: "Sharing, teaching, giving" },
  { name: "Last Quarter", emoji: "🌗", energy: "REFLECTION", best: "Reviewing, refining" },
  { name: "Waning Crescent", emoji: "🌘", energy: "RELEASE", best: "Letting go, preparing" }
];
function moonPhase(date) {
  var ref = Date.UTC(2000, 0, 6, 18, 14, 0); // known new moon
  var days = (date.getTime() - ref) / 86400000;
  var age = days % SYNODIC; if (age < 0) age += SYNODIC;
  var frac = age / SYNODIC;                       // 0..1 through the cycle
  var illum = (1 - Math.cos(2 * Math.PI * frac)) / 2; // 0 new → 1 full
  var idx = Math.floor(frac * 8 + 0.5) % 8;
  var waxing = frac < 0.5;
  return Object.assign({}, PHASES[idx], {
    age: age, illum: illum, waxing: waxing,
    day: Math.round(age * 10) / 10, cycle: Math.round(SYNODIC * 10) / 10
  });
}

/* ---------------- 13-month calendar ---------------- */
var MONTHS = [
  ["AWAKENING", "🌱", "Vision setting"], ["FORMATION", "🌿", "Structure building"],
  ["ALIGNMENT", "🌳", "Partnership cultivation"], ["EXPANSION", "🌊", "Growth phase"],
  ["GROWTH", "🔥", "Execution"], ["HARVEST", "🌾", "Outcome realization"],
  ["REFLECTION", "🌙", "Evaluation"], ["RENEWAL", "✨", "Reset"],
  ["CULTIVATION", "🌻", "Deepening"], ["ABUNDANCE", "💎", "Scaling"],
  ["COMPLETION", "🏁", "Closing cycles"], ["TRANSITION", "🧭", "Preparation"],
  ["REBIRTH", "🐣", "New beginning"]
];
var CURRENT_MONTH = 5; // Month 5 — GROWTH (configurable cycle position)

/* ---------------- Mock operating data (illustrative demo) ---------------- */
var DATA = {
  metrics: {
    mac_house: { active: 37, stability: "82%", fill: 82, note: "LIFE_PATH: 12 ACTIVE // 4 READY FOR EXIT" },
    mobility: { trips: 540, fill: 100, note: "WAVEFORM: ▁▂▃▄▅▆▇█▇▆▅▄▃▂▁" },
    workforce: { active_paths: 24, certs: 16, fill: 65, note: "FLOW_STATE: ████████░░ 82% OPTIMAL" },
    h3o: { revenue: "$8,420", units: 312, fill: 90, note: "REVENUE_WAVE: 📈 +22% MOMENTUM" }
  },
  deadlines: [
    { id: 1, name: "HUD CoC FY2026", action: "Submit full application", days_left: 26 },
    { id: 2, name: "BayCare Wellness Grant", action: "Letter of intent due", days_left: 12 },
    { id: 3, name: "City of St. Pete ARPA", action: "Budget narrative", days_left: 34 }
  ],
  war_room_targets: [
    { id: 1, funder: "HUD Continuum of Care", opportunity: "Housing stabilization", amount: 900000, status: "IN PROGRESS", deadline: "Aug 27" },
    { id: 2, funder: "BayCare Health", opportunity: "Wellness integration", amount: 500000, status: "LOI SENT", deadline: "Aug 13" },
    { id: 3, funder: "Community Foundation TB", opportunity: "Capacity building", amount: 600000, status: "CULTIVATING", deadline: "Sep 30" },
    { id: 4, funder: "USF St Pete", opportunity: "Research & workforce", amount: 250000, status: "CULTIVATING", deadline: "Sep 15" },
    { id: 5, funder: "Urban League", opportunity: "Workforce pipeline", amount: 150000, status: "INTRO", deadline: "Oct 01" }
  ]
};

var ICON = {
  activity: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h4l3 8 4-16 3 8h4"/></svg>',
  radio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="2"/><path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 16.2a6 6 0 0 0 0-8.4M5 5a10 10 0 0 0 0 14M19 19a10 10 0 0 0 0-14"/></svg>',
  layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/></svg>',
  trending: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 17 6-6 4 4 8-8"/><path d="M17 7h4v4"/></svg>'
};

var mode = "demo";
var el = document.querySelector.bind(document);

/* ---------------- Renderers ---------------- */
function val(demoVal) { return mode === "demo" ? demoVal : "—"; }

function renderKPIs() {
  var m = DATA.metrics;
  var live = mode === "live";
  var cards = [
    { cap: "MAC_HOUSE_CORE", ico: ICON.activity, ping: true, big: m.mac_house.active, unit: "RESIDENTS",
      rk: "STABILITY_INDEX", rv: m.mac_house.stability, cls: "c", fill: m.mac_house.fill, note: m.mac_house.note },
    { cap: "MOBILITY_FLEET", ico: ICON.radio, big: m.mobility.trips, unit: "TRIPS",
      rk: "FLEET_STATUS", rv: '<span class="ok">● ONLINE</span>', cls: "g", fill: m.mobility.fill, note: m.mobility.note },
    { cap: "AI_ACADEMY", ico: ICON.layers, big: m.workforce.active_paths, unit: "PATHS",
      rk: "CERTS_IN_FLIGHT", rv: '<span class="hot">' + m.workforce.certs + " ACTIVE</span>", cls: "m", fill: m.workforce.fill, note: m.workforce.note },
    { cap: "H3O_ENTERPRISE", ico: ICON.trending, big: m.h3o.revenue, unit: "REV",
      rk: "UNITS_YIELD", rv: "<b>" + m.h3o.units + " UNITS</b>", cls: "c", fill: m.h3o.fill, note: m.h3o.note }
  ];
  el("#kpis").innerHTML = cards.map(function (c) {
    var bigVal = live ? "—" : c.big;
    var rowVal = live ? '<span style="color:var(--gray)">awaiting source</span>' : c.rv;
    var fill = live ? 0 : c.fill;
    var note = live ? "SOURCE: AWAITING CONNECTION" : c.note;
    return (
      '<div class="panel kpi reveal in">' +
        '<div class="top"><span class="cap">' + c.cap + '</span>' +
          '<span class="ico">' + c.ico + (c.ping && !live ? '<span class="pinger"></span>' : "") + "</span></div>" +
        '<div class="big">' + bigVal + ' <small>' + c.unit + "</small></div>" +
        '<div class="row"><span>' + c.rk + "</span><span>" + rowVal + "</span></div>" +
        '<div class="track"><i class="' + c.cls + ' pulse" style="width:' + fill + '%"></i></div>' +
        '<div class="sub">' + note + "</div>" +
      "</div>"
    );
  }).join("");
}

function renderCalendar() {
  el("#calendar").innerHTML = MONTHS.slice(0, 7).map(function (mo, i) {
    var n = i + 1;
    var status = n < CURRENT_MONTH ? "complete" : n === CURRENT_MONTH ? "current" : "upcoming";
    var label = status === "current" ? "◉ CURRENT" : status;
    return (
      '<div class="cal-row ' + (status === "current" ? "current" : "") + '">' +
        "<span>" + mo[1] + " " + n + " — " + mo[0] + "</span>" +
        '<span class="st">' + label + "</span>" +
      "</div>"
    );
  }).join("");
}

function renderDeadlines() {
  el("#deadlines").innerHTML = DATA.deadlines.map(function (d) {
    return (
      '<div class="dl"><div><h4>' + d.name + "</h4><p>" + d.action + "</p></div>" +
      '<div class="days"><b>' + d.days_left + "</b><span>days</span></div></div>"
    );
  }).join("");
}

function renderWarRoom() {
  el("#warroom").innerHTML = DATA.war_room_targets.map(function (t) {
    var cls = /sent/i.test(t.status) ? "sent" : /progress/i.test(t.status) ? "progress" : "";
    var amt = mode === "demo" ? "$" + t.amount.toLocaleString() : "—";
    return (
      "<tr><td class=\"funder\">" + t.funder + "</td>" +
      "<td style=\"color:var(--gray)\">" + t.opportunity + "</td>" +
      "<td class=\"amt\">" + amt + "</td>" +
      "<td><span class=\"status " + cls + "\">" + t.status + "</span></td>" +
      "<td style=\"text-align:right;color:var(--gray)\">" + t.deadline + "</td></tr>"
    );
  }).join("");
}

function renderLunar() {
  var now = new Date();
  var p = moonPhase(now);
  var litPct = Math.round(p.illum * 100);
  var coc = DATA.deadlines[0].days_left;

  el("#lunar-badge").innerHTML =
    '<div class="lunar-orb"><div class="disc"><div class="lit" style="width:' + litPct + '%"></div></div></div>' +
    '<div><div class="k">Lunar Phase</div><div class="v">' + p.emoji + " " + p.name + '</div>' +
    '<div class="d">Cycle: Day ' + p.day + " of " + p.cycle + " · " + litPct + "% lit</div></div>";

  el("#coc-chip").textContent = "HUD_COC: " + coc + " DAYS";

  var ts = now.toISOString().slice(0, 10).replace(/-/g, ".");
  el("#chief-ts").textContent = "TIMESTAMP: " + ts + " // LUNAR_DAY_" + Math.round(p.age);

  el("#chief-stream").innerHTML =
    '"System nominal. Lunar cycle in <b>' + p.name + "</b> (" + p.energy.toLowerCase() +
    " phase). <b>HUD CoC FY2026</b> countdown active at " + coc +
    " days. Regional mobility and H3O™ enterprise nodes synchronized with " +
    (p.waxing ? "waxing" : "waning") + " energy — " +
    (p.waxing ? "favorable for expansion and partnership cultivation." : "a window for review, refinement, and release.") + '"';

  var mo = MONTHS[CURRENT_MONTH - 1];
  el("#chief-line").innerHTML =
    '<span>' + p.emoji + " " + p.name.toUpperCase() + " — " + p.energy + " PHASE</span>" +
    '<span class="sep">|</span>' +
    "<span>13-MONTH CALENDAR: MONTH " + CURRENT_MONTH + " — “" + mo[0] + "”</span>" +
    '<span class="sep">|</span>' +
    '<span class="flow">● FLOW STATE: OPTIMAL</span>';

  el("#insight-k").textContent = "LUNAR INSIGHT: " + (p.waxing ? "WAXING" : "WANING") + " — " + p.energy + " ENERGY";
  el("#insight-p").textContent = "Best for: " + p.best + ". " +
    (p.waxing ? "Build momentum toward the full moon." : "Consolidate and prepare for the next new moon.");

  el("#foot-phase").textContent = p.emoji + " " + p.name.toUpperCase();
  el("#foot-month").textContent = "13-MONTH CALENDAR: MONTH " + CURRENT_MONTH + " — " + mo[0];
}

/* ---------------- Mode switch ---------------- */
function setMode(next) {
  mode = next;
  document.querySelectorAll(".mode button").forEach(function (b) {
    b.classList.toggle("on", b.getAttribute("data-mode") === next);
  });
  var chip = document.querySelector(".chip.demo");
  if (chip) chip.firstChild && (chip.childNodes[chip.childNodes.length - 1].nodeValue = next === "demo" ? " DEMO_ENV" : " LIVE_ENV");
  renderKPIs();
  renderWarRoom();
}

/* ---------------- AI Chief of Staff (demo responder over the chat engine) ---------------- */
(function installDemoEndpoint() {
  var realFetch = window.fetch.bind(window);
  window.fetch = function (url, opts) {
    if (typeof url === "string" && url.indexOf("/api/chat") === 0) {
      var text = "";
      try { text = JSON.parse(opts.body).messages.slice(-1)[0].content.toLowerCase(); } catch (e) {}
      return Promise.resolve(new Response(JSON.stringify({ text: demoAnswer(text) }), {
        status: 200, headers: { "Content-Type": "application/json" }
      }));
    }
    return realFetch(url, opts);
  };
})();
function demoAnswer(q) {
  var p = moonPhase(new Date());
  if (/moon|lunar|phase|cycle|cosmic/.test(q))
    return "Current lunar phase: " + p.emoji + " " + p.name + " (" + p.energy.toLowerCase() + "). Best for: " + p.best + ".";
  if (/resident|stabil|housing|mac house|life path/.test(q))
    return "Mac House: 37 residents at 82% stability (illustrative). 12 on active life-paths, 4 ready for exit. Stabilization is the first step.";
  if (/revenue|money|enterprise|h3o|units/.test(q))
    return "H3O Enterprise: $8,420/mo revenue, 312 units, +22% momentum (illustrative). Earned income reduces grant dependence.";
  if (/fund|grant|pipeline|war room|capital|hud|baycare/.test(q))
    return "Capital war room: $2.4M target across 5 funders. Nearest deadline — HUD CoC FY2026 in 26 days. LOI to BayCare already sent.";
  if (/mobility|transport|fleet|trip|psta/.test(q))
    return "Mobility fleet: 540 trips, status ONLINE (illustrative). Access removes the biggest barrier between people and opportunity.";
  if (/train|academy|cert|workforce|path|career|job/.test(q))
    return "AI Academy: 24 active paths, 16 certifications in flight, flow state 82% optimal (illustrative).";
  if (/hello|hi|hey|help|what can|status/.test(q))
    return "Lunar node online. Ask me about residents, mobility, the AI Academy, H3O revenue, the funding war room, deadlines, or the current moon phase.";
  return "In demo mode I can brief you on residents, mobility, the AI Academy, H3O revenue, the funding war room, deadlines, and the live lunar phase. Live mode would draw from connected data sources.";
}

/* ---------------- Boot ---------------- */
function hideLoader() { var l = el("#loader"); if (l) setTimeout(function () { l.classList.add("done"); }, 500); }
if (document.readyState === "complete") hideLoader(); else window.addEventListener("load", hideLoader);

var io = "IntersectionObserver" in window
  ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold: 0.12 })
  : null;

renderLunar();
renderCalendar();
renderDeadlines();
setMode("demo");
document.querySelectorAll(".reveal").forEach(function (n) { io ? io.observe(n) : n.classList.add("in"); });
document.querySelectorAll(".mode button").forEach(function (b) {
  b.addEventListener("click", function () { setMode(b.getAttribute("data-mode")); });
});

createChatWidget({
  root: el("#chief-chat"),
  systemPrompt: "You are the Hallelujah ONE Lunar Chief of Staff, an AI operations assistant for a human empowerment ecosystem in St. Petersburg.",
  greeting: "Lunar node online. Ask me about residents, mobility, the AI Academy, H3O revenue, the funding war room, or the current moon phase.",
  endpoint: "/api/chat"
});

// Refresh lunar readout every 15 min for long-lived boardroom sessions.
setInterval(renderLunar, 15 * 60 * 1000);

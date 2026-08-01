/* =============================================================
   HALLELUJAH ONE™ — Intelligence Layer / Command Center
   DEMO vs LIVE operating modes + AI Chief of Staff.
   ============================================================= */
import { createChatWidget } from "/src/lib/chatWidget.js";

/* ---------- KPI + funnel data ---------- */
var KPIS = [
  { id: "residents", label: "Residents supported", demo: "37", delta: "+4 MoM", spark: [22, 25, 24, 28, 30, 33, 34, 37] },
  { id: "stability", label: "Stability rate", demo: "82%", delta: "+3 pts", spark: [70, 72, 71, 75, 77, 78, 80, 82] },
  { id: "revenue", label: "Enterprise revenue / mo", demo: "$8,420", delta: "+12%", spark: [5100, 5600, 6100, 6400, 7000, 7500, 7900, 8420] },
  { id: "pipeline", label: "Funding pipeline", demo: "$2.4M", delta: "6 opportunities", spark: [0.9, 1.1, 1.3, 1.6, 1.8, 2.0, 2.2, 2.4] }
];

var FUNNEL = [
  ["Intake", 60], ["Stabilized", 37], ["In training", 24], ["Employed", 16]
];

var SOURCES = [
  ["Housing & residents database", "Airtable / Postgres"],
  ["Partner CRM", "HubSpot / Salesforce"],
  ["Funding & grants tracker", "Instrumentl / Sheets"],
  ["Mobility feed", "PSTA / rides log"],
  ["Enterprise revenue (H3O)", "Square / Stripe"]
];

var mode = "demo"; // 'demo' | 'live'

function sparkline(data, w, h) {
  var min = Math.min.apply(null, data), max = Math.max.apply(null, data);
  var span = max - min || 1;
  var pts = data.map(function (v, i) {
    var x = (i / (data.length - 1)) * w;
    var y = h - ((v - min) / span) * (h - 4) - 2;
    return x.toFixed(1) + "," + y.toFixed(1);
  }).join(" ");
  return (
    '<svg class="spark" viewBox="0 0 ' + w + " " + h + '" preserveAspectRatio="none" width="100%" height="' + h + '">' +
    '<defs><linearGradient id="sg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7c6cff"/><stop offset="1" stop-color="#e8c46a"/></linearGradient></defs>' +
    '<polyline fill="none" stroke="url(#sg)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="' + pts + '"/>' +
    "</svg>"
  );
}

function renderKPIs() {
  var host = document.getElementById("kpis");
  host.innerHTML = KPIS.map(function (k) {
    var val = mode === "demo" ? k.demo : "—";
    var delta = mode === "demo"
      ? '<span class="delta">' + k.delta + "</span>"
      : '<span class="delta" style="color:var(--faint)">awaiting source</span>';
    var tag = mode === "demo" ? '<span class="tag-demo">Demo</span>' : '<span class="tag-live">Live</span>';
    var spark = mode === "demo" ? sparkline(k.spark, 200, 40) : "";
    return (
      '<div class="card kpi reveal in">' + tag +
      '<div class="num">' + val + delta + "</div>" +
      '<div class="label">' + k.label + "</div>" +
      spark +
      "</div>"
    );
  }).join("");
}

function renderFunnel() {
  var host = document.getElementById("funnel");
  var max = FUNNEL[0][1];
  host.innerHTML = FUNNEL.map(function (f) {
    var val = mode === "demo" ? f[1] : "—";
    var pct = mode === "demo" ? (f[1] / max) * 100 : 0;
    return (
      '<div class="bar-row"><div class="bname">' + f[0] + "</div>" +
      '<div class="bar-track"><div class="bar-fill" style="width:' + pct + '%"></div></div>' +
      '<div class="bval">' + val + "</div></div>"
    );
  }).join("");
}

function renderSources() {
  var host = document.getElementById("sources");
  host.innerHTML = SOURCES.map(function (s) {
    var connected = mode === "live";
    var dot = mode === "live" ? "wait" : "off";
    var status = mode === "live" ? "Awaiting connection" : "Simulated (demo)";
    var color = mode === "live" ? "var(--gold)" : "var(--faint)";
    return (
      '<div class="source-row"><div><span class="status-dot ' + dot + '"></span>' +
      "<strong>" + s[0] + "</strong> " +
      '<span style="color:var(--faint);font-size:0.85rem">· ' + s[1] + "</span></div>" +
      '<span style="color:' + color + ';font-size:0.85rem">' + status + "</span></div>"
    );
  }).join("");
}

function renderBanner() {
  var b = document.getElementById("mode-banner");
  if (mode === "demo") {
    b.className = "mode-banner demo";
    b.innerHTML = "<strong>Demo environment</strong> — illustrative operating metrics for partner demonstrations. Numbers are representative, not live.";
  } else {
    b.className = "mode-banner live";
    b.innerHTML = "<strong>Live operations mode</strong> — connect the data sources below to stream real figures. No sources are connected yet, so values read as pending.";
  }
}

function setMode(next) {
  mode = next;
  document.querySelectorAll(".mode-switch button").forEach(function (btn) {
    btn.classList.toggle("on", btn.getAttribute("data-mode") === next);
  });
  renderBanner();
  renderKPIs();
  renderFunnel();
  renderSources();
}

/* ---------- AI Chief of Staff (demo responder over the chat engine) ---------- */
var CHIEF_PROMPT =
  "You are the Hallelujah ONE Chief of Staff, an AI operations assistant for a human empowerment ecosystem in St. Petersburg.";

// Install a demo responder so the widget works with no backend.
// It intercepts only the widget's endpoint and returns scripted answers.
(function installDemoEndpoint() {
  var realFetch = window.fetch.bind(window);
  window.fetch = function (url, opts) {
    if (typeof url === "string" && url.indexOf("/api/chat") === 0) {
      var text = "";
      try { text = JSON.parse(opts.body).messages.slice(-1)[0].content.toLowerCase(); } catch (e) {}
      var reply = demoAnswer(text);
      return Promise.resolve(new Response(JSON.stringify({ text: reply }), {
        status: 200, headers: { "Content-Type": "application/json" }
      }));
    }
    return realFetch(url, opts);
  };
})();

function demoAnswer(q) {
  if (/resident|stabil|housing|mac house/.test(q))
    return "Mac House currently supports 37 residents at an 82% stability rate (illustrative demo data). Stabilization is the first step — from here residents move into mobility, training, and income.";
  if (/revenue|money|enterprise|h3o/.test(q))
    return "H3O Enterprise is generating $8,420/mo in illustrative revenue. Earned income reduces grant dependence and creates on-ramp jobs for residents.";
  if (/fund|grant|pipeline|donor/.test(q))
    return "The funding pipeline shows $2.4M across 6 opportunities (illustrative). In Live mode this connects to a grants tracker and partner CRM.";
  if (/mobility|transport|psta|ride/.test(q))
    return "The Mobility Hub removes the transportation barrier — about 540 rides/mo in the demo — connecting people to jobs, care, and training.";
  if (/train|job|career|employ/.test(q))
    return "The Training Center converts stability into income, with a 68% placement rate (illustrative) alongside USF St Pete and employer partners.";
  if (/partner|usf|baycare|ymca|urban|dali/.test(q))
    return "Ecosystem partners include USF St Pete, BayCare, PSTA, YMCA, the Urban League, and the Dalí Museum. Explore each in the Digital Twin map.";
  if (/hello|hi|hey|help|what can/.test(q))
    return "I can brief you on residents, revenue, funding, mobility, training, or partners. Ask me anything — I'm running in demo mode.";
  return "In this demo I can speak to residents, stability, enterprise revenue, funding pipeline, mobility, training, and partners. In Live mode I'd draw from connected data sources and your AI Chief of Staff prompts.";
}

/* ---------- Boot ---------- */
document.querySelectorAll(".mode-switch button").forEach(function (btn) {
  btn.addEventListener("click", function () { setMode(btn.getAttribute("data-mode")); });
});
setMode("demo");

createChatWidget({
  root: document.getElementById("chief"),
  systemPrompt: CHIEF_PROMPT,
  greeting: "AI Chief of Staff online (demo mode). Ask me about residents, revenue, funding, mobility, training, or partners.",
  endpoint: "/api/chat"
});

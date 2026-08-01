import { createChatWidget } from "/src/lib/chatWidget.js";

const $ = (sel) => document.querySelector(sel);
const fmt = (n) => n.toLocaleString("en-US");
const money = (n) =>
  n >= 1000 ? "$" + (n / 1000).toFixed(n % 1000 ? 1 : 0) + "k" : "$" + n;

async function load(name) {
  const res = await fetch(`/data/${name}.json`);
  return res.json();
}

/* ---------- header ---------- */
function renderHeader(org) {
  $("#hello").textContent = `${org.organization} — Command Center`;
  $("#today").textContent = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  }) + ` · ${org.location} · ${org.fiscalYear}`;
}

/* ---------- KPIs ---------- */
const ICONS = {
  home: "M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z",
  briefcase: "M4 7h16v12H4zM9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2",
  dollar: "M12 3v18M8 7h6a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h7",
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
};
function renderKpis(metrics) {
  const el = $("#kpis");
  el.innerHTML = "";
  for (const k of metrics.kpis) {
    const pct = Math.min(100, Math.round((k.value / k.target) * 100));
    const val = k.unit === "$" ? money(k.value) : fmt(k.value) + (k.unit === "%" ? "%" : "");
    const trend = k.unit === "$" ? "+" + money(k.trend) : "+" + k.trend + (k.unit === "%" ? "pts" : "");
    const card = document.createElement("div");
    card.className = "card kpi";
    card.innerHTML = `
      <div class="kpi-top">
        <div class="icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${ICONS[k.icon] || ICONS.home}"/></svg></div>
        <span class="trend">${trend}</span>
      </div>
      <div class="val">${val}</div>
      <div class="lbl">${k.label}</div>
      <div class="progress"><span style="width:${pct}%"></span></div>
      <div class="lbl" style="margin-top:6px; font-size:11px;">${pct}% of target ${k.unit === "$" ? money(k.target) : fmt(k.target) + (k.unit === "%" ? "%" : "")}</div>`;
    el.appendChild(card);
  }
}

/* ---------- Funding bars ---------- */
function renderFunding(funding) {
  const rows = funding.pipeline;
  const max = Math.max(...rows.map((r) => r.amount));
  const total = rows.reduce((s, r) => s + r.amount, 0);
  const weighted = rows.reduce((s, r) => s + r.amount * r.probability, 0);
  $("#fund-total").textContent = `${money(total)} total · ${money(Math.round(weighted))} weighted`;
  $("#fund-bars").innerHTML = rows
    .map(
      (r) => `
      <div class="bar-row">
        <div class="name">${r.source}<div class="stage-tag">${r.stage} · ${Math.round(r.probability * 100)}%</div></div>
        <div class="bar-track"><div class="bar-fill" style="width:${(r.amount / max) * 100}%"></div></div>
        <div class="amt">${money(r.amount)}</div>
      </div>`
    )
    .join("");
}

/* ---------- Donut (resident status) ---------- */
const PALETTE = ["#6ea8fe", "#7ee0c0", "#f4c34a", "#b48bff", "#ff8fab"];
function renderDonut(residents) {
  const data = residents.stages;
  const total = data.reduce((s, d) => s + d.count, 0);
  const r = 54, c = 2 * Math.PI * r;
  let offset = 0;
  const segs = data
    .map((d, i) => {
      const frac = d.count / total;
      const seg = `<circle r="${r}" cx="70" cy="70" fill="none" stroke="${PALETTE[i % PALETTE.length]}" stroke-width="20" stroke-dasharray="${frac * c} ${c}" stroke-dashoffset="${-offset}" transform="rotate(-90 70 70)"/>`;
      offset += frac * c;
      return seg;
    })
    .join("");
  $("#donut").innerHTML = `
    <svg width="140" height="140" viewBox="0 0 140 140">
      ${segs}
      <text x="70" y="66" text-anchor="middle" fill="#e8ecf4" font-size="26" font-weight="800">${total}</text>
      <text x="70" y="86" text-anchor="middle" fill="#8b94ab" font-size="11">people</text>
    </svg>`;
  $("#donut-legend").innerHTML = data
    .map((d, i) => `<div class="legend-item"><span class="sw" style="background:${PALETTE[i % PALETTE.length]}"></span>${d.stage} · <strong>${d.count}</strong></div>`)
    .join("");
}

/* ---------- Grant countdown ---------- */
function renderDeadlines(dl) {
  const now = new Date();
  const items = dl.deadlines
    .map((d) => ({ ...d, days: Math.ceil((new Date(d.date) - now) / 86400000) }))
    .sort((a, b) => a.days - b.days);
  $("#deadlines").innerHTML = items
    .map((d) => {
      const cls = d.days <= 14 ? "urgent" : d.days <= 30 ? "soon" : "";
      return `<div class="deadline">
        <div><div class="dl-name">${d.name}</div><div class="dl-org">${d.org} · ${new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div></div>
        <div class="countdown ${cls}"><div class="days">${d.days}</div><div class="u">days left</div></div>
      </div>`;
    })
    .join("");
}

/* ---------- Partner CRM ---------- */
function renderPartners(p) {
  $("#partner-rows").innerHTML = p.partners
    .map(
      (x) => `<tr>
        <td><strong>${x.name}</strong><div class="dl-org">${x.type}</div></td>
        <td><span class="status-chip">${x.status}</span></td>
        <td>${x.next}</td>
      </tr>`
    )
    .join("");
}

/* ---------- H3O production (SVG line + area) ---------- */
function renderH3O(h) {
  $("#h3o-sub").textContent = `${h.units} · capacity ${fmt(h.capacity)}`;
  const s = h.series, W = 460, H = 150, pad = 24;
  const max = h.capacity;
  const x = (i) => pad + (i * (W - pad * 2)) / (s.length - 1);
  const y = (v) => H - pad - (v / max) * (H - pad * 2);
  const pts = s.map((d, i) => `${x(i)},${y(d.produced)}`).join(" ");
  const area = `${pad},${H - pad} ${pts} ${x(s.length - 1)},${H - pad}`;
  $("#h3o-chart").innerHTML = `
    <svg width="100%" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="max-width:100%">
      <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#6ea8fe" stop-opacity="0.35"/><stop offset="100%" stop-color="#6ea8fe" stop-opacity="0"/>
      </linearGradient></defs>
      <polygon points="${area}" fill="url(#ag)"/>
      <polyline points="${pts}" fill="none" stroke="#7ee0c0" stroke-width="2.5" stroke-linejoin="round"/>
      ${s.map((d, i) => `<circle cx="${x(i)}" cy="${y(d.produced)}" r="3.5" fill="#7ee0c0"/><text x="${x(i)}" y="${H - 6}" text-anchor="middle" fill="#8b94ab" font-size="11">${d.month}</text>`).join("")}
    </svg>`;
}

/* ---------- Workforce funnel ---------- */
function renderFunnel(residents) {
  const data = residents.stages;
  const max = Math.max(...data.map((d) => d.count));
  $("#funnel").innerHTML = data
    .map(
      (d) => `<div class="funnel-step">
        <div class="fl">${d.stage}</div>
        <div class="funnel-bar" style="width:${Math.max(18, (d.count / max) * 100)}%">${d.count}</div>
      </div>`
    )
    .join("");
}

/* ---------- AI Chief of Staff ---------- */
function mountChat(org) {
  createChatWidget({
    root: $("#ai"),
    endpoint: "/api/chat",
    systemPrompt:
      `You are the AI Chief of Staff for ${org.organization}, an economic mobility operating system in ${org.location}. ` +
      `Mission: ${org.mission} Be concise, practical, and action-oriented. Help prioritize funders, partners, and grant deadlines.`,
    greeting:
      "I'm your Chief of Staff. Ask me about today's priorities, a funder, or the pipeline. " +
      "(Live answers require an ANTHROPIC_API_KEY; otherwise I run in offline mode.)",
  });
}

/* ---------- boot ---------- */
(async function boot() {
  try {
    const [org, metrics, residents, funding, partners, deadlines, h3o] = await Promise.all([
      load("org"), load("metrics"), load("residents"), load("funding"),
      load("partners"), load("deadlines"), load("h3o"),
    ]);
    renderHeader(org);
    renderKpis(metrics);
    renderFunding(funding);
    renderDonut(residents);
    renderDeadlines(deadlines);
    renderPartners(partners);
    renderH3O(h3o);
    renderFunnel(residents);
    mountChat(org);
  } catch (e) {
    document.querySelector(".main").insertAdjacentHTML(
      "afterbegin",
      `<div class="card" style="border-color:rgba(255,107,107,.4)">Failed to load data: ${e.message}</div>`
    );
  }
})();

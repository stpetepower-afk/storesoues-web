/* =============================================================
   HALLELUJAH ONE™ — Digital Twin Experience v0.1
   Web-based interactive ecosystem map.
   ============================================================= */
(function () {
  // Node positions are percentages of the stage (x, y).
  var NODES = {
    machouse: {
      x: 50, y: 46, kind: "hub", emoji: "🏠", label: "Mac House Campus",
      sub: "The core", tap: 2, phrase: "This is stabilization.",
      mission: "The stabilization anchor of the ecosystem — safe housing and a foundation for every next step.",
      impact: "Residents move from crisis to stability, then into training, mobility, and income.",
      partners: ["BayCare", "Urban League", "YMCA"],
      metrics: [["Residents", "37"], ["Stability", "82%"]],
      funding: "Housing stabilization & wraparound services"
    },
    wellness: {
      x: 24, y: 24, kind: "zone", emoji: "🌿", label: "Wellness Oasis",
      sub: "Restore", mission: "Whole-person wellness — physical, mental, and spiritual health that makes progress durable.",
      impact: "Reduces relapse and drop-off; keeps residents healthy enough to work and grow.",
      partners: ["BayCare", "YMCA"], metrics: [["Weekly visits", "120+"]],
      funding: "Health & wellness grants"
    },
    training: {
      x: 76, y: 22, kind: "zone", emoji: "🎓", label: "Training Center", tap: 4,
      phrase: "This creates income.", sub: "Career launch",
      mission: "Skills training that converts directly into employment and income.",
      impact: "Turns stability into a paycheck — the engine of long-term independence.",
      partners: ["USF St Pete", "Employers", "Urban League"], metrics: [["Placement", "68%"]],
      funding: "Workforce development & employer sponsorship"
    },
    h3o: {
      x: 79, y: 55, kind: "zone", emoji: "💧", label: "H3O Enterprise",
      sub: "Social enterprise",
      mission: "A revenue-generating social enterprise that funds the mission and employs residents.",
      impact: "Earned income reduces dependence on grants and creates on-ramp jobs.",
      partners: ["Employers", "Businesses"], metrics: [["Monthly revenue", "$8,420"]],
      funding: "Enterprise reinvestment"
    },
    mobility: {
      x: 21, y: 60, kind: "zone", emoji: "🚐", label: "Mobility Hub", tap: 3,
      phrase: "This creates access.", sub: "Access",
      mission: "Transportation that removes the single biggest barrier between people and opportunity.",
      impact: "Access to jobs, appointments, and training — no one is stranded from their next step.",
      partners: ["PSTA"], metrics: [["Rides / mo", "540"]],
      funding: "Mobility & access partnerships"
    },
    ai: {
      x: 50, y: 80, kind: "zone", emoji: "🧠", label: "AI Command Center", tap: 5,
      phrase: "This is how we measure everything.", sub: "Intelligence",
      mission: "The intelligence layer — every outcome measured, every partner and dollar tracked.",
      impact: "Turns activity into evidence funders can trust, and operations into automation.",
      partners: ["Internal operations"], metrics: [["Data sources", "5"], ["Pipeline", "$2.4M"]],
      funding: "Operations & data infrastructure"
    },
    // Community network (outer ring)
    usf: { x: 90, y: 8, kind: "community", emoji: "🎓", label: "USF St Pete", community: true },
    baycare: { x: 8, y: 8, kind: "community", emoji: "➕", label: "BayCare", community: true },
    psta: { x: 6, y: 82, kind: "community", emoji: "🚌", label: "PSTA", community: true },
    ymca: { x: 94, y: 82, kind: "community", emoji: "🤸", label: "YMCA", community: true },
    urban: { x: 92, y: 40, kind: "community", emoji: "🤝", label: "Urban League", community: true },
    dali: { x: 8, y: 42, kind: "community", emoji: "🎨", label: "Dalí Museum", community: true }
  };

  // Links from hub/zones outward.
  var LINKS = [
    ["machouse", "wellness"], ["machouse", "training"], ["machouse", "h3o"],
    ["machouse", "mobility"], ["machouse", "ai"],
    ["training", "usf"], ["wellness", "baycare"], ["mobility", "psta"],
    ["wellness", "ymca"], ["training", "urban"], ["ai", "dali"], ["h3o", "ymca"]
  ];

  // Guided tour order (matches the six-tap Monday demo).
  var TOUR = ["machouse", "mobility", "training", "ai"];

  var stage = document.getElementById("stage");
  var svg = document.getElementById("links");
  var panel = document.getElementById("panel");
  var current = "machouse";

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  // Draw connector lines
  function drawLinks() {
    var ns = "http://www.w3.org/2000/svg";
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("preserveAspectRatio", "none");
    LINKS.forEach(function (pair) {
      var a = NODES[pair[0]], b = NODES[pair[1]];
      var line = document.createElementNS(ns, "line");
      line.setAttribute("x1", a.x); line.setAttribute("y1", a.y);
      line.setAttribute("x2", b.x); line.setAttribute("y2", b.y);
      line.setAttribute("stroke", "rgba(255,255,255,0.10)");
      line.setAttribute("stroke-width", "0.35");
      line.setAttribute("vector-effect", "non-scaling-stroke");
      svg.appendChild(line);
    });
  }

  function renderNodes() {
    Object.keys(NODES).forEach(function (id) {
      var n = NODES[id];
      var btn = el("button", "node " + (n.kind || "zone"));
      if (n.community) btn.classList.add("community");
      btn.style.left = n.x + "%";
      btn.style.top = n.y + "%";
      btn.setAttribute("data-id", id);
      btn.setAttribute("aria-label", n.label);
      btn.appendChild(el("span", "dot", n.emoji));
      btn.appendChild(el("span", "lbl", n.label));
      btn.addEventListener("click", function () { select(id); });
      stage.appendChild(btn);
    });
  }

  function select(id) {
    current = id;
    var n = NODES[id];
    document.querySelectorAll(".node").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-id") === id);
    });
    if (n.community) { renderCommunity(n); return; }
    renderZone(n);
    updateTourDots(id);
  }

  function renderZone(n) {
    var chips = (n.partners || []).map(function (p) { return '<span class="pill">' + p + "</span>"; }).join("");
    var mets = (n.metrics || []).map(function (m) {
      return '<div style="display:flex;justify-content:space-between;padding:4px 0"><span style="color:var(--muted)">' + m[0] + '</span><span class="grad-text" style="font-weight:700">' + m[1] + "</span></div>";
    }).join("");
    panel.innerHTML =
      '<div class="panel-head"><div class="panel-emoji">' + n.emoji + '</div>' +
      '<div><div class="sub">' + (n.sub || "Ecosystem zone") + '</div><h3>' + n.label + "</h3></div></div>" +
      (n.phrase ? '<p class="mission" style="color:var(--gold);font-style:italic">“' + n.phrase + '”</p>' : "") +
      '<p class="mission">' + n.mission + "</p>" +
      '<div class="field"><div class="flabel">Impact</div><div style="color:var(--muted)">' + n.impact + "</div></div>" +
      '<div class="field"><div class="flabel">Partners</div><div class="chips">' + (chips || '<span class="pill">Open for partners</span>') + "</div></div>" +
      '<div class="field"><div class="flabel">Metrics · illustrative</div>' + mets + "</div>" +
      '<div class="field"><div class="flabel">Funding alignment</div><div style="color:var(--muted)">' + n.funding + "</div></div>";
  }

  function renderCommunity(n) {
    panel.innerHTML =
      '<div class="panel-head"><div class="panel-emoji">' + n.emoji + '</div>' +
      '<div><div class="sub">Community network</div><h3>' + n.label + "</h3></div></div>" +
      '<p class="mission">A partner in the Hallelujah&nbsp;ONE™ ecosystem — connecting residents to services, opportunity, and community.</p>' +
      '<div class="field"><div class="flabel">Role</div><div style="color:var(--muted)">Referral, service, and opportunity partner feeding the campus network.</div></div>' +
      '<div class="field"><div class="flabel">Status</div><span class="pill gold">Relationship in the ecosystem map</span></div>';
  }

  // ---- Guided tour ----
  var tourIndex = -1;
  var tourDots = document.getElementById("tour-steps");

  function buildTourDots() {
    TOUR.forEach(function () { tourDots.appendChild(el("i")); });
  }
  function updateTourDots(id) {
    var idx = TOUR.indexOf(id);
    tourDots.querySelectorAll("i").forEach(function (d, i) {
      d.classList.toggle("on", idx >= 0 && i <= idx);
    });
    if (idx >= 0) tourIndex = idx;
  }
  function tourNext() {
    tourIndex = (tourIndex + 1) % TOUR.length;
    select(TOUR[tourIndex]);
  }
  function tourPrev() {
    tourIndex = (tourIndex - 1 + TOUR.length) % TOUR.length;
    select(TOUR[tourIndex]);
  }

  // Init
  drawLinks();
  renderNodes();
  buildTourDots();
  select("machouse");
  document.getElementById("tour-next").addEventListener("click", tourNext);
  document.getElementById("tour-prev").addEventListener("click", tourPrev);
})();

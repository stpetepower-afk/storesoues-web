/**
 * Hallelujah ONE — Voice Command layer.
 * Real, client-side voice: Web Speech API for listening (STT) and
 * speechSynthesis for speaking (TTS). Answers are built from the live
 * dashboard data — precise and honest, not an LLM guess. Tap-to-talk
 * (never always-listening). Degrades gracefully where unsupported.
 */
export function initVoice(data) {
  var root = document.querySelector("#voice");
  if (!root) return;

  var btn = root.querySelector("[data-v-btn]");
  var label = root.querySelector("[data-v-label]");
  var trans = root.querySelector("[data-v-trans]");
  var out = root.querySelector("[data-v-out]");
  var chips = root.querySelectorAll("[data-v-ask]");

  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var synth = window.speechSynthesis || null;
  var rec = null;
  var listening = false;

  // ---- Answer engine: intent over the real dashboard data ----
  function kpi(id) { return (data.metrics.kpis || []).find(function (k) { return k.id === id; }); }
  function money(n) { return n >= 1000 ? "$" + (n / 1000).toFixed(n % 1000 ? 1 : 0) + "k" : "$" + n; }

  function nextDeadline() {
    var now = new Date();
    var items = (data.deadlines.deadlines || []).map(function (d) {
      return { nm: d.nm || d.name, org: d.org, days: Math.ceil((new Date(d.date) - now) / 86400000) };
    }).sort(function (a, b) { return a.days - b.days; });
    return items[0];
  }

  function answer(cmd) {
    var q = (cmd || "").toLowerCase();
    var has = function () { for (var i = 0; i < arguments.length; i++) if (q.indexOf(arguments[i]) > -1) return true; return false; };

    if (has("help", "what can", "commands")) {
      return "You can ask about housing, job placements, funding, grant deadlines, the Career Launch pilot, or today's briefing.";
    }
    if (has("housing", "resident", "housed")) {
      var r = kpi("residents");
      var stages = (data.residents.stages || []).map(function (s) { return s.count + " in " + s.stage; }).join(", ");
      return r ? ("Residents housed: " + r.value + " of a target of " + r.target + ". Pathway: " + stages + ".") : "Housing data unavailable.";
    }
    if (has("placement", "job", "employ", "workforce")) {
      var p = kpi("placements");
      return p ? ("Job placements year to date: " + p.value + " of a target of " + p.target + ".") : "Placement data unavailable.";
    }
    if (has("retention")) {
      var rt = kpi("retention");
      return rt ? ("Ninety-day retention is " + rt.value + " percent, against a target of " + rt.target + " percent.") : "Retention data unavailable.";
    }
    if (has("fund", "grant", "hud", "money", "capital", "pipeline")) {
      var total = (data.funding.pipeline || []).reduce(function (s, x) { return s + x.amt; }, 0);
      // support both amt and amount keys
      total = (data.funding.pipeline || []).reduce(function (s, x) { return s + (x.amount || x.amt || 0); }, 0);
      var weighted = (data.funding.pipeline || []).reduce(function (s, x) { return s + (x.amount || x.amt || 0) * (x.probability || x.p || 0); }, 0);
      var d = nextDeadline();
      return "Funding pipeline totals " + money(total) + ", or " + money(Math.round(weighted)) + " weighted by probability." +
        (d ? " Next deadline: " + d.nm + " in " + d.days + " days." : "");
    }
    if (has("deadline", "due", "clock", "when")) {
      var d2 = nextDeadline();
      return d2 ? ("Your nearest grant deadline is " + d2.nm + ", " + d2.org + ", in " + d2.days + " days.") : "No deadlines on file.";
    }
    if (has("career", "mentor", "pilot", "enroll")) {
      var m = (data.career.metrics || []);
      var en = m.find(function (x) { return x.id === "enrolled"; });
      return "The Career Launch Mentor is in Phase 1. Residents enrolled: " + (en ? en.value : 0) +
        ". These numbers start at zero and move only when a real resident is served.";
    }
    if (has("h3o", "production", "revenue", "enterprise")) {
      var s = (data.h3o.series || []); var last = s[s.length - 1];
      return last ? ("H3O production reached " + last.produced + " " + (data.h3o.units || "units") + " in " + last.month + ", against a capacity of " + data.h3o.capacity + ".") : "H3O data unavailable.";
    }
    if (has("brief", "summary", "today", "status", "overview")) {
      var rr = kpi("residents"), pp = kpi("placements"); var dd = nextDeadline();
      return "Briefing. " + (rr ? rr.value + " residents housed. " : "") + (pp ? pp.value + " job placements year to date. " : "") +
        (dd ? "Top priority: " + dd.nm + " in " + dd.days + " days. " : "") +
        "The Career Launch pilot is at zero enrolled — serving the first resident is the next real step.";
    }
    return "I heard: " + cmd + ". Try asking about housing, funding, grant deadlines, or today's briefing.";
  }

  // ---- Speak (TTS) ----
  var preferred = null;
  function pickVoice() {
    if (!synth) return;
    var vs = synth.getVoices() || [];
    preferred = vs.find(function (v) { return v.lang && v.lang.indexOf("en") === 0 && /Samantha|Google US|Premium|Natural/i.test(v.name); }) ||
      vs.find(function (v) { return v.lang && v.lang.indexOf("en") === 0; }) || vs[0] || null;
  }
  if (synth) { pickVoice(); if (typeof synth.onvoiceschanged !== "undefined") synth.onvoiceschanged = pickVoice; }

  function speak(text) {
    if (!synth) return;
    synth.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.rate = 1; u.pitch = 1; u.volume = 1;
    if (preferred) u.voice = preferred;
    synth.speak(u);
  }

  function respond(cmd) {
    var a = answer(cmd);
    out.textContent = a;
    speak(a);
  }

  // ---- Listen (STT) ----
  function setListening(on) {
    listening = on;
    root.classList.toggle("listening", on);
    label.textContent = on ? "Listening… tap to stop" : "Speak to the Chief of Staff";
  }

  if (SR) {
    rec = new SR();
    rec.lang = "en-US"; rec.continuous = false; rec.interimResults = true; rec.maxAlternatives = 1;
    rec.onstart = function () { setListening(true); trans.textContent = "…"; };
    rec.onresult = function (e) {
      var last = e.results[e.results.length - 1];
      trans.textContent = last[0].transcript;
      if (last.isFinal) respond(last[0].transcript);
    };
    rec.onerror = function (e) {
      setListening(false);
      if (e.error === "not-allowed" || e.error === "service-not-allowed") trans.textContent = "Microphone permission needed.";
      else if (e.error === "network") trans.textContent = "Voice recognition needs a connection.";
      else if (e.error !== "aborted") trans.textContent = "Didn't catch that — try again.";
    };
    rec.onend = function () { setListening(false); };
    btn.addEventListener("click", function () {
      if (listening) { rec.abort(); setListening(false); }
      else { try { rec.start(); } catch (_) {} }
    });
  } else {
    // No speech recognition: keep the quick questions working with spoken answers.
    label.textContent = "Tap a question below";
    btn.setAttribute("disabled", "true");
    btn.title = "Voice input isn't supported in this browser — use the quick questions.";
    trans.textContent = "Voice input not supported here — the quick questions still speak answers.";
  }

  // Quick-ask chips work everywhere (with or without a microphone).
  chips.forEach(function (c) {
    c.addEventListener("click", function () { trans.textContent = c.textContent; respond(c.getAttribute("data-v-ask")); });
  });
}

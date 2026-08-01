// ============================================================
// LIVING VOICE ENGINE v2 — Tone, Accessibility, Impact
// Proof Layer. Pipeline runs; accuracy/bias checks are stubs that
// return input unchanged until the Evidence Engine is wired in.
// (Fixed from the design draft: steps are bound so `this` survives
//  the reduce pipeline — the original lost context and would throw.)
// ============================================================

class LivingVoiceEngine {
  constructor(config = {}) {
    this.tone = config.tone || "empathetic";
    this.accessibility = config.accessibility || "plain_language";
    this.confidenceThreshold = config.confidenceThreshold || 0.7;
  }

  process(rawAIOutput, context = {}) {
    // Bind each step so `this` is preserved inside the reduce.
    const steps = [
      this.checkAccuracy,
      this.checkBias,
      this.checkHumanImpact,
      this.adaptTone,
      this.ensureAccessibility,
      this.finalize,
    ].map((fn) => fn.bind(this));

    return steps.reduce((output, step) => step(output, context), rawAIOutput);
  }

  // --- Guardrail steps (stubs until Evidence Engine exists) ---
  checkAccuracy(output) {
    // TODO: validate claims against the Evidence Engine (source_registry).
    return output;
  }

  checkBias(output) {
    // TODO: detect and mitigate biased phrasing.
    return output;
  }

  checkHumanImpact(output) {
    // TODO: confirm the recommendation improves the person's well-being.
    return output;
  }

  // --- Tone (real, minimal behavior) ---
  adaptTone(output) {
    const toneMap = {
      empathetic: this.makeEmpathetic,
      professional: this.makeProfessional,
      motivational: this.makeMotivational,
      informative: this.makeInformative,
    };
    const adapter = (toneMap[this.tone] || this.makeEmpathetic).bind(this);
    return adapter(output);
  }

  ensureAccessibility(output) {
    // Plain-language pass: collapse whitespace, keep it simple.
    if (this.accessibility === "plain_language" && typeof output === "string") {
      return output.replace(/\s+/g, " ").trim();
    }
    return output;
  }

  finalize(output) {
    // Downstream: attach confidence score, sources, and next steps.
    return output;
  }

  makeEmpathetic(text) {
    return typeof text === "string" ? text : String(text);
  }
  makeProfessional(text) {
    return typeof text === "string" ? text : String(text);
  }
  makeMotivational(text) {
    return typeof text === "string" ? text : String(text);
  }
  makeInformative(text) {
    return typeof text === "string" ? text : String(text);
  }
}

// Runnable self-test: `node tone_engine.js`
if (typeof require !== "undefined" && require.main === module) {
  const engine = new LivingVoiceEngine({ tone: "empathetic" });
  const out = engine.process("  You   qualify  for   the   program. ");
  console.log("Living Voice output:", JSON.stringify(out));
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { LivingVoiceEngine };
}

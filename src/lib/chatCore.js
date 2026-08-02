/**
 * Shared chat logic for the Hallelujah ONE assistant.
 * Consumed by the Vercel function (api/chat.js) and the Netlify function
 * (netlify/functions/chat.js) so both platforms share one implementation.
 *
 * generateReply({ system, messages }) -> Promise<{ text }>
 *   - Uses the Claude Messages API when ANTHROPIC_API_KEY is set.
 *   - Falls back to a scripted responder otherwise, so previews work with no secrets.
 *   - Throws { status, message } on an upstream/API error so callers can map it.
 */
async function generateReply({ system = "", messages = [] } = {}) {
  const safeMessages = Array.isArray(messages) ? messages : [];
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return { text: scriptedReply(safeMessages) };
  }

  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";
  let apiRes;
  try {
    apiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 512,
        system: system || undefined,
        messages: safeMessages.map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: String(m.content ?? ""),
        })),
      }),
    });
  } catch (err) {
    throw { status: 500, message: `Request to Claude failed: ${String((err && err.message) || err)}` };
  }

  if (!apiRes.ok) {
    const detail = await apiRes.text().catch(() => "");
    throw { status: 502, message: `Upstream error (${apiRes.status}): ${detail.slice(0, 300)}` };
  }

  const data = await apiRes.json();
  const text =
    Array.isArray(data.content) && data.content.length
      ? data.content.map((b) => b.text || "").join("").trim()
      : "";
  return { text: text || scriptedReply(safeMessages) };
}

// Lightweight fallback so the assistant feels alive without a configured key.
function scriptedReply(messages) {
  const last = [...messages].reverse().find((m) => m.role === "user");
  const q = ((last && String(last.content)) || "").toLowerCase();

  if (/partner|invest|fund|donate|give|support/.test(q)) {
    return "We're inviting capital partners, civic allies, and advisors to build with us. The best first step is a short conversation — email stpetepower@gmail.com and we'll set a time.";
  }
  if (/hous|4-?plex|own|rent|equity|shelter/.test(q)) {
    return "Housing Stability turns shelter into a foundation — we steward multi-family assets, beginning with a 4-plex, so resident families build real equity instead of only paying rent.";
  }
  if (/\bai\b|academy|learn|tech|automation/.test(q)) {
    return "The AI Skills Academy helps people go from learning to leading — building the technical fluency to thrive in an AI-shaped economy.";
  }
  if (/career|job|employ|skill|work|hire/.test(q)) {
    return "Career Launch moves people from skills to employment — practical training that leads to real jobs and lasting income.";
  }
  if (/entrepreneur|business|start|founder|ownership pathway/.test(q)) {
    return "Entrepreneur & Ownership Pathways move people from create to own — supporting them to build and own businesses, not just work in them.";
  }
  if (/counsel|naca|financ|homebuy|homeown|money|credit/.test(q)) {
    return "Financial Empowerment turns knowledge into ownership — including NACA-certified homeownership counseling that helps renters become owners and owners become stewards.";
  }
  if (/communit|network|connect|neighbor/.test(q)) {
    return "The Community Impact Network turns connection into growth — linking families, partners, and civic allies so progress compounds across the neighborhood.";
  }
  if (/gas plant|district|st\.? ?pete|3548|address|where/.test(q)) {
    return "We're anchored at 3548 5th Ave S in St. Petersburg's Historic Gas Plant District — once a thriving Black community, now a generational redevelopment. Hallelujah ONE exists to keep ownership and wealth in local hands.";
  }
  if (/pillar|model|program|how.*work|what.*do/.test(q)) {
    return "The model is six pillars: Career Launch, Housing Stability, Financial Empowerment, AI Skills Academy, Community Impact Network, and Entrepreneur & Ownership Pathways — each turning a starting point into lasting capability.";
  }
  if (/vision|mission|who|what is|about|purpose/.test(q)) {
    return "Hallelujah Ministries is a permanent institution empowering families through education, career development, technology, and community — creating generational sovereignty, not temporary assistance. We build belonging, not just buildings.";
  }
  return "Thank you for reaching out. I can tell you about our doctrine, the six pillars (Career Launch, Housing Stability, Financial Empowerment, AI Skills Academy, Community Impact Network, and Entrepreneur & Ownership Pathways), or how to partner. What would you like to explore?";
}

module.exports = { generateReply, scriptedReply };

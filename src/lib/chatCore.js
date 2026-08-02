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
  if (/hous|4-?plex|own|rent|equity/.test(q)) {
    return "Housing & Ownership is our first engine: we acquire and steward multi-family assets — beginning with a 4-plex — so resident families build real equity, not just pay rent.";
  }
  if (/charg|tesla|supercharger|ev\b/.test(q)) {
    return "Charging infrastructure — EV and Supercharger capacity — is a revenue anchor for the model and a forward-looking signal for the district.";
  }
  if (/counsel|naca|financ|homebuy|homeown/.test(q)) {
    return "Financial Empowerment means NACA-certified homeownership counseling that helps turn renters into owners, and owners into long-term stewards.";
  }
  if (/gas plant|district|st\.? ?pete|neighborhood/.test(q)) {
    return "The Historic Gas Plant District was once a thriving Black community and is now the site of a generational redevelopment. Hallelujah ONE exists to make sure the next chapter keeps ownership and wealth in local hands.";
  }
  if (/vision|mission|who|what is|about/.test(q)) {
    return "Hallelujah ONE builds belonging, not just buildings. We unite ministry, capital strategy, and technical precision to build lasting community wealth in St. Petersburg's Gas Plant District.";
  }
  return "Thank you for reaching out. I can tell you about our vision, our four-engine model (housing, charging infrastructure, financial empowerment, and our institutional backbone), or how to partner with us. What would you like to explore?";
}

module.exports = { generateReply, scriptedReply };

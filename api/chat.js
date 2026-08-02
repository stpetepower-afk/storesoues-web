/**
 * Serverless endpoint for the Hallelujah ONE assistant.
 * Contract (matches src/lib/chatWidget.js):
 *   POST /api/chat  { system: string, messages: [{role, content}] }  ->  { text: string }
 *
 * Behavior:
 *   - If ANTHROPIC_API_KEY is set, forwards the conversation to the Claude Messages API.
 *   - Otherwise falls back to a small scripted responder so the widget works on previews
 *     with no secrets configured.
 *
 * Deploy notes:
 *   - Vercel auto-detects this file as a serverless function at /api/chat (no config).
 *   - On Netlify, add an equivalent function + a redirect from /api/chat, or set the
 *     widget endpoint to the Netlify function path.
 */
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ error: "Method not allowed" }));
  }

  // Parse body (Vercel usually populates req.body; guard for raw streams too).
  let body = req.body;
  if (!body || typeof body === "string") {
    try {
      const raw = typeof body === "string" ? body : await readRaw(req);
      body = raw ? JSON.parse(raw) : {};
    } catch {
      body = {};
    }
  }

  const system = typeof body.system === "string" ? body.system : "";
  const messages = Array.isArray(body.messages) ? body.messages : [];

  res.setHeader("Content-Type", "application/json");

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.statusCode = 200;
    return res.end(JSON.stringify({ text: scriptedReply(messages) }));
  }

  try {
    const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";
    const apiRes = await fetch("https://api.anthropic.com/v1/messages", {
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
        messages: messages.map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: String(m.content ?? ""),
        })),
      }),
    });

    if (!apiRes.ok) {
      const detail = await apiRes.text().catch(() => "");
      res.statusCode = 502;
      return res.end(JSON.stringify({ error: `Upstream error (${apiRes.status})`, detail: detail.slice(0, 300) }));
    }

    const data = await apiRes.json();
    const text =
      Array.isArray(data.content) && data.content.length
        ? data.content.map((b) => b.text || "").join("").trim()
        : "";
    res.statusCode = 200;
    return res.end(JSON.stringify({ text: text || scriptedReply(messages) }));
  } catch (err) {
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: "Request failed", detail: String(err && err.message || err) }));
  }
};

function readRaw(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

// Lightweight fallback so the assistant feels alive without a configured key.
function scriptedReply(messages) {
  const last = [...messages].reverse().find((m) => m.role === "user");
  const q = (last && String(last.content) || "").toLowerCase();

  if (/partner|invest|fund|donate|give|support/.test(q)) {
    return "We're inviting capital partners, civic allies, and advisors to build with us. The best first step is a short conversation — email stpetepower@gmail.com and we'll set a time.";
  }
  if (/hous|4-?plex|own|rent|equity/.test(q)) {
    return "Housing & Ownership is our first engine: we acquire and steward multi-family assets — beginning with a 4-plex — so resident families build real equity, not just pay rent.";
  }
  if (/charg|tesla|supercharger|ev/.test(q)) {
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

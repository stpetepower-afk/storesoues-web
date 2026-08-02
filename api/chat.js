/**
 * Vercel serverless endpoint for the Hallelujah ONE assistant.
 * Contract (matches src/lib/chatWidget.js):
 *   POST /api/chat  { system, messages: [{role, content}] }  ->  { text }
 *
 * Auto-detected by Vercel at /api/chat (no config). Shared logic lives in
 * src/lib/chatCore.js so this and the Netlify function stay in sync.
 */
const { generateReply } = require("../src/lib/chatCore.js");

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    res.statusCode = 405;
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

  try {
    const { text } = await generateReply({ system: body.system, messages: body.messages });
    res.statusCode = 200;
    return res.end(JSON.stringify({ text }));
  } catch (err) {
    res.statusCode = (err && err.status) || 500;
    return res.end(JSON.stringify({ error: (err && err.message) || "Request failed" }));
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

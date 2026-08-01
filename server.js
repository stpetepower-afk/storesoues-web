/**
 * Hallelujah ONE — Command Center dev server.
 * Zero dependencies: uses only Node's built-in modules, so `npm run dev`
 * always runs without an install step. Node 18+ (global fetch) required.
 *
 *   Static:  /            -> public/index.html
 *            /src/*       -> repo src/ (serves the real chat widget)
 *            /data/*      -> data/ JSON foundation
 *   API:     POST /api/chat  -> Anthropic Messages API if ANTHROPIC_API_KEY
 *                              is set, otherwise a local canned briefing.
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 5173;
const ROOT = __dirname;
const MODEL = process.env.CHAT_MODEL || "claude-sonnet-5";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".woff2": "font/woff2",
};

function safeJoin(base, target) {
  const p = path.normalize(path.join(base, target));
  if (!p.startsWith(base)) return null; // path-traversal guard
  return p;
}

function serveStatic(req, res) {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/") urlPath = "/public/index.html";
  else if (!urlPath.startsWith("/data/") && !urlPath.startsWith("/src/"))
    urlPath = "/public" + urlPath;

  const filePath = safeJoin(ROOT, urlPath);
  if (!filePath) {
    res.writeHead(403).end("Forbidden");
    return;
  }
  fs.readFile(filePath, (err, buf) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" }).end("Not found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(buf);
  });
}

async function handleChat(req, res) {
  let raw = "";
  req.on("data", (c) => (raw += c));
  req.on("end", async () => {
    let payload = {};
    try {
      payload = JSON.parse(raw || "{}");
    } catch {
      /* ignore */
    }
    const messages = Array.isArray(payload.messages) ? payload.messages : [];
    const system = payload.system || "You are the AI Chief of Staff for Hallelujah ONE.";

    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) {
      // Local fallback so the panel works with no key configured.
      const last = messages.filter((m) => m.role === "user").pop();
      const q = (last && last.content) || "";
      const text =
        "AI Chief of Staff (offline mode — no ANTHROPIC_API_KEY set).\n\n" +
        (q ? `You asked: "${q}"\n\n` : "") +
        "Set ANTHROPIC_API_KEY in your environment and restart to get live answers. " +
        "Today's priority order: 1) HUD CoC / Homeless Leadership Alliance, " +
        "2) CareerSource Pinellas, 3) Technology infrastructure partners.";
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ text }));
      return;
    }

    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({ model: MODEL, max_tokens: 1024, system, messages }),
      });
      const data = await r.json();
      if (!r.ok) {
        res.writeHead(r.status, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: data?.error?.message || "Upstream error" }));
        return;
      }
      const text = (data.content || []).map((b) => b.text || "").join("").trim();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ text: text || "(no reply)" }));
    } catch (e) {
      res.writeHead(502, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Could not reach the AI service: " + e.message }));
    }
  });
}

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/api/chat") return handleChat(req, res);
  if (req.method === "GET") return serveStatic(req, res);
  res.writeHead(405).end("Method not allowed");
});

server.listen(PORT, () => {
  console.log(`\n  Hallelujah ONE — Command Center`);
  console.log(`  Running at  http://localhost:${PORT}`);
  console.log(`  AI mode     ${process.env.ANTHROPIC_API_KEY ? "LIVE (" + MODEL + ")" : "offline (set ANTHROPIC_API_KEY for live)"}\n`);
});

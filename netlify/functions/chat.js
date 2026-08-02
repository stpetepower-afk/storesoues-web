/**
 * Netlify Function for the Hallelujah ONE assistant.
 * Exposed at /api/chat via the redirect in netlify.toml.
 * Shares its logic with the Vercel handler through src/lib/chatCore.js.
 */
const { generateReply } = require("../../src/lib/chatCore.js");

exports.handler = async (event) => {
  const headers = { "Content-Type": "application/json" };

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let body = {};
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    body = {};
  }

  try {
    const { text } = await generateReply({ system: body.system, messages: body.messages });
    return { statusCode: 200, headers, body: JSON.stringify({ text }) };
  } catch (err) {
    return {
      statusCode: (err && err.status) || 500,
      headers,
      body: JSON.stringify({ error: (err && err.message) || "Request failed" }),
    };
  }
};

/**
 * Reusable chat widget engine for Hallelujah Ministries assistants.
 * Non-streaming version (initial commit).
 * Usage: createChatWidget({ root, systemPrompt, greeting, endpoint, maxHistory, timeout })
 */
function createChatWidget({
  root,
  systemPrompt,
  greeting,
  endpoint = "/api/chat",
  maxHistory = 50,
  timeout = 30000, // ms
}) {
  const body = root.querySelector("[data-chat-body]");
  const input = root.querySelector("[data-chat-input]");
  const sendBtn = root.querySelector("[data-chat-send]");

  // Basic accessibility hints
  if (body) {
    body.setAttribute("role", "log");
    body.setAttribute("aria-live", "polite");
  }
  if (input && !input.getAttribute("aria-label")) {
    input.setAttribute("aria-label", "Message");
  }

  let history = [];
  let sending = false;

  function addMessage(role, text) {
    const el = document.createElement("div");
    el.className = "msg " + role;
    // Use textContent to avoid HTML injection
    el.textContent = text;
    // for accessibility: each message is an article within the log
    el.setAttribute("role", "article");
    el.setAttribute("aria-label", role === "assistant" ? "Assistant message" : "User message");
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
    return el;
  }

  function showTyping() {
    const el = document.createElement("div");
    el.className = "msg typing";
    el.setAttribute("data-typing", "1");
    // Build dots without innerHTML to avoid parsing issues
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement("span");
      dot.className = "typing-dot";
      dot.setAttribute("aria-hidden", "true");
      el.appendChild(dot);
    }
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
    return el;
  }

  function setSending(state) {
    sending = state;
    // update disable state of send button and input
    const shouldDisable = state || !input.value.trim();
    sendBtn.disabled = shouldDisable;
    sendBtn.setAttribute("aria-disabled", String(shouldDisable));
    input.disabled = state;
    if (state) {
      sendBtn.classList.add("sending");
      sendBtn.setAttribute("aria-busy", "true");
    } else {
      sendBtn.classList.remove("sending");
      sendBtn.removeAttribute("aria-busy");
    }
  }

  // initialize send button state
  setSending(false);

  async function send() {
    const text = input.value.trim();
    if (!text || sending) return;
    addMessage("user", text);
    history.push({ role: "user", content: text });

    // cap history to avoid huge payloads
    if (history.length > maxHistory * 2) {
      // keep the last maxHistory messages
      history = history.slice(-maxHistory * 2);
    }

    input.value = "";
    setSending(true);
    const typingEl = showTyping();

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ system: systemPrompt, messages: history }),
      });

      clearTimeout(timer);

      // handle non-2xx response
      if (!res.ok) {
        // try to extract json error or text
        let payload;
        try {
          payload = await res.json();
        } catch {
          payload = { error: await res.text().catch(() => res.statusText) };
        }
        throw new Error(payload?.error || `Request failed: ${res.status} ${res.statusText}`);
      }

      // try parsing JSON safely
      let data;
      try {
        data = await res.json();
      } catch {
        // fallback: treat body as text
        const textBody = await res.text().catch(() => null);
        data = { text: textBody || null };
      }

      typingEl.remove();

      const reply = (data && (data.text || data.error)) || "I'm having trouble connecting right now — please try again in a moment.";
      addMessage("assistant", reply);
      history.push({ role: "assistant", content: reply });
    } catch (err) {
      // AbortController aborts throw a DOMException, but we handle all errors gracefully
      if (typingEl && typingEl.parentNode) typingEl.remove();
      const fallback = "I'm having trouble connecting right now — please try again in a moment.";
      addMessage("assistant", err?.message ? `${fallback} (${err.message})` : fallback);
    } finally {
      clearTimeout(timer);
      setSending(false);
    }
  }

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });
  input.addEventListener("input", () => {
    sendBtn.disabled = sending || !input.value.trim();
    sendBtn.setAttribute("aria-disabled", String(sendBtn.disabled));
  });
  sendBtn.addEventListener("click", send);

  if (greeting) addMessage("assistant", greeting);

  return {
    addUserMessage: (text) => {
      input.value = text;
      // call send but don't await (keeps same behavior as original)
      send();
    },
    // optional accessors for testing
    _getHistory: () => history.slice(),
  };
}

// Export for CommonJS/ES module environments
if (typeof module !== 'undefined' && module.exports) module.exports = { createChatWidget };
export { createChatWidget };
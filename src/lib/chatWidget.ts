// TypeScript chat widget with SSE-first streaming, WebSocket fallback, and fetch fallback.
// Usage: createChatWidget({ root, systemPrompt, greeting, endpoint, streamEndpoint, wsEndpoint, maxHistory, timeout })

type Role = "user" | "assistant" | "system";

interface Message {
  role: Role;
  content: string;
}

interface CreateOptions {
  root: HTMLElement;
  systemPrompt?: string;
  greeting?: string;
  endpoint?: string; // non-streaming POST
  streamEndpoint?: string; // SSE/fetch streaming endpoint (POST returning text/event-stream)
  wsEndpoint?: string; // WebSocket URL for fallback
  maxHistory?: number;
  timeout?: number; // ms
}

export function createChatWidget({
  root,
  systemPrompt = "",
  greeting,
  endpoint = "/api/chat",
  streamEndpoint,
  wsEndpoint,
  maxHistory = 50,
  timeout = 30000,
}: CreateOptions) {
  const body = root.querySelector("[data-chat-body]") as HTMLElement;
  const input = root.querySelector("[data-chat-input]") as HTMLTextAreaElement | HTMLInputElement;
  const sendBtn = root.querySelector("[data-chat-send]") as HTMLButtonElement;

  if (!body || !input || !sendBtn) {
    throw new Error("createChatWidget: root must contain [data-chat-body], [data-chat-input], and [data-chat-send]");
  }

  // Accessibility
  body.setAttribute("role", "log");
  body.setAttribute("aria-live", "polite");
  if (!input.getAttribute("aria-label")) input.setAttribute("aria-label", "Message");

  let history: Message[] = [];
  let sending = false;

  function addMessage(role: Role, text: string) {
    const el = document.createElement("div");
    el.className = "msg " + role;
    el.textContent = text;
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

  function setSending(state: boolean) {
    sending = state;
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

  setSending(false);

  // Utility: safely append or replace assistant message content as it streams
  function renderAssistantChunk(el: HTMLElement | null, chunk: string) {
    if (!el) {
      addMessage("assistant", chunk);
      return null; // caller should get last message from DOM if needed
    }
    // append text
    el.textContent = (el.textContent || "") + chunk;
    body.scrollTop = body.scrollHeight;
    return el;
  }

  // Parse SSE event stream (text/event-stream) from a ReadableStream of Uint8Array
  async function parseSSEStream(stream: ReadableStream<Uint8Array>, onChunk: (chunk: string) => void) {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        // SSE events separated by "\n\n"
        let pos: number;
        while ((pos = buffer.indexOf("\n\n")) !== -1) {
          const raw = buffer.slice(0, pos);
          buffer = buffer.slice(pos + 2);
          // parse event lines
          const lines = raw.split(/\r?\n/);
          for (const line of lines) {
            if (line.startsWith("data:")) {
              const data = line.slice(5).trim();
              if (data) {
                onChunk(data);
              }
            }
          }
        }
      }
      // flush remaining buffer
      if (buffer.trim()) {
        const lines = buffer.split(/\r?\n/);
        for (const line of lines) {
          if (line.startsWith("data:")) {
            const data = line.slice(5).trim();
            if (data) onChunk(data);
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  // Try streaming via fetch expecting text/event-stream (SSE-like via POST)
  async function trySSEStreaming(messages: Message[], onChunk: (chunk: string) => void, signal: AbortSignal) {
    const url = streamEndpoint || (endpoint.replace(/\/*$/, "") + "/stream");
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
      body: JSON.stringify({ system: systemPrompt, messages }),
      signal,
    });

    if (!res.ok) throw new Error(`SSE stream request failed: ${res.status} ${res.statusText}`);

    const contentType = res.headers.get("content-type") || "";
    // treat as stream if content-type indicates event-stream or if body is a readable stream
    if (contentType.includes("text/event-stream") || !!(res.body && typeof res.body.getReader === "function")) {
      if (!res.body) throw new Error("No response body for SSE stream");
      await parseSSEStream(res.body, (data) => {
        // data may be JSON or plain text; try JSON parse for {chunk, done}
        try {
          const obj = JSON.parse(data);
          if (typeof obj === "string") onChunk(obj);
          else if (obj && typeof obj.chunk === "string") onChunk(obj.chunk);
          else if (obj && obj.text) onChunk(String(obj.text));
        } catch {
          onChunk(data);
        }
      });
      return true;
    }

    // Not a stream
    return false;
  }

  // Try WebSocket streaming: connect, send init message, listen for 'message' events
  function tryWebSocketStreaming(messages: Message[], onChunk: (chunk: string) => void, signal: AbortSignal): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!wsEndpoint) return resolve(false);

      let url = wsEndpoint;
      // if wsEndpoint is relative, convert to ws/wss
      try {
        const parsed = new URL(wsEndpoint, location.href);
        url = parsed.toString();
      } catch (e) {
        // ignore
      }

      let ws: WebSocket | null = null;
      try {
        ws = new WebSocket(url);
      } catch (err) {
        return resolve(false);
      }

      const onAbort = () => {
        if (ws && ws.readyState === WebSocket.OPEN) ws.close();
        cleanup();
        resolve(false);
      };

      const cleanup = () => {
        signal.removeEventListener("abort", onAbort);
        if (ws) {
          ws.onopen = null;
          ws.onmessage = null;
          ws.onerror = null;
          ws.onclose = null;
        }
      };

      signal.addEventListener("abort", onAbort);

      ws.onopen = () => {
        // send init
        const init = { type: "init", system: systemPrompt, messages };
        ws!.send(JSON.stringify(init));
      };

      ws.onmessage = (ev) => {
        try {
          const data = typeof ev.data === "string" ? ev.data : null;
          if (!data) return;
          // server may send JSON frames or plain text
          try {
            const obj = JSON.parse(data);
            if (obj && typeof obj.chunk === "string") onChunk(obj.chunk);
            else if (typeof obj === "string") onChunk(obj);
            else if (obj && obj.text) onChunk(String(obj.text));
            if (obj && obj.done) {
              cleanup();
              resolve(true);
            }
          } catch {
            onChunk(data);
          }
        } catch (err) {
          // ignore
        }
      };

      ws.onerror = () => {
        cleanup();
        resolve(false);
      };

      ws.onclose = () => {
        cleanup();
        resolve(true);
      };
    });
  }

  // Fallback non-streaming POST
  async function nonStreamingPost(messages: Message[], signal: AbortSignal) {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system: systemPrompt, messages }),
      signal,
    });
    if (!res.ok) throw new Error(`Request failed: ${res.status} ${res.statusText}`);
    const data = await res.json().catch(async () => {
      const text = await res.text().catch(() => "");
      return { text };
    });
    return data;
  }

  async function send() {
    const text = input.value.trim();
    if (!text || sending) return;
    addMessage("user", text);
    history.push({ role: "user", content: text });

    if (history.length > maxHistory * 2) history = history.slice(-maxHistory * 2);

    input.value = "";
    setSending(true);
    const typingEl = showTyping();

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    // insert a placeholder assistant message element so we can append to it
    const assistantEl = addMessage("assistant", "");
    // remove typing indicator
    if (typingEl && typingEl.parentNode) typingEl.remove();

    try {
      const messages = history.slice();

      // Try SSE streaming via fetch
      let streamed = false;
      try {
        streamed = await trySSEStreaming(messages, (chunk) => {
          renderAssistantChunk(assistantEl, chunk);
        }, controller.signal);
      } catch (err) {
        // treat as not streamed
        streamed = false;
      }

      if (!streamed) {
        // try websocket fallback
        const wsOk = await tryWebSocketStreaming(messages, (chunk) => {
          renderAssistantChunk(assistantEl, chunk);
        }, controller.signal);

        if (!wsOk) {
          // final fallback: non-streaming POST
          const data = await nonStreamingPost(messages, controller.signal);
          const reply = data?.text || data?.message || data?.error || "I'm having trouble connecting right now — please try again in a moment.";
          // replace assistantEl content
          if (assistantEl) assistantEl.textContent = reply;
          history.push({ role: "assistant", content: reply });
        } else {
          // wsOk indicates streaming already appended; finalize history from DOM
          history.push({ role: "assistant", content: assistantEl.textContent || "" });
        }
      } else {
        history.push({ role: "assistant", content: assistantEl.textContent || "" });
      }
    } catch (err) {
      if (assistantEl && assistantEl.parentNode) assistantEl.remove();
      const fallback = "I'm having trouble connecting right now — please try again in a moment.";
      addMessage("assistant", err?.message ? `${fallback} (${err.message})` : fallback);
    } finally {
      clearTimeout(timer);
      controller.abort();
      setSending(false);
    }
  }

  input.addEventListener("keydown", (e) => {
    if ((e as KeyboardEvent).key === "Enter" && !((e as KeyboardEvent).shiftKey)) {
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
    addUserMessage: (text: string) => {
      input.value = text;
      send();
    },
    _getHistory: () => history.slice(),
    _setStreamEndpoint: (url: string) => { streamEndpoint = url; },
    _setWsEndpoint: (url: string) => { wsEndpoint = url; },
  };
}

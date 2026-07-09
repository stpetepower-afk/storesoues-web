// TypeScript chat widget with SSE-first streaming, WebSocket fallback, and fetch fallback.
// Usage: createChatWidget({ root, systemPrompt, greeting, endpoint, streamEndpoint, wsEndpoint, maxHistory, timeout, headers, credentials })

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
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
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
  headers,
  credentials,
}: CreateOptions) {
  const body = root.querySelector("[data-chat-body]") as HTMLElement | null;
  const input = root.querySelector("[data-chat-input]") as HTMLTextAreaElement | HTMLInputElement | null;
  const sendBtn = root.querySelector("[data-chat-send]") as HTMLButtonElement | null;

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
  // Returns true if a {done:true} marker was received
  async function parseSSEStream(stream: ReadableStream<Uint8Array>, onChunk: (chunk: string) => void): Promise<boolean> {
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
          // parse event lines and collect data: lines
          const lines = raw.split(/\r?\n/);
          const dataLines: string[] = [];
          const otherLines: string[] = [];
          for (const line of lines) {
            if (line.startsWith("data:")) dataLines.push(line.slice(5));
            else if (line.trim() !== "") otherLines.push(line.trim());
          }

          if (dataLines.length > 0) {
            const joined = dataLines.join("\n").trim();
            if (joined) {
              // try JSON parse for {chunk, done}
              try {
                const obj = JSON.parse(joined);
                if (typeof obj === "string") onChunk(obj);
                else if (obj && typeof (obj as any).chunk === "string") onChunk((obj as any).chunk);
                else if (obj && (obj as any).text) onChunk(String((obj as any).text));
                if (obj && (obj as any).done) return true;
              } catch {
                onChunk(joined);
              }
            }
          } else if (otherLines.length > 0) {
            // treat each non-empty line as NDJSON or plain chunk
            for (const l of otherLines) {
              try {
                const obj = JSON.parse(l);
                if (typeof obj === "string") onChunk(obj);
                else if (obj && typeof (obj as any).chunk === "string") onChunk((obj as any).chunk);
                else if (obj && (obj as any).text) onChunk(String((obj as any).text));
                if (obj && (obj as any).done) return true;
              } catch {
                onChunk(l);
              }
            }
          }
        }
      }

      // flush remaining buffer
      if (buffer.trim()) {
        const lines = buffer.split(/\r?\n/);
        for (const line of lines) {
          if (!line.trim()) continue;
          if (line.startsWith("data:")) {
            const data = line.slice(5).trim();
            if (data) {
              try {
                const obj = JSON.parse(data);
                if (typeof obj === "string") onChunk(obj);
                else if (obj && typeof (obj as any).chunk === "string") onChunk((obj as any).chunk);
                else if (obj && (obj as any).text) onChunk(String((obj as any).text));
                if (obj && (obj as any).done) return true;
              } catch {
                onChunk(data);
              }
            }
          } else {
            // NDJSON style
            try {
              const obj = JSON.parse(line);
              if (typeof obj === "string") onChunk(obj);
              else if (obj && typeof (obj as any).chunk === "string") onChunk((obj as any).chunk);
              else if (obj && (obj as any).text) onChunk(String((obj as any).text));
              if (obj && (obj as any).done) return true;
            } catch {
              onChunk(line);
            }
          }
        }
      }

      return false;
    } finally {
      try { reader.releaseLock(); } catch (e) { /* ignore */ }
    }
  }

  // Try streaming via fetch expecting text/event-stream (SSE-like via POST)
  async function trySSEStreaming(messages: Message[], onChunk: (chunk: string) => void, signal: AbortSignal): Promise<boolean> {
    const url = streamEndpoint || (endpoint.replace(/\/*$/, "") + "/stream");
    const fetchOpts: RequestInit = {
      method: "POST",
      headers: Object.assign({ "Content-Type": "application/json", Accept: "text/event-stream" }, headers || {}),
      body: JSON.stringify({ system: systemPrompt, messages }),
      signal,
      credentials,
    };

    const res = await fetch(url, fetchOpts);

    if (!res.ok) throw new Error(`SSE stream request failed: ${res.status} ${res.statusText}`);

    const contentType = (res.headers.get("content-type") || "").toLowerCase();
    // treat as stream if content-type indicates event-stream or if body is a readable stream
    if (contentType.includes("text/event-stream") || !!(res.body && typeof (res.body as any).getReader === "function")) {
      if (!res.body) throw new Error("No response body for SSE stream");
      const doneSeen = await parseSSEStream(res.body, (data) => {
        try {
          const obj = JSON.parse(data);
          if (typeof obj === "string") onChunk(obj);
          else if (obj && typeof (obj as any).chunk === "string") onChunk((obj as any).chunk);
          else if (obj && (obj as any).text) onChunk(String((obj as any).text));
        } catch {
          onChunk(data);
        }
      });
      return !!doneSeen;
    }

    // Not a stream
    return false;
  }

  // Try WebSocket streaming: connect, send init message, listen for 'message' events
  function tryWebSocketStreaming(messages: Message[], onChunk: (chunk: string) => void, signal: AbortSignal): Promise<boolean> {
    return new Promise((resolve) => {
      if (!wsEndpoint) return resolve(false);

      let url = wsEndpoint;
      // if wsEndpoint is relative, convert to ws/wss based on current location
      try {
        const parsed = new URL(wsEndpoint, location.href);
        // build ws/wss based on page protocol
        if (parsed.protocol === 'http:') parsed.protocol = 'ws:';
        else if (parsed.protocol === 'https:') parsed.protocol = 'wss:';
        url = parsed.toString();
      } catch (e) {
        // ignore and use wsEndpoint as-is
      }

      let ws: WebSocket | null = null;
      try {
        ws = new WebSocket(url);
      } catch (err) {
        return resolve(false);
      }

      let gotChunk = false;

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
        try { ws!.send(JSON.stringify(init)); } catch (e) { /* ignore send errors */ }
      };

      ws.onmessage = (ev) => {
        try {
          const data = typeof ev.data === "string" ? ev.data : null;
          if (!data) return;
          // server may send JSON frames or plain text
          try {
            const obj = JSON.parse(data);
            if (obj && typeof (obj as any).chunk === "string") { gotChunk = true; onChunk((obj as any).chunk); }
            else if (typeof obj === "string") { gotChunk = true; onChunk(obj as unknown as string); }
            else if (obj && (obj as any).text) { gotChunk = true; onChunk(String((obj as any).text)); }
            if (obj && (obj as any).done) {
              cleanup();
              resolve(true);
            }
          } catch {
            gotChunk = true;
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
        // success only if we received at least one chunk
        resolve(gotChunk);
      };
    });
  }

  // Fallback non-streaming POST
  async function nonStreamingPost(messages: Message[], signal: AbortSignal) {
    const fetchOpts: RequestInit = {
      method: "POST",
      headers: Object.assign({ "Content-Type": "application/json" }, headers || {}),
      body: JSON.stringify({ system: systemPrompt, messages }),
      signal,
      credentials,
    };
    const res = await fetch(endpoint, fetchOpts);
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
    } catch (err: any) {
      if (assistantEl && assistantEl.parentNode) assistantEl.remove();
      const fallback = "I'm having trouble connecting right now — please try again in a moment.";
      addMessage("assistant", err && err.message ? `${fallback} (${String(err.message)})` : fallback);
    } finally {
      clearTimeout(timer);
      try { controller.abort(); } catch (e) { /* ignore */ }
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

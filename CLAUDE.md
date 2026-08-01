# CLAUDE.md

Guidance for AI assistants working in this repository.

## Project overview

`storesoues-web` is a web project for **Hallelujah Ministries** assistants. At
present the repository contains a single reusable front-end module: a
non-streaming chat widget engine. There is no build system, package manifest,
dependency tree, or test suite yet — the codebase is intentionally minimal and
framework-agnostic.

## Repository structure

```
src/
  lib/
    chatWidget.js   # Reusable chat widget engine (the only source file)
```

## The chat widget (`src/lib/chatWidget.js`)

A single factory function, `createChatWidget(options)`, that wires a set of
existing DOM elements into a working chat UI. It is dependency-free vanilla
JavaScript and ships with both a CommonJS export and an ES module `export`, so
it works when `require`d, imported, or dropped in via a bundler.

### Public API

```js
const widget = createChatWidget({
  root,                    // required: container element holding the markup below
  systemPrompt,            // system prompt sent to the backend with each request
  greeting,                // optional: assistant message shown on load
  endpoint = "/api/chat",  // POST endpoint the widget calls
  maxHistory = 50,         // max conversation turns kept (capped at maxHistory*2 messages)
  timeout = 30000,         // per-request timeout in ms (via AbortController)
});

widget.addUserMessage(text); // programmatically submit a message
widget._getHistory();        // returns a copy of the message history (test helper)
```

### Required DOM contract

`root` must contain three elements identified by `data-*` attributes. All three
are required — the widget queries them at construction and will throw if any is
missing (`[data-chat-input]`/`[data-chat-send]` are dereferenced immediately by
`setSending`; `[data-chat-body]` is dereferenced by `addMessage`/`showTyping`,
which run as soon as a `greeting` is shown or the first message is sent):

- `[data-chat-body]`  — message log container (messages are appended here)
- `[data-chat-input]` — text input the user types into
- `[data-chat-send]`  — send button

### Backend contract

- **Request:** `POST {endpoint}` with JSON body
  `{ system: systemPrompt, messages: history }`, where `history` is an array of
  `{ role: "user" | "assistant", content: string }`.
- **Response:** JSON `{ text: string }` for a successful reply, or
  `{ error: string }` for an error. Non-JSON responses fall back to raw text.
- On non-2xx, network failure, or timeout, the widget appends a graceful
  fallback assistant message rather than throwing to the caller.

## Conventions to follow

These patterns are established in `chatWidget.js` — preserve them in any new code
that touches the widget:

- **No HTML injection.** Render user/assistant text with `textContent` and build
  DOM nodes with `createElement`/`appendChild` — never `innerHTML`. This is a
  deliberate XSS-safety measure; do not regress it.
- **Accessibility first.** The widget sets ARIA roles (`log`, `article`),
  `aria-live="polite"`, `aria-label`, `aria-disabled`, and `aria-busy`. Keep
  these attributes correct when adding or changing UI.
- **Graceful degradation.** All network paths (bad status, parse failure, abort,
  timeout) resolve to a user-facing fallback message; errors are never allowed to
  surface as an unhandled rejection.
- **History is bounded.** History is trimmed to the last `maxHistory * 2`
  messages to keep request payloads small — retain this cap.
- **Vanilla, dependency-free, dual-module.** No frameworks or build step are
  assumed. Keep the file usable as CommonJS *and* ESM (both export lines at the
  bottom).
- **Styling is external.** The widget only sets class names (`msg`,
  `msg user`, `msg assistant`, `typing`, `typing-dot`, `sending`); it ships no
  CSS. Consuming pages provide the styles.

## Development workflow

There is no package manager, linter, or test runner configured. To exercise the
widget, embed it in an HTML page that provides the required DOM contract and a
`/api/chat` endpoint (or a mock).

When adding tooling (tests, bundling, linting), introduce it explicitly and
document it here — do not assume any exists.

## Git workflow

- Branch from `main`; do not commit directly to `main`.
- Keep commit messages clear and descriptive (see the existing history style,
  e.g. `initial commit: add non-streaming chat widget`).
- The commit history notes this is the "non-streaming version (initial commit)";
  a streaming variant is an anticipated direction — keep the request/response
  contract above in mind if you add one.

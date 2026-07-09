Summary

- Adds a TypeScript chat widget (src/lib/chatWidget.ts) that prefers SSE streaming (POST -> /api/chat/stream by default), falls back to WebSocket, then to a non-streaming POST.
- Renders assistant output incrementally, caps history, supports abort/timeouts, and includes accessibility improvements.
- Adds an auth helper (bearerToken) and support for custom headers/credentials.
- Adds tests, tsconfig, Jest config, and a GitHub Actions workflow that runs typecheck + tests on the feature branch.

Files of note

- src/lib/chatWidget.ts — TypeScript widget (SSE -> WS -> fetch fallback)
- src/lib/chatWidget.test.ts — Jest tests for non-streaming fallback
- tsconfig.json, jest.config.js, package.json (devDeps)
- CHANGELOG.md
- .github/workflows/ci.yml — runs npx tsc and npm test

Auth & endpoints

- Non-stream POST: endpoint (default /api/chat)
- SSE stream: streamEndpoint or default endpoint + /stream (POST returning text/event-stream)
- WebSocket fallback: wsEndpoint (relative URLs converted to ws/wss; bearerToken appended as access_token query param if provided)
- Auth helper:
  - bearerToken?: string will set Authorization: Bearer <token> for fetch requests (unless Authorization header is explicitly provided).
  - For WebSocket fallback, bearerToken is appended as access_token=<token> to the ws/wss URL if not present.
  - You can also pass headers: Record<string,string> and credentials: RequestCredentials.

How to test locally

1) git fetch origin
2) git checkout feature/chat-streaming-ts-sse
3) npm ci
4) npx tsc --noEmit
5) npm test

Manual streaming checks

- Start a server that serves text/event-stream at /api/chat/stream sending events like:
    data: {"chunk":"Hello"}\n\n
    data: {"chunk":" world","done":true}\n\n
  The widget should append tokens as they arrive.
- WebSocket fallback: server should accept an init frame { type: 'init', system, messages } and send frames { chunk:'...' } and { done:true }.

Notes / Caveats

- If your streaming endpoints are cross-origin, ensure CORS allows the requests and credentials as needed.
- Appending tokens in WS query params can expose them in logs; prefer Authorization headers or cookies if possible. If you want alternate WS auth (subprotocol or initial auth frame), I can add that.
- CI: the branch includes a GitHub Actions workflow that will run typecheck and tests once the PR is opened.

Checklist before merging (recommended)

- Verify server streaming endpoints and CORS/auth behavior.
- Run npx tsc and npm test in your environment.
- Optionally add more tests for SSE/WS flows or an example HTML page demonstrating usage.

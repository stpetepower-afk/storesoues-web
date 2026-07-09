import { createChatWidget } from './chatWidget';

// Basic DOM setup using jsdom (Jest environment provides document)
function makeRoot() {
  const root = document.createElement('div');
  const body = document.createElement('div'); body.setAttribute('data-chat-body', '');
  const input = document.createElement('textarea'); input.setAttribute('data-chat-input', '');
  const button = document.createElement('button'); button.setAttribute('data-chat-send', '');
  root.appendChild(body);
  root.appendChild(input);
  root.appendChild(button);
  document.body.appendChild(root);
  return root as HTMLElement;
}

// Mock fetch for non-streaming test
describe('chatWidget non-streaming fallback', () => {
  beforeEach(() => {
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ text: 'Hello from server' }),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    document.body.innerHTML = '';
  });

  test('sends message and receives non-streaming reply', async () => {
    const root = makeRoot();
    const widget = createChatWidget({ root, endpoint: '/api/chat' });
    widget.addUserMessage('Hi');

    // wait a tick for async send to complete
    await new Promise((r) => setTimeout(r, 10));

    const history = widget._getHistory();
    expect(history.length).toBeGreaterThanOrEqual(2);
    expect(history[history.length - 1].role).toBe('assistant');
    expect(history[history.length - 1].content).toContain('Hello from server');
  });
});

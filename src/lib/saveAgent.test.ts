import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import { saveAgent } from './saveAgent';
import { AgentConfig } from '../../types';

const config: AgentConfig = {
  name: 'Bot',
  description: 'd',
  primaryColor: '#000',
  greeting: 'hi',
  tone: 'friendly',
  quickQuestions: [],
};

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe('saveAgent', () => {
  it('POSTs config and knowledge and returns the chat URL', async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
      calls.push({ url: String(url), init });
      return new Response(JSON.stringify({ agentId: 'abc', url: '/chat/abc' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }) as typeof fetch;

    const result = await saveAgent(config, [], 'abc');
    assert.equal(result.agentId, 'abc');
    assert.equal(result.url, '/chat/abc');
    assert.equal(calls[0]?.url, '/api/agent');
    assert.equal(calls[0]?.init?.method, 'POST');
    const body = JSON.parse(String(calls[0]?.init?.body));
    assert.equal(body.agentId, 'abc');
    assert.equal(body.config.name, 'Bot');
  });

  it('throws the server error message on failure', async () => {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ error: 'Sign in required to save an agent' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })) as typeof fetch;

    await assert.rejects(() => saveAgent(config, []), /Sign in required/);
  });

  it('throws when the response has no chat URL', async () => {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })) as typeof fetch;

    await assert.rejects(() => saveAgent(config, []), /no agent URL/);
  });
});

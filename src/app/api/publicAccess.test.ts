import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { handleChat, handleChatHistory } from './chat/route';
import { handleCrawl } from './crawl/route';
import { handleCreateAgent } from './agent/route';
import { IAgentRepository } from '../../domain/interfaces/IAgentRepository';
import { ILLMService } from '../../domain/interfaces/ILLMService';

const agentRepo: IAgentRepository = {
  async save() {},
  async getById() {
    return null;
  },
  async listByUser() {
    return [];
  },
};

const llm: ILLMService = {
  async chat() {
    return (async function* () {
      yield 'ok';
    })();
  },
  async clean(text: string) {
    return text;
  },
};

describe('public chat and crawl access', () => {
  it('rate-limits chat posts and history reads', async () => {
    const rateLimit = { allow: () => false };
    const post = await handleChat(
      new Request('http://localhost/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-forwarded-for': '203.0.113.9' },
        body: JSON.stringify({ message: 'Hi' }),
      }),
      { repository: agentRepo, llm, rateLimit }
    );
    assert.equal(post.status, 429);
    assert.match((await post.json()).error, /Too many messages/);

    const history = await handleChatHistory(
      new Request('http://localhost/api/chat?agentId=agent-1', {
        headers: { 'x-forwarded-for': '203.0.113.9' },
      }),
      { repository: agentRepo, llm, rateLimit }
    );
    assert.equal(history.status, 429);
  });

  it('rejects anonymous crawl and still requires sign-in to create an agent', async () => {
    const crawl = await handleCrawl(new Request('http://localhost/api/crawl', { method: 'POST' }), {
      getUser: async () => null,
    });
    assert.equal(crawl.status, 401);
    assert.match((await crawl.json()).error, /Sign in required/);

    const create = await handleCreateAgent(
      new Request('http://localhost/api/agent', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ config: { name: 'A' }, knowledge: [] }),
      }),
      { getUser: async () => null, repository: agentRepo }
    );
    assert.equal(create.status, 401);
  });

  it('asks for a URL after the visitor is signed in', async () => {
    const crawl = await handleCrawl(
      new Request('http://localhost/api/crawl', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
      }),
      { getUser: async () => ({ id: 'user-1' }) }
    );
    assert.equal(crawl.status, 400);
  });
});

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isUuid } from '../../application/use-cases/CreateAgentUseCase';
import { Agent, AgentConfig } from '../../domain/entities/Agent';
import { IAgentRepository } from '../../domain/interfaces/IAgentRepository';
import { ILLMService } from '../../domain/interfaces/ILLMService';
import { handleCreateAgent } from './agent/route';
import { GET as getAgent } from './agent/[id]/route';
import { handleChat } from './chat/route';

const config: AgentConfig = {
  name: 'Support',
  description: 'Help',
  primaryColor: '#000',
  greeting: 'Hi',
  tone: 'friendly',
  quickQuestions: [],
};

class MemoryRepo implements IAgentRepository {
  agent: Agent | null = null;
  async save(agent: Agent): Promise<void> {
    this.agent = agent;
  }
  async getById(id: string): Promise<Agent | null> {
    if (!this.agent || this.agent.id !== id) return null;
    return this.agent;
  }
  async listByUser() {
    return [];
  }
}

function jsonRequest(path: string, body: unknown) {
  return new Request(`http://localhost${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const streamingLlm: ILLMService = {
  async clean(text) {
    return text;
  },
  async chat() {
    return (async function* () {
      yield 'Hello';
      yield ' world';
    })();
  },
};

describe('ship loop routes', () => {
  it('creates an agent for the signed-in user and returns a chat URL', async () => {
    const repo = new MemoryRepo();
    const response = await handleCreateAgent(
      jsonRequest('/api/agent', { config, knowledge: [] }),
      { getUser: async () => ({ id: 'user-1' }), repository: repo },
    );
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.success, true);
    assert.equal(isUuid(body.agentId), true);
    assert.equal(body.url, `/chat/${body.agentId}`);
    assert.equal(repo.agent?.id, body.agentId);
  });

  it('rejects create when the session is missing', async () => {
    const response = await handleCreateAgent(
      jsonRequest('/api/agent', { config, knowledge: [] }),
      { getUser: async () => null, repository: new MemoryRepo() },
    );
    assert.equal(response.status, 401);
  });

  it('rejects a non-UUID agent id', async () => {
    const response = await handleCreateAgent(
      jsonRequest('/api/agent', { config, knowledge: [], agentId: 'abcd' }),
      { getUser: async () => ({ id: 'user-1' }), repository: new MemoryRepo() },
    );
    assert.equal(response.status, 400);
    const body = await response.json();
    assert.match(body.error, /UUID/);
  });

  it('returns a saved agent by id and 404 when it is missing', async () => {
    const repo = new MemoryRepo();
    const saved: Agent = {
      id: '11111111-1111-4111-8111-111111111111',
      config,
      knowledge: [],
      createdAt: 1,
    };
    await repo.save(saved);

    const found = await getAgent(
      new Request('http://localhost/api/agent/11111111-1111-4111-8111-111111111111'),
      { params: Promise.resolve({ id: saved.id }) },
      { repository: repo },
    );
    assert.equal(found.status, 200);
    assert.equal((await found.json()).id, saved.id);

    const missing = await getAgent(
      new Request('http://localhost/api/agent/missing'),
      { params: Promise.resolve({ id: '22222222-2222-4222-8222-222222222222' }) },
      { repository: repo },
    );
    assert.equal(missing.status, 404);
  });

  it('streams a mocked LLM reply for a saved agent', async () => {
    const repo = new MemoryRepo();
    const saved: Agent = {
      id: '11111111-1111-4111-8111-111111111111',
      config,
      knowledge: [],
      createdAt: 1,
    };
    await repo.save(saved);

    const response = await handleChat(
      jsonRequest('/api/chat', { agentId: saved.id, message: 'What are your hours?' }),
      { repository: repo, llm: streamingLlm },
    );
    assert.equal(response.status, 200);
    assert.match(response.headers.get('Content-Type') ?? '', /text\/plain/);
    assert.equal(await response.text(), 'Hello world');
  });

  it('rejects chat without a message', async () => {
    const response = await handleChat(
      jsonRequest('/api/chat', { agentId: '11111111-1111-4111-8111-111111111111' }),
      { repository: new MemoryRepo(), llm: streamingLlm },
    );
    assert.equal(response.status, 400);
  });
});

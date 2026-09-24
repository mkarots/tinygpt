import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Agent, AgentConfig } from '../../../domain/entities/Agent';
import { IAgentRepository } from '../../../domain/interfaces/IAgentRepository';
import { IChatRepository, StoredChat, StoredMessage } from '../../../domain/interfaces/IChatRepository';
import { ILLMService } from '../../../domain/interfaces/ILLMService';
import { CHAT_SESSION_COOKIE } from '../../../lib/chatSession';
import { handleChat, handleChatHistory } from './route';

const config: AgentConfig = {
  name: 'Support',
  description: 'Help',
  primaryColor: '#000',
  greeting: 'Hi',
  tone: 'friendly',
  quickQuestions: [],
};

const agent: Agent = {
  id: '11111111-1111-4111-8111-111111111111',
  config,
  knowledge: [],
  createdAt: 1,
};

class MemoryRepo implements IAgentRepository {
  async save(): Promise<void> {}
  async getById(id: string) {
    return id === agent.id ? agent : null;
  }
  async listByUser() {
    return [];
  }
}

class MemoryChats implements IChatRepository {
  chats: StoredChat[] = [];
  messages: (StoredMessage & { chatId: string })[] = [];

  async findByAgentAndSession(agentId: string, sessionId: string) {
    return this.chats.find((chat) => chat.agentId === agentId && chat.sessionId === sessionId) ?? null;
  }

  async create(agentId: string, sessionId: string) {
    const chat = { id: `chat-${this.chats.length + 1}`, agentId, sessionId };
    this.chats.push(chat);
    return chat;
  }

  async appendMessage(chatId: string, role: 'user' | 'model', content: string) {
    this.messages.push({
      id: `m-${this.messages.length + 1}`,
      chatId,
      role,
      text: content.trim(),
      createdAt: this.messages.length,
    });
  }

  async listMessages(chatId: string) {
    return this.messages.filter((message) => message.chatId === chatId);
  }
}

const llm: ILLMService = {
  async clean(text) {
    return text;
  },
  async chat() {
    return (async function* () {
      yield 'Saved';
    })();
  },
};

function post(body: unknown, cookie?: string) {
  return new Request('http://localhost/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify(body),
  });
}

describe('hosted chat persistence', () => {
  it('creates a session cookie and restores the thread for that session', async () => {
    const chats = new MemoryChats();
    const deps = {
      repository: new MemoryRepo(),
      llm,
      chats,
      createSessionId: () => 'session-abc',
    };

    const response = await handleChat(post({ agentId: agent.id, message: 'Hello' }), deps);
    assert.equal(await response.text(), 'Saved');
    assert.match(response.headers.get('set-cookie') ?? '', new RegExp(`${CHAT_SESSION_COOKIE}=session-abc`));
    assert.equal(response.headers.get('X-Chat-Session'), 'session-abc');
    assert.equal(chats.chats.length, 1);

    const restored = await handleChatHistory(
      new Request(`http://localhost/api/chat?agentId=${agent.id}`, {
        headers: { cookie: `${CHAT_SESSION_COOKIE}=session-abc` },
      }),
      deps
    );
    assert.equal(restored.status, 200);
    const body = await restored.json();
    assert.equal(body.sessionId, 'session-abc');
    assert.deepEqual(
      body.messages.map((message: { role: string; text: string }) => message.text),
      ['Hello', 'Saved']
    );
  });

  it('restores a thread addressed by the session query', async () => {
    const chats = new MemoryChats();
    await chats.create(agent.id, 'query-session');
    await chats.appendMessage('chat-1', 'user', 'Ping');

    const restored = await handleChatHistory(
      new Request(`http://localhost/api/chat?agentId=${agent.id}&session=query-session`),
      { repository: new MemoryRepo(), llm, chats }
    );
    const body = await restored.json();
    assert.equal(body.messages[0].text, 'Ping');
  });

  it('does not save a preview chat', async () => {
    const chats = new MemoryChats();
    const response = await handleChat(
      post({ message: 'Hello', config, knowledge: [] }),
      { repository: new MemoryRepo(), llm, chats, createSessionId: () => 'session-abc' }
    );
    assert.equal(await response.text(), 'Saved');
    assert.equal(response.headers.get('X-Chat-Session'), null);
    assert.equal(chats.chats.length, 0);
  });

  it('returns an empty thread when the visitor has no session', async () => {
    const restored = await handleChatHistory(
      new Request(`http://localhost/api/chat?agentId=${agent.id}`),
      { repository: new MemoryRepo(), llm, chats: new MemoryChats() }
    );
    assert.deepEqual(await restored.json(), { sessionId: null, messages: [] });
  });
});

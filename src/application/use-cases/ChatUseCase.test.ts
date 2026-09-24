import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Agent, AgentConfig } from '../../domain/entities/Agent';
import { KnowledgeItem } from '../../domain/entities/KnowledgeSource';
import { ChatTurn } from '../../domain/entities/Chat';
import { IAgentRepository } from '../../domain/interfaces/IAgentRepository';
import { IChatRepository, StoredChat, StoredMessage } from '../../domain/interfaces/IChatRepository';
import { ILLMService } from '../../domain/interfaces/ILLMService';
import { ChatUseCase } from './ChatUseCase';

const config: AgentConfig = {
  name: 'Bot',
  description: 'd',
  primaryColor: '#000',
  greeting: 'hi',
  tone: 'friendly',
  quickQuestions: [],
};

const knowledge: KnowledgeItem[] = [
  {
    id: 'k1',
    type: 'text',
    name: 'FAQ',
    content: 'Hours are 9-5',
    status: 'active',
    dateAdded: 1,
  },
];

class MemoryRepo implements IAgentRepository {
  constructor(private agent: Agent | null) {}
  async save(): Promise<void> {}
  async getById(id: string): Promise<Agent | null> {
    if (!this.agent || this.agent.id !== id) return null;
    return this.agent;
  }
  async listByUser(): Promise<[]> {
    return [];
  }
}

class RecordingLLM implements ILLMService {
  public last?: {
    message: string;
    knowledge: KnowledgeItem[];
    config: AgentConfig;
    history: ChatTurn[];
  };

  async clean(text: string): Promise<string> {
    return text;
  }

  async chat(
    message: string,
    knowledgeItems: KnowledgeItem[],
    agentConfig: AgentConfig,
    history: ChatTurn[] = []
  ): Promise<AsyncIterable<string>> {
    this.last = { message, knowledge: knowledgeItems, config: agentConfig, history };
    async function* empty() {}
    return empty();
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
      createdAt: this.messages.length + 1,
    });
  }

  async listMessages(chatId: string) {
    return this.messages.filter((message) => message.chatId === chatId);
  }
}

class YieldingLLM extends RecordingLLM {
  async chat(
    message: string,
    knowledgeItems: KnowledgeItem[],
    agentConfig: AgentConfig,
    history: ChatTurn[] = []
  ): Promise<AsyncIterable<string>> {
    this.last = { message, knowledge: knowledgeItems, config: agentConfig, history };
    return (async function* () {
      yield 'Hello';
      yield ' there';
    })();
  }
}

describe('ChatUseCase', () => {
  it('loads the agent and forwards full knowledge plus history', async () => {
    const agent: Agent = { id: 'a1', config, knowledge, createdAt: 1 };
    const llm = new RecordingLLM();
    const useCase = new ChatUseCase(new MemoryRepo(agent), llm);
    const history: ChatTurn[] = [{ role: 'user', text: 'hi' }, { role: 'model', text: 'hello' }];

    await useCase.execute('a1', 'What are your hours?', history);

    assert.equal(llm.last?.message, 'What are your hours?');
    assert.deepEqual(llm.last?.knowledge, knowledge);
    assert.equal(llm.last?.config.name, 'Bot');
    assert.deepEqual(llm.last?.history, history);
  });

  it('throws when the agent is missing', async () => {
    const useCase = new ChatUseCase(new MemoryRepo(null), new RecordingLLM());
    await assert.rejects(() => useCase.execute('missing', 'hi'), /not found/);
  });

  it('preview chats without loading a saved agent', async () => {
    const llm = new RecordingLLM();
    const chats = new MemoryChats();
    const useCase = new ChatUseCase(new MemoryRepo(null), llm, chats);
    await useCase.executePreview(config, knowledge, 'hello', []);
    assert.equal(llm.last?.message, 'hello');
    assert.deepEqual(llm.last?.knowledge, knowledge);
    assert.equal(chats.chats.length, 0);
    assert.equal(chats.messages.length, 0);
  });

  it('creates a chat on the first hosted message and stores both turns', async () => {
    const agent: Agent = { id: 'a1', config, knowledge, createdAt: 1 };
    const chats = new MemoryChats();
    const llm = new YieldingLLM();
    const useCase = new ChatUseCase(new MemoryRepo(agent), llm, chats);

    const stream = await useCase.execute('a1', 'Hours?', [], { sessionId: 'session-1' });
    let reply = '';
    for await (const chunk of stream) reply += chunk;

    assert.equal(reply, 'Hello there');
    assert.equal(chats.chats.length, 1);
    assert.equal(chats.chats[0].agentId, 'a1');
    assert.equal(chats.chats[0].sessionId, 'session-1');
    assert.deepEqual(
      chats.messages.map((message) => ({ role: message.role, text: message.text })),
      [
        { role: 'user', text: 'Hours?' },
        { role: 'model', text: 'Hello there' },
      ]
    );
    assert.deepEqual(llm.last?.history, []);
  });

  it('reuses the same chat and feeds stored turns back to the model', async () => {
    const agent: Agent = { id: 'a1', config, knowledge, createdAt: 1 };
    const chats = new MemoryChats();
    const llm = new YieldingLLM();
    const useCase = new ChatUseCase(new MemoryRepo(agent), llm, chats);

    for await (const _chunk of await useCase.execute('a1', 'Hours?', [], { sessionId: 'session-1' })) {
      void _chunk;
    }
    for await (const _chunk of await useCase.execute('a1', 'Thanks', [], { sessionId: 'session-1' })) {
      void _chunk;
    }

    assert.equal(chats.chats.length, 1);
    assert.deepEqual(llm.last?.history, [
      { role: 'user', text: 'Hours?' },
      { role: 'model', text: 'Hello there' },
    ]);
  });

  it('does not write a chat when no session id is present', async () => {
    const agent: Agent = { id: 'a1', config, knowledge, createdAt: 1 };
    const chats = new MemoryChats();
    const llm = new RecordingLLM();
    const useCase = new ChatUseCase(new MemoryRepo(agent), llm, chats);
    await useCase.execute('a1', 'Hi');
    assert.equal(chats.chats.length, 0);
  });
});

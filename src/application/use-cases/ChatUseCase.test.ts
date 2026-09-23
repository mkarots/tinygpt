import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Agent, AgentConfig } from '../../domain/entities/Agent';
import { KnowledgeItem } from '../../domain/entities/KnowledgeSource';
import { ChatTurn } from '../../domain/entities/Chat';
import { IAgentRepository } from '../../domain/interfaces/IAgentRepository';
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
    const useCase = new ChatUseCase(new MemoryRepo(null), llm);
    await useCase.executePreview(config, knowledge, 'hello', []);
    assert.equal(llm.last?.message, 'hello');
    assert.deepEqual(llm.last?.knowledge, knowledge);
  });
});

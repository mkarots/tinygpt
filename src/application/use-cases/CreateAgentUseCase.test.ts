import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Agent } from '../../domain/entities/Agent';
import { IAgentRepository } from '../../domain/interfaces/IAgentRepository';
import { CreateAgentUseCase, MAX_KNOWLEDGE_CHARS } from './CreateAgentUseCase';

const config = {
  name: 'Bot',
  description: 'd',
  primaryColor: '#000',
  greeting: 'hi',
  tone: 'friendly' as const,
  quickQuestions: [{ text: 'Q', emoji: '?' }],
};

class MemoryRepo implements IAgentRepository {
  public saved: Agent | null = null;
  async save(agent: Agent): Promise<void> {
    this.saved = agent;
  }
  async getById(): Promise<Agent | null> {
    return this.saved;
  }
}

describe('CreateAgentUseCase', () => {
  it('assigns a UUID when no id is provided', async () => {
    const repo = new MemoryRepo();
    const useCase = new CreateAgentUseCase(repo, () => '11111111-1111-4111-8111-111111111111');
    const agent = await useCase.execute(config, []);
    assert.equal(agent.id, '11111111-1111-4111-8111-111111111111');
    assert.equal(repo.saved?.id, agent.id);
  });

  it('reuses an existing id on update', async () => {
    const repo = new MemoryRepo();
    const useCase = new CreateAgentUseCase(repo, () => 'should-not-run');
    const agent = await useCase.execute(config, [], '22222222-2222-4222-8222-222222222222');
    assert.equal(agent.id, '22222222-2222-4222-8222-222222222222');
  });

  it('rejects knowledge over the character cap', async () => {
    const repo = new MemoryRepo();
    const useCase = new CreateAgentUseCase(repo);
    const huge = {
      id: 'k1',
      type: 'text' as const,
      name: 'big',
      content: 'a'.repeat(MAX_KNOWLEDGE_CHARS + 1),
      status: 'active' as const,
      dateAdded: Date.now(),
    };
    await assert.rejects(() => useCase.execute(config, [huge]), /too large/);
    assert.equal(repo.saved, null);
  });
});

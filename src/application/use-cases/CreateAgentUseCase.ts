import { IAgentRepository } from '../../domain/interfaces/IAgentRepository';
import { Agent, AgentConfig } from '../../domain/entities/Agent';
import { KnowledgeItem } from '../../domain/entities/KnowledgeSource';

export class CreateAgentUseCase {
  constructor(private agentRepository: IAgentRepository) {}

  async execute(config: AgentConfig, knowledge: KnowledgeItem[]): Promise<Agent> {
    const agent: Agent = {
      id: Math.random().toString(36).substring(2, 10),
      config,
      knowledge,
      createdAt: Date.now(),
    };
    await this.agentRepository.save(agent);
    return agent;
  }
}


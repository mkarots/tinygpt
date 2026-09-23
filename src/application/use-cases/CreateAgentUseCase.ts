import { IAgentRepository } from '../../domain/interfaces/IAgentRepository';
import { Agent, AgentConfig } from '../../domain/entities/Agent';
import { KnowledgeItem } from '../../domain/entities/KnowledgeSource';

export const MAX_KNOWLEDGE_CHARS = 200_000;

export class CreateAgentUseCase {
  constructor(
    private agentRepository: IAgentRepository,
    private generateId: () => string = () => crypto.randomUUID()
  ) {}

  async execute(
    config: AgentConfig,
    knowledge: KnowledgeItem[],
    existingId?: string
  ): Promise<Agent> {
    const totalChars = knowledge.reduce((sum, item) => sum + (item.content?.length ?? 0), 0);
    if (totalChars > MAX_KNOWLEDGE_CHARS) {
      throw new Error(
        `Knowledge is too large (${totalChars} characters). Keep the total under ${MAX_KNOWLEDGE_CHARS}.`
      );
    }

    const agent: Agent = {
      id: existingId || this.generateId(),
      config,
      knowledge,
      createdAt: Date.now(),
    };
    await this.agentRepository.save(agent);
    return agent;
  }
}

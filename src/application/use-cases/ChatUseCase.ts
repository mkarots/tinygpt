import { IAgentRepository } from '../../domain/interfaces/IAgentRepository';
import { ILLMService } from '../../domain/interfaces/ILLMService';
import { AgentConfig } from '../../domain/entities/Agent';
import { KnowledgeItem } from '../../domain/entities/KnowledgeSource';

export class ChatUseCase {
  constructor(
    private agentRepository: IAgentRepository,
    private llmService: ILLMService
  ) {}

  async execute(agentId: string, message: string): Promise<AsyncIterable<string>> {
    const agent = await this.agentRepository.getById(agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    return this.llmService.chat(message, agent.knowledge, agent.config);
  }

  async executePreview(config: AgentConfig, knowledge: KnowledgeItem[], message: string): Promise<AsyncIterable<string>> {
    return this.llmService.chat(message, knowledge, config);
  }
}



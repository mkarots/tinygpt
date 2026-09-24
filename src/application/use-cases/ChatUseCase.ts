import { IAgentRepository } from '../../domain/interfaces/IAgentRepository';
import { IChatRepository } from '../../domain/interfaces/IChatRepository';
import { ILLMService } from '../../domain/interfaces/ILLMService';
import { AgentConfig } from '../../domain/entities/Agent';
import { KnowledgeItem } from '../../domain/entities/KnowledgeSource';
import { ChatTurn } from '../../domain/entities/Chat';
import { selectRecentChatTurns } from '../../utils/chatHistory';

export interface HostedChatOptions {
  sessionId?: string;
}

export class ChatUseCase {
  constructor(
    private agentRepository: IAgentRepository,
    private llmService: ILLMService,
    private chatRepository?: IChatRepository
  ) {}

  async execute(
    agentId: string,
    message: string,
    history: ChatTurn[] = [],
    options: HostedChatOptions = {}
  ): Promise<AsyncIterable<string>> {
    const agent = await this.agentRepository.getById(agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    const sessionId = options.sessionId?.trim();
    if (!this.chatRepository || !sessionId) {
      return this.llmService.chat(message, agent.knowledge, agent.config, history);
    }

    const existing = await this.chatRepository.findByAgentAndSession(agentId, sessionId);
    const chat = existing ?? (await this.chatRepository.create(agentId, sessionId));
    const stored = await this.chatRepository.listMessages(chat.id, sessionId);
    const prior = selectRecentChatTurns(
      stored.map((turn) => ({ role: turn.role, text: turn.text })),
      message
    );
    await this.chatRepository.appendMessage(chat.id, 'user', message, sessionId);

    const stream = await this.llmService.chat(message, agent.knowledge, agent.config, prior);
    return this.captureModelReply(chat.id, sessionId, stream);
  }

  private async *captureModelReply(
    chatId: string,
    sessionId: string,
    stream: AsyncIterable<string>
  ): AsyncGenerator<string> {
    let full = '';
    for await (const chunk of stream) {
      full += chunk;
      yield chunk;
    }
    await this.chatRepository?.appendMessage(chatId, 'model', full, sessionId);
  }

  async executePreview(
    config: AgentConfig,
    knowledge: KnowledgeItem[],
    message: string,
    history: ChatTurn[] = []
  ): Promise<AsyncIterable<string>> {
    return this.llmService.chat(message, knowledge, config, history);
  }
}

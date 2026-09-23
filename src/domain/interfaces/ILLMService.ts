import { AgentConfig } from '../entities/Agent';
import { KnowledgeItem } from '../entities/KnowledgeSource';
import { ChatTurn } from '../entities/Chat';

export interface ILLMService {
  clean(text: string): Promise<string>;
  chat(
    message: string,
    knowledge: KnowledgeItem[],
    config: AgentConfig,
    history?: ChatTurn[]
  ): Promise<AsyncIterable<string>>;
}

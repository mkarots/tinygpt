import { AgentConfig } from '../entities/Agent';
import { KnowledgeItem } from '../entities/KnowledgeSource';

export interface ILLMService {
  clean(text: string): Promise<string>;
  chat(
    message: string,
    knowledge: KnowledgeItem[],
    config: AgentConfig
  ): Promise<AsyncIterable<string>>;
}


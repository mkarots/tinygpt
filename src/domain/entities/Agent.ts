import { KnowledgeItem } from './KnowledgeSource';

export interface AgentConfig {
  name: string;
  description: string;
  primaryColor: string;
  greeting: string;
  tone: 'professional' | 'friendly' | 'concise' | 'humorous';
  quickQuestions: string[] | { text: string; emoji: string }[];
}

export interface Agent {
  id: string;
  config: AgentConfig;
  knowledge: KnowledgeItem[];
  createdAt: number;
}


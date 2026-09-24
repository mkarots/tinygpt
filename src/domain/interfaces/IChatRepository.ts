export interface StoredChat {
  id: string;
  agentId: string;
  sessionId: string;
}

export interface StoredMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  createdAt: number;
}

export interface IChatRepository {
  findByAgentAndSession(agentId: string, sessionId: string): Promise<StoredChat | null>;
  create(agentId: string, sessionId: string): Promise<StoredChat>;
  appendMessage(chatId: string, role: 'user' | 'model', content: string, sessionId?: string): Promise<void>;
  listMessages(chatId: string, sessionId?: string): Promise<StoredMessage[]>;
}

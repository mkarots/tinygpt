import { SupabaseClient } from '@supabase/supabase-js';
import { IChatRepository, StoredChat, StoredMessage } from '../../domain/interfaces/IChatRepository';

interface MessageRow {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

export class SupabaseChatRepository implements IChatRepository {
  constructor(private supabase: SupabaseClient) {}

  async findByAgentAndSession(agentId: string, sessionId: string): Promise<StoredChat | null> {
    const { data, error } = await this.supabase.rpc('find_visitor_chat', {
      p_agent_id: agentId,
      p_session_id: sessionId,
    });
    if (error) throw new Error(`Failed to load chat: ${error.message}`);
    if (!data) return null;
    return { id: String(data), agentId, sessionId };
  }

  async create(agentId: string, sessionId: string): Promise<StoredChat> {
    const { data, error } = await this.supabase.rpc('ensure_visitor_chat', {
      p_agent_id: agentId,
      p_session_id: sessionId,
    });
    if (error || !data) {
      throw new Error(`Failed to create chat: ${error?.message ?? 'no row returned'}`);
    }
    return { id: String(data), agentId, sessionId };
  }

  async appendMessage(
    chatId: string,
    role: 'user' | 'model',
    content: string,
    sessionId?: string
  ): Promise<void> {
    const text = content.trim();
    if (!text) return;
    if (!sessionId) throw new Error('Failed to save message: session required');

    const { error } = await this.supabase.rpc('append_visitor_message', {
      p_chat_id: chatId,
      p_session_id: sessionId,
      p_role: role,
      p_content: text,
    });
    if (error) throw new Error(`Failed to save message: ${error.message}`);
  }

  async listMessages(chatId: string, sessionId?: string): Promise<StoredMessage[]> {
    if (!sessionId) return [];
    const { data, error } = await this.supabase.rpc('list_visitor_messages', {
      p_chat_id: chatId,
      p_session_id: sessionId,
    });
    if (error) throw new Error(`Failed to load messages: ${error.message}`);

    return ((data ?? []) as MessageRow[])
      .filter((row) => row.role === 'user' || row.role === 'model')
      .map((row) => ({
        id: row.id,
        role: row.role as 'user' | 'model',
        text: row.content,
        createdAt: new Date(row.created_at).getTime(),
      }));
  }
}

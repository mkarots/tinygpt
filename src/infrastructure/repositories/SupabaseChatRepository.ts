import { SupabaseClient } from '@supabase/supabase-js';
import { IChatRepository, StoredChat, StoredMessage } from '../../domain/interfaces/IChatRepository';

interface ChatRow {
  id: string;
  agent_id: string;
  session_id: string | null;
}

interface MessageRow {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

export class SupabaseChatRepository implements IChatRepository {
  constructor(private supabase: SupabaseClient) {}

  async findByAgentAndSession(agentId: string, sessionId: string): Promise<StoredChat | null> {
    const { data, error } = await this.supabase
      .from('chats')
      .select('id, agent_id, session_id')
      .eq('agent_id', agentId)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(1);

    if (error) throw new Error(`Failed to load chat: ${error.message}`);
    const row = (data?.[0] ?? null) as ChatRow | null;
    return row ? toChat(row) : null;
  }

  async create(agentId: string, sessionId: string): Promise<StoredChat> {
    const { data, error } = await this.supabase
      .from('chats')
      .insert({ agent_id: agentId, session_id: sessionId })
      .select('id, agent_id, session_id')
      .single();

    if (error || !data) {
      if (error?.code === '23505') {
        const existing = await this.findByAgentAndSession(agentId, sessionId);
        if (existing) return existing;
      }
      throw new Error(`Failed to create chat: ${error?.message ?? 'no row returned'}`);
    }

    return toChat(data as ChatRow);
  }

  async appendMessage(chatId: string, role: 'user' | 'model', content: string): Promise<void> {
    const text = content.trim();
    if (!text) return;

    const { error } = await this.supabase.from('messages').insert({
      chat_id: chatId,
      role,
      content: text,
    });

    if (error) throw new Error(`Failed to save message: ${error.message}`);
  }

  async listMessages(chatId: string): Promise<StoredMessage[]> {
    const { data, error } = await this.supabase
      .from('messages')
      .select('id, role, content, created_at')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

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

function toChat(row: ChatRow): StoredChat {
  return {
    id: row.id,
    agentId: row.agent_id,
    sessionId: row.session_id ?? '',
  };
}

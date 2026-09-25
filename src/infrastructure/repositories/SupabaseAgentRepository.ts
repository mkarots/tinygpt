import { SupabaseClient } from '@supabase/supabase-js';
import { IAgentRepository, OwnedAgentSummary } from '../../domain/interfaces/IAgentRepository';
import { Agent, AgentConfig } from '../../domain/entities/Agent';
import { KnowledgeItem } from '../../domain/entities/KnowledgeSource';
import { profileFromAuthUser } from '../../lib/profileFromAuthUser';
import { siteFromKnowledge } from '../../lib/agentList';

export class SupabaseAgentRepository implements IAgentRepository {
  constructor(private supabase: SupabaseClient) {}

  async save(agent: Agent): Promise<void> {
    const { data: authData, error: authError } = await this.supabase.auth.getUser();
    if (authError || !authData.user) {
      throw new Error('User not authenticated');
    }

    const user = authData.user;
    const { error: profileError } = await this.supabase
      .from('profiles')
      .upsert(profileFromAuthUser(user, new Date().toISOString()), { onConflict: 'id' });

    if (profileError) {
      throw new Error(`Failed to save profile: ${profileError.message}`);
    }

    const { error: agentError } = await this.supabase
      .from('agents')
      .upsert({
        id: agent.id,
        user_id: authData.user.id,
        name: agent.config.name,
        description: agent.config.description,
        config: agent.config,
        knowledge: agent.knowledge,
        updated_at: new Date().toISOString(),
      });

    if (agentError) throw new Error(`Failed to save agent: ${agentError.message}`);
  }

  async getById(id: string): Promise<Agent | null> {
    const owned = await this.supabase.from('agents').select('*').eq('id', id).maybeSingle();
    const agentData = !owned.error && owned.data
      ? owned.data
      : await this.publicAgent(id);

    if (!agentData) return null;

    const knowledge = Array.isArray(agentData.knowledge)
      ? (agentData.knowledge as KnowledgeItem[])
      : [];

    return {
      id: agentData.id,
      config: agentData.config as AgentConfig,
      knowledge,
      createdAt: new Date(agentData.created_at).getTime(),
    };
  }

  private async publicAgent(id: string) {
    const { data, error } = await this.supabase.rpc('get_public_agent', { agent_id: id });
    if (error) throw new Error(`Failed to load agent: ${error.message}`);
    return (Array.isArray(data) ? data[0] : data) ?? null;
  }

  async listByUser(userId: string): Promise<OwnedAgentSummary[]> {
    const { data: authData, error: authError } = await this.supabase.auth.getUser();
    if (authError || !authData.user || authData.user.id !== userId) {
      return [];
    }

    // Owner policy is the only table read. Filter on the session user as well.
    const { data, error } = await this.supabase
      .from('agents')
      .select('id, name, description, created_at, knowledge')
      .eq('user_id', authData.user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to list agents: ${error.message}`);
    }

    return (data ?? []).map((row) => ({
      id: String(row.id),
      name: typeof row.name === 'string' && row.name.length > 0 ? row.name : 'Untitled agent',
      description: typeof row.description === 'string' ? row.description : '',
      createdAt: typeof row.created_at === 'string' ? new Date(row.created_at).getTime() : 0,
      site: siteFromKnowledge(row.knowledge),
    }));
  }
}

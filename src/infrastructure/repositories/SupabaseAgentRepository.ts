import { SupabaseClient } from '@supabase/supabase-js';
import { IAgentRepository } from '../../domain/interfaces/IAgentRepository';
import { Agent, AgentConfig } from '../../domain/entities/Agent';
import { KnowledgeItem } from '../../domain/entities/KnowledgeSource';
import { profileFromAuthUser } from '../../lib/profileFromAuthUser';

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
    const { data: agentData, error: agentError } = await this.supabase
      .from('agents')
      .select('*')
      .eq('id', id)
      .single();

    if (agentError || !agentData) return null;

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
}

import { SupabaseClient } from '@supabase/supabase-js';
import { IAgentRepository, OwnedAgentSummary } from '../../domain/interfaces/IAgentRepository';
import { Agent, AgentConfig } from '../../domain/entities/Agent';
import { KnowledgeItem } from '../../domain/entities/KnowledgeSource';
import { profileFromAuthUser } from '../../lib/profileFromAuthUser';
import { siteFromKnowledge } from '../../lib/agentList';
import type { KnowledgeStatus } from '../../lib/knowledgeStatusLabel';
import { settleAbandonedImports } from '../../lib/settleAbandonedImports';

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
      .select('id, name, description, created_at, knowledge, config')
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
      website: websiteFromConfig(row.config),
      websiteSourceStatus: websiteSourceStatusFromKnowledge(
        websiteFromConfig(row.config),
        row.knowledge
      ),
      sourceStandings: sourceStandingsFromKnowledge(row.knowledge),
    }));
  }
}

function websiteFromConfig(config: unknown): string | null {
  if (!config || typeof config !== 'object') return null;
  const company = (config as { company?: { website?: unknown } }).company;
  if (!company || typeof company.website !== 'string') return null;
  const website = company.website.trim();
  return website.length > 0 ? website : null;
}

function sourceStandingsFromKnowledge(knowledge: unknown): KnowledgeStatus[] {
  return settledKnowledge(knowledge).map((item) => item.status);
}

/** Status of the url row whose host is this website. A saved pending row counts as Failed. */
function websiteSourceStatusFromKnowledge(
  website: string | null,
  knowledge: unknown
): KnowledgeStatus | null {
  const host = hostnameOf(website);
  if (!host) return null;
  const matches = settledKnowledge(knowledge).filter(
    (item) => item.type === 'url' && hostnameOf(item.name) === host
  );
  if (matches.some((item) => item.status === 'error')) return 'error';
  if (matches.some((item) => item.status === 'active')) return 'active';
  return null;
}

function settledKnowledge(knowledge: unknown): KnowledgeItem[] {
  if (!Array.isArray(knowledge)) return [];
  const items: KnowledgeItem[] = [];
  for (const item of knowledge) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Partial<KnowledgeItem>;
    if (row.status !== 'pending' && row.status !== 'active' && row.status !== 'error') continue;
    items.push({
      id: typeof row.id === 'string' ? row.id : 'source',
      type: row.type === 'file' || row.type === 'url' || row.type === 'text' ? row.type : 'text',
      name: typeof row.name === 'string' ? row.name : '',
      content: '',
      status: row.status,
      dateAdded: typeof row.dateAdded === 'number' ? row.dateAdded : 0,
      error: typeof row.error === 'string' ? row.error : undefined,
    });
  }
  // A saved pending row is not an in-flight import. Edit shows it as Failed.
  return settleAbandonedImports(items);
}

function hostnameOf(value: string | null): string | null {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed.includes('://') ? trimmed : `https://${trimmed}`);
    const host = url.hostname.replace(/^www\./, '').toLowerCase();
    return host || null;
  } catch {
    return null;
  }
}

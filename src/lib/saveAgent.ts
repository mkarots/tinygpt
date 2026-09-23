import { AgentConfig, KnowledgeItem } from '../../types';

export async function saveAgent(
  config: AgentConfig,
  knowledge: KnowledgeItem[],
  agentId?: string
): Promise<{ agentId: string; url: string }> {
  const response = await fetch('/api/agent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ config, knowledge, agentId }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Failed to save agent');
  }
  if (!data.agentId || !data.url) {
    throw new Error('Save succeeded but no agent URL was returned');
  }
  return { agentId: data.agentId, url: data.url };
}

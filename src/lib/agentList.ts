import { OwnedAgentSummary } from '../domain/interfaces/IAgentRepository';

/** Fill the builder website field only when the list site looks like a host. */
export function websiteFromSite(site: string | null): string {
  if (!site) return '';
  if (/^https?:\/\//i.test(site)) return site;
  if (/\s/.test(site) || !site.includes('.')) return '';
  return `https://${site}`;
}

/** Hostname or title from the first imported URL, if the list row has one. */
export function siteFromKnowledge(knowledge: unknown): string | null {
  if (!Array.isArray(knowledge)) return null;
  for (const item of knowledge) {
    if (!item || typeof item !== 'object') continue;
    const row = item as { type?: unknown; name?: unknown };
    if (row.type !== 'url') continue;
    if (typeof row.name === 'string' && row.name.trim()) {
      return row.name.trim();
    }
  }
  return null;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatAgentCreatedAt(createdAt: number): string {
  const date = new Date(createdAt);
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/**
 * Second line for rows that share a name. Prefer the site; fall back to the
 * created date. Unique names stay a single line.
 */
export function agentListSubtitle(
  agent: OwnedAgentSummary,
  agents: OwnedAgentSummary[]
): string | null {
  const sameName = agents.filter((row) => row.name === agent.name).length > 1;
  if (!sameName) return null;
  if (agent.site) return agent.site;
  if (agent.createdAt > 0) return formatAgentCreatedAt(agent.createdAt);
  return null;
}

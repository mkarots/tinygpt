import { knowledgeStatusLabel, type KnowledgeStatus } from './knowledgeStatusLabel';

/** One owned agent's website and source standings. AgentList does not read chat state. */
export interface AgentFact {
  id: string;
  ownerId: string;
  website: string | null;
  sourceStandings: KnowledgeStatus[];
}

export interface ListedAgent {
  id: string;
  siteLine: string;
  agentStanding: 'the agent has no knowledge' | 'Failed' | 'Importing' | 'Ready';
}

const NO_WEBSITE = 'there is no website';
const NO_KNOWLEDGE = 'the agent has no knowledge';

/**
 * Site line and agent standing for every agent that belongs to this owner.
 * Returns null when any fact belongs to someone else, and then no list is shown.
 */
export function showList(ownerId: string, facts: AgentFact[]): ListedAgent[] | null {
  if (facts.some((fact) => fact.ownerId !== ownerId)) return null;
  return facts.map((fact) => ({
    id: fact.id,
    siteLine: siteLine(fact.website),
    agentStanding: agentStanding(fact.sourceStandings),
  }));
}

function siteLine(website: string | null): string {
  const trimmed = website?.trim() ?? '';
  return trimmed.length > 0 ? trimmed : NO_WEBSITE;
}

function agentStanding(sourceStandings: KnowledgeStatus[]): ListedAgent['agentStanding'] {
  if (sourceStandings.length === 0) return NO_KNOWLEDGE;
  const words = sourceStandings.map((status) => knowledgeStatusLabel(status));
  if (words.some((word) => word === 'Failed')) return 'Failed';
  if (words.some((word) => word === 'Importing')) return 'Importing';
  return 'Ready';
}

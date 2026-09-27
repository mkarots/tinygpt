import { knowledgeStatusLabel, type KnowledgeStatus } from './knowledgeStatusLabel';

/** One owned agent's website and source standings. AgentList does not read chat state. */
export interface AgentFact {
  id: string;
  ownerId: string;
  website: string | null;
  /** Import status of the page for this website. Null when that page was not imported. */
  websiteSourceStatus: KnowledgeStatus | null;
  sourceStandings: KnowledgeStatus[];
}

export type StatusDot = 'green' | 'gray' | 'red' | 'blue';

export interface ListedAgent {
  id: string;
  /** Connected, Not setup yet, or Failed. */
  siteStatus: 'Connected' | 'Not setup yet' | 'Failed';
  /** Green Connected, gray Not setup yet, red Failed. */
  siteDot: 'green' | 'gray' | 'red';
  /** The website URL when one is set. */
  siteUrl: string | null;
  /** Not setup, Failed, Importing, or Ready. */
  agentStanding: 'Not setup' | 'Failed' | 'Importing' | 'Ready';
  /** Gray Not setup, red Failed, blue Importing, green Ready. */
  standingDot: 'gray' | 'red' | 'blue' | 'green';
}

/**
 * Website and knowledge standing for every agent that belongs to this owner.
 * Returns null when any fact belongs to someone else, and then no list is shown.
 */
export function showList(ownerId: string, facts: AgentFact[]): ListedAgent[] | null {
  if (facts.some((fact) => fact.ownerId !== ownerId)) return null;
  return facts.map((fact) => {
    const site = siteStanding(fact.website, fact.websiteSourceStatus);
    const knowledge = knowledgeStanding(fact.sourceStandings);
    return {
      id: fact.id,
      siteStatus: site.status,
      siteDot: site.dot,
      siteUrl: site.url,
      agentStanding: knowledge.status,
      standingDot: knowledge.dot,
    };
  });
}

function siteStanding(
  website: string | null,
  websiteSourceStatus: KnowledgeStatus | null
): { status: ListedAgent['siteStatus']; dot: ListedAgent['siteDot']; url: string | null } {
  const url = website?.trim() ?? '';
  if (!url) return { status: 'Not setup yet', dot: 'gray', url: null };
  if (websiteSourceStatus === 'error') return { status: 'Failed', dot: 'red', url };
  return { status: 'Connected', dot: 'green', url };
}

function knowledgeStanding(sourceStandings: KnowledgeStatus[]): {
  status: ListedAgent['agentStanding'];
  dot: ListedAgent['standingDot'];
} {
  if (sourceStandings.length === 0) return { status: 'Not setup', dot: 'gray' };
  const words = sourceStandings.map((status) => knowledgeStatusLabel(status));
  if (words.some((word) => word === 'Failed')) return { status: 'Failed', dot: 'red' };
  if (words.some((word) => word === 'Importing')) return { status: 'Importing', dot: 'blue' };
  return { status: 'Ready', dot: 'green' };
}

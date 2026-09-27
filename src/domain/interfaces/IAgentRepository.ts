import { Agent } from '../entities/Agent';

/** Row shown on the signed-in dashboard. Full knowledge text stays off this list. */
export interface OwnedAgentSummary {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  /** Imported page used only to tell same-named rows apart. Not the Edit website. */
  site: string | null;
  /** Website URL set on Edit. Empty when the owner did not set one. */
  website: string | null;
  sourceStandings: Array<'pending' | 'active' | 'error'>;
}

export interface IAgentRepository {
  save(agent: Agent): Promise<void>;
  getById(id: string): Promise<Agent | null>;
  listByUser(userId: string): Promise<OwnedAgentSummary[]>;
}


import { Agent } from '../entities/Agent';

/** Row shown on the signed-in dashboard. Knowledge stays off this list. */
export interface OwnedAgentSummary {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  site: string | null;
}

export interface IAgentRepository {
  save(agent: Agent): Promise<void>;
  getById(id: string): Promise<Agent | null>;
  listByUser(userId: string): Promise<OwnedAgentSummary[]>;
}


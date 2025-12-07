import { Agent } from '../entities/Agent';

export interface IAgentRepository {
  save(agent: Agent): Promise<void>;
  getById(id: string): Promise<Agent | null>;
}


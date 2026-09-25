import { Agent } from '../domain/entities/Agent';
import { IAgentRepository } from '../domain/interfaces/IAgentRepository';

/** Load an agent into the builder only when the signed-in user owns it. */
export async function ownedAgentForEdit(
  repo: Pick<IAgentRepository, 'listByUser' | 'getById'>,
  userId: string,
  agentId: string | undefined
): Promise<Agent | null> {
  if (!agentId) return null;
  const owned = await repo.listByUser(userId);
  if (!owned.some((row) => row.id === agentId)) return null;
  return repo.getById(agentId);
}

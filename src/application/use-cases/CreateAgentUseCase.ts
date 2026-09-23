import { IAgentRepository } from '../../domain/interfaces/IAgentRepository';
import { Agent, AgentConfig } from '../../domain/entities/Agent';
import { KnowledgeItem } from '../../domain/entities/KnowledgeSource';

export const MAX_KNOWLEDGE_CHARS = 200_000;

/** RFC 4122 UUID. Matches `agents.id uuid` in supa_schema.sql. */
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

export class CreateAgentUseCase {
  constructor(
    private agentRepository: IAgentRepository,
    private generateId: () => string = () => crypto.randomUUID()
  ) {}

  async execute(
    config: AgentConfig,
    knowledge: KnowledgeItem[],
    existingId?: string
  ): Promise<Agent> {
    const totalChars = knowledge.reduce((sum, item) => sum + (item.content?.length ?? 0), 0);
    if (totalChars > MAX_KNOWLEDGE_CHARS) {
      throw new Error(
        `Knowledge is too large (${totalChars} characters). Keep the total under ${MAX_KNOWLEDGE_CHARS}.`
      );
    }

    const id = existingId || this.generateId();
    if (!isUuid(id)) {
      throw new Error('Agent id must be a UUID');
    }

    const agent: Agent = {
      id,
      config,
      knowledge,
      createdAt: Date.now(),
    };
    await this.agentRepository.save(agent);
    return agent;
  }
}

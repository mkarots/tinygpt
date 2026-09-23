import { KnowledgeItem } from '../domain/entities/KnowledgeSource';

export function buildKnowledgeContext(knowledge: KnowledgeItem[]): string {
  return knowledge
    .filter((item) => item.status === 'active')
    .map((item) => `--- SOURCE: ${item.name} (${item.type}) ---\n${item.content}\n--- END SOURCE ---`)
    .join('\n\n');
}

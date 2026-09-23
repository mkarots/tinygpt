import { KnowledgeItem } from '../../types';

export function createTextKnowledgeItem(
  title: string,
  content: string,
  options?: { id?: string; now?: number }
): KnowledgeItem | null {
  const name = title.trim();
  const body = content.trim();
  if (!name || !body) return null;

  return {
    id: options?.id ?? crypto.randomUUID(),
    type: 'text',
    name,
    content: body,
    status: 'active',
    dateAdded: options?.now ?? Date.now(),
  };
}

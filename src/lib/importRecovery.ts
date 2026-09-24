export interface KnowledgeStatus {
  type: string;
  status: string;
}

export function needsImportRecovery(items: KnowledgeStatus[]): boolean {
  return items.some((item) => item.type === 'url' && item.status === 'error');
}

export function hasUsableKnowledge(items: KnowledgeStatus[]): boolean {
  return items.some((item) => item.status === 'active');
}

/** A failed site import with nothing saved yet should not advance on Next alone. */
export function blocksKnowledgeStep(items: KnowledgeStatus[]): boolean {
  return needsImportRecovery(items) && !hasUsableKnowledge(items);
}

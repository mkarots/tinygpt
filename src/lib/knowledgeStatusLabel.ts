export type KnowledgeStatus = 'pending' | 'active' | 'error';

/** Row badge for onboarding and the knowledge tab. */
export function knowledgeStatusLabel(status: KnowledgeStatus): 'Failed' | 'Importing' | 'Ready' {
  if (status === 'error') return 'Failed';
  if (status === 'pending') return 'Importing';
  return 'Ready';
}

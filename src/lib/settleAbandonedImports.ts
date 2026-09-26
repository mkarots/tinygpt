import type { KnowledgeItem } from '../../types';

/** Shop-owner copy when a pending row is reopened with no crawl in flight. */
export const ABANDONED_IMPORT_ERROR =
  "Import didn't finish. Try again, or remove it.";

/**
 * Pending is only valid while a crawl request is in flight in this session.
 * Rows saved (or reopened) as pending are abandoned — treat them as Failed.
 */
export function settleAbandonedImports(items: KnowledgeItem[]): KnowledgeItem[] {
  return items.map((item) => {
    if (item.status !== 'pending') return item;
    return {
      ...item,
      status: 'error' as const,
      error: item.error?.trim() ? item.error : ABANDONED_IMPORT_ERROR,
    };
  });
}

/** Rebuild a crawl URL from a saved url row (name is the hostname). */
export function websiteRetryUrl(
  item: Pick<KnowledgeItem, 'type' | 'name'>
): string | null {
  if (item.type !== 'url') return null;
  const host = item.name.trim();
  if (!host) return null;
  try {
    const url = new URL(host.includes('://') ? host : `https://${host}`);
    if (!url.hostname) return null;
    return url.toString();
  } catch {
    return null;
  }
}

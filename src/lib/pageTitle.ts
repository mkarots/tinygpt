export const TINYGPT_DOCUMENT_TITLE = 'TinyGPT';

/** Tab title in the owner-page pattern: `Label · TinyGPT`. No label stays TinyGPT. */
export function documentTitle(label?: string | null): string {
  const trimmed = label?.trim() ?? '';
  if (!trimmed) return TINYGPT_DOCUMENT_TITLE;
  return `${trimmed} · ${TINYGPT_DOCUMENT_TITLE}`;
}

/**
 * Public chat and embed titles. A missing id, missing agent, blank name, or
 * failed lookup falls back to TinyGPT and does not throw.
 */
export async function documentTitleForAgent(
  agentId: string | undefined,
  lookup: (id: string) => Promise<string | null>,
): Promise<string> {
  const id = agentId?.trim() ?? '';
  if (!id) return documentTitle(null);
  try {
    return documentTitle(await lookup(id));
  } catch {
    return documentTitle(null);
  }
}

export const DEFAULT_ASSISTANT_NAME = 'Support Bot';

/** Names the wizard used to treat as "not chosen yet". */
const UNTOUCHED_NAMES = new Set([DEFAULT_ASSISTANT_NAME, 'Tiny Support Assistant', '']);

export function derivedAssistantName(companyName: string): string {
  const company = companyName.trim();
  return company ? `${company} Assistant` : DEFAULT_ASSISTANT_NAME;
}

/**
 * Fill Assistant Name from the company while it is still the default or the
 * name we derived from the previous company value. A hand-edited name stays.
 */
export function assistantNameForCompany(
  companyName: string,
  currentAssistantName: string,
  previousCompanyName = ''
): string {
  const current = currentAssistantName.trim();
  const stillAutomatic =
    UNTOUCHED_NAMES.has(current) || current === derivedAssistantName(previousCompanyName);
  if (!stillAutomatic) return currentAssistantName;
  return derivedAssistantName(companyName);
}

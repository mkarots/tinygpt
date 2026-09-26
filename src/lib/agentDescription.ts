/** Saved on many early agents; hide it on the list so rows are not identical. */
export const BOILERPLATE_AGENT_DESCRIPTION = 'A helpful assistant for our customers.';

export function isBoilerplateAgentDescription(description: string): boolean {
  const trimmed = description.trim();
  return !trimmed || trimmed === BOILERPLATE_AGENT_DESCRIPTION;
}

/** Short line for the agent list when the company name is known. */
export function derivedAgentDescription(companyName: string): string {
  const company = companyName.trim();
  return company ? `Answers questions about ${company}.` : '';
}

/**
 * Fill description from the company while it is still blank, boilerplate, or
 * the line derived from the previous company. A hand-edited description stays.
 */
export function agentDescriptionForCompany(
  companyName: string,
  currentDescription: string,
  previousCompanyName = ''
): string {
  const current = currentDescription.trim();
  const stillAutomatic =
    isBoilerplateAgentDescription(current) ||
    current === derivedAgentDescription(previousCompanyName);
  if (!stillAutomatic) return currentDescription;
  return derivedAgentDescription(companyName);
}

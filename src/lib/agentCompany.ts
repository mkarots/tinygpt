import type { Agent } from '../domain/entities/Agent';
import { siteFromKnowledge, websiteFromSite } from './agentList';
import { derivedAssistantName } from './assistantName';
import type { AgentConfig, CompanyInfo, KnowledgeItem } from '../../types';

export type StoredCompany = {
  name: string;
  website: string;
  industry: string;
};

export function companyNameFromAssistant(assistantName: string): string {
  const derivedPrefix = assistantName.endsWith(' Assistant')
    ? assistantName.slice(0, -' Assistant'.length).trim()
    : '';
  if (derivedPrefix && derivedAssistantName(derivedPrefix) === assistantName) {
    return derivedPrefix;
  }
  return '';
}

export function storedCompanyFromConfig(config: { company?: StoredCompany | null }): StoredCompany | null {
  const company = config.company;
  if (!company || typeof company !== 'object') return null;
  const name = typeof company.name === 'string' ? company.name : '';
  const website = typeof company.website === 'string' ? company.website : '';
  const industry = typeof company.industry === 'string' ? company.industry : '';
  if (!name && !website && !industry) return null;
  return { name, website, industry };
}

/** Prefill the editor from saved company fields, then from name and imported pages. */
export function companyInfoFromAgent(
  agent: Pick<Agent, 'config' | 'knowledge'> | { config: AgentConfig; knowledge: KnowledgeItem[] }
): CompanyInfo {
  const stored = storedCompanyFromConfig(agent.config);
  const site = websiteFromSite(siteFromKnowledge(agent.knowledge));
  return {
    name: stored?.name || companyNameFromAssistant(agent.config.name),
    website: stored?.website || site,
    industry: stored?.industry || '',
  };
}

export function configWithCompany(config: AgentConfig, company: CompanyInfo): AgentConfig {
  return {
    ...config,
    company: {
      name: company.name.trim(),
      website: company.website.trim(),
      industry: company.industry.trim(),
    },
  };
}
